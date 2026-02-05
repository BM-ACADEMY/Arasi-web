const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const StoreSettings = require("../models/storeSettingsModel");
const sendEmail = require("../utils/sendEmail");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── HELPERS ──
const getWeightInKg = (weight, unit) => {
  const w = parseFloat(weight) || 0;
  switch (unit?.toLowerCase()) {
    case 'g':
    case 'ml':
      return w / 1000;
    case 'kg':
    case 'l':
      return w;
    default:
      return w;
  }
};

const calculateOrderCosts = async (cartItems, cartTotal, state) => {
  let settings = await StoreSettings.findOne() || {
    gstRate: 0,
    shippingCharges: [],
    defaultShippingCharge: 0
  };

  const gstRate = settings.gstRate || 0;
  let totalWeightKg = 0;

  for (const item of cartItems) {
    const product = item.product;
    const selectedVariant = product.variants?.find(v => v._id.toString() === item.variant?.toString()) || product.variants?.[0];

    if (selectedVariant?.weight) {
      totalWeightKg += getWeightInKg(selectedVariant.weight, selectedVariant.weightUnit) * item.quantity;
    }
  }

  let shippingCost = settings.defaultShippingCharge || 0;

  if (state && settings.shippingCharges?.length) {
    const stateRule = settings.shippingCharges.find(
      s => s.state?.toLowerCase().trim() === state.toLowerCase().trim()
    );

    if (stateRule) {
      if (stateRule.tiers?.length) {
        const sortedTiers = [...stateRule.tiers].sort((a, b) => a.limit - b.limit);
        const matchingTier = sortedTiers.find(t => totalWeightKg <= t.limit);
        shippingCost = matchingTier ? matchingTier.price : sortedTiers[sortedTiers.length - 1].price;
      } else if (stateRule.charge !== undefined) {
        shippingCost = stateRule.charge;
      }
    }
  }

  const taxAmount = Math.round((cartTotal * gstRate) / 100);
  const totalAmount = cartTotal + taxAmount + shippingCost;

  return {
    itemsPrice: cartTotal,
    taxPrice: taxAmount,
    shippingPrice: shippingCost,
    totalAmount,
    gstRate,
    totalWeight: totalWeightKg
  };
};

// ── CREATE RAZORPAY ORDER ──
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { shippingState } = req.body;

    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
    if (!cart || !cart.items?.length) {
      return res.status(400).json({ success: false, message: "No items in cart" });
    }

    const costs = await calculateOrderCosts(cart.items, cart.totalAmount, shippingState);

    const options = {
      amount: costs.totalAmount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(200).json({ success: true, order: razorpayOrder, costs });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── VERIFY PAYMENT & CREATE ORDER + SEND EMAILS ──
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingAddress
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    // Get cart
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
    if (!cart || !cart.items?.length) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Recalculate costs (security)
    const costs = await calculateOrderCosts(cart.items, cart.totalAmount, shippingAddress.state);

    // Prepare order items with better variant info
    const orderItems = cart.items.map((item) => {
      const variantObj = item.product.variants?.find(v => v._id.toString() === item.variant?.toString());
      return {
        product: item.product._id,
        name: item.product.name,
        image: item.product.images?.[0] || "",
        price: item.price,
        quantity: item.quantity,
        variant: item.variant,
        variantLabel: variantObj ? (variantObj.label || variantObj.unit || `${variantObj.weight}${variantObj.weightUnit || 'g'}`) : "Standard"
      };
    });

    // Create order
    const order = await Order.create({
      user: req.user.id,
      orderItems,
      shippingAddress,
      paymentInfo: {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
      itemsPrice: costs.itemsPrice,
      taxPrice: costs.taxPrice,
      shippingPrice: costs.shippingPrice,
      totalAmount: costs.totalAmount,
      orderStatus: "Processing"
    });

    // Clear cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    // ── EMAIL SENDING ──
    try {
      // Beautiful product rows for email
      const productRows = orderItems.map(item => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px; font-family: sans-serif; color: #333;">
            <strong>${item.name}</strong><br/>
            <span style="font-size: 12px; color: #777;">Variant: ${item.variantLabel || "Standard"}</span>
          </td>
          <td style="padding: 12px; font-family: sans-serif; color: #333; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; font-family: sans-serif; color: #333; text-align: right;">₹${item.price.toLocaleString()}</td>
        </tr>
      `).join("");

      // Shared email template (used for both user & admin)
      const htmlTemplate = (recipientName, isUser = true) => `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
          <div style="background: #000; color: white; padding: 30px 20px; text-align: center;">
            <h2 style="margin: 0; font-size: 28px;">${isUser ? "Thank You! Order Confirmed" : "New Order Received"}</h2>
            <p style="margin: 8px 0 0; font-size: 15px; margin-bottom: 20px; opacity: 0.9;">
                Order ID: <strong>#${order._id.toString().slice(-8).toUpperCase()}</strong>
              </p>

              <p style="margin: 8px 0 0; font-size: 15px; opacity: 0.9;">
                GST: <strong>34CQMPS5041M1ZB</strong>
              </p>

          </div>

          <div style="padding: 30px 24px;">
            <p style="font-size: 16px; color: #222; margin: 0 0 20px;">
              Hello <strong>${recipientName}</strong>,
            </p>

            <p style="color: #555; line-height: 1.6; margin: 0 0 24px;">
              ${isUser
                ? "Your order has been successfully placed. We're preparing it with care."
                : `A new order has been placed by <strong>${req.user.name}</strong> (${req.user.email}).`}
            </p>

            <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 12px; text-align: left; font-size: 14px; color: #555; border-bottom: 2px solid #ddd;">Item</th>
                  <th style="padding: 12px; text-align: center; font-size: 14px; color: #555; border-bottom: 2px solid #ddd;">Qty</th>
                  <th style="padding: 12px; text-align: right; font-size: 14px; color: #555; border-bottom: 2px solid #ddd;">Price</th>
                </tr>
              </thead>
              <tbody>${productRows}</tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold; color: #333;">Subtotal:</td>
                  <td style="padding: 12px; text-align: right; font-weight: bold;">₹${costs.itemsPrice.toLocaleString()}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 12px; text-align: right; color: #555;">GST (${costs.gstRate}%):</td>
                  <td style="padding: 12px; text-align: right;">+₹${costs.taxPrice.toLocaleString()}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 12px; text-align: right; color: #555;">Shipping:</td>
                  <td style="padding: 12px; text-align: right;">
                    ${costs.shippingPrice === 0 ? "Free" : "+₹" + costs.shippingPrice.toLocaleString()}
                  </td>
                </tr>
                <tr style="border-top: 3px double #000;">
                  <td colspan="2" style="padding: 16px 12px; text-align: right; font-size: 18px; font-weight: bold; color: #000;">Total Amount:</td>
                  <td style="padding: 16px 12px; text-align: right; font-size: 20px; font-weight: bold; color: #000;">
                    ₹${costs.totalAmount.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>

            ${isUser ? `
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 24px 0;">
              <h3 style="margin: 0 0 12px; font-size: 15px; color: #444; text-transform: uppercase; letter-spacing: 0.5px;">
                Shipping Address
              </h3>
              <p style="margin: 0; color: #333; line-height: 1.6;">
                <strong>${req.user.name}</strong><br/>
                ${shippingAddress.address}<br/>
                ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}<br/>
                Phone: ${shippingAddress.phone}
              </p>
            </div>
            ` : ''}

            <p style="text-align: center; color: #777; font-size: 13px; margin: 30px 0 10px;">
              ${isUser
                ? "We'll notify you once your order ships. Thank you for shopping with us!"
                : "Please process this order at your earliest convenience."}
            </p>
          </div>

          <div style="background: #f8f9fa; padding: 16px; text-align: center; font-size: 12px; color: #666;">
            © ${new Date().getFullYear()} Arasi Soaps | All rights reserved.
          </div>
        </div>
      `;

      // Send to customer
      await sendEmail({
        email: req.user.email,
        subject: `Order Confirmed - #${order._id.toString().slice(-8)}`,
        message: `Your order #${order._id} has been placed successfully. Total: ₹${costs.totalAmount}`,
        html: htmlTemplate(req.user.name || "Customer", true),
      });

      // Send to admin/store owner
      await sendEmail({
        email: process.env.SMTP_USER || "your-admin-email@example.com",
        subject: `New Order Received - #${order._id.toString().slice(-8)}`,
        message: `New order #${order._id} from ${req.user.name} (${req.user.email}). Total: ₹${costs.totalAmount}`,
        html: htmlTemplate("Admin / Store Team", false),
      });

      console.log("Order confirmation emails sent successfully");
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail the order — just log
    }

    // Real-time notification (if you have socket.io)
    const io = req.app.get("io");
    if (io) {
      io.emit("newOrder", {
        _id: order._id,
        customerName: req.user.name,
        amount: order.totalAmount,
        createdAt: new Date()
      });
    }

    res.status(201).json({ success: true, message: "Order placed successfully", order });
  } catch (error) {
    console.error("Order Verification Error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};



// @desc    Get logged in user orders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate({
        path: "orderItems.product",
        select: "name images slug variants"   // ← IMPORTANT: populate variants!
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Get all orders (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (req.body.status) {
      order.orderStatus = req.body.status;
      if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
      } else {
        order.deliveredAt = undefined;
      }
    }
    await order.save();
    res.status(200).json({ success: true, message: "Status updated", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel Order (User)
// @desc    Cancel Order (User)
exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (order.orderStatus !== "Processing") {
      return res.status(400).json({ success: false, message: `Cannot cancel order. Status: ${order.orderStatus}` });
    }

    if (!reason) return res.status(400).json({ success: false, message: "Reason required" });

    order.orderStatus = "Cancelled";
    order.cancellationReason = reason;

    // FIX: Added closing parenthesis and semicolon below
    await order.save();

    res.status(200).json({ success: true, message: "Order cancelled", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ... existing imports

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. General Stats (Updated to include totalCancelledAmount)
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: {
            // Sum only if status is NOT Cancelled
            $sum: { $cond: [{ $ne: ["$orderStatus", "Cancelled"] }, "$totalAmount", 0] },
          },
          totalCancelledOrders: {
            // Count if status IS Cancelled
            $sum: { $cond: [{ $eq: ["$orderStatus", "Cancelled"] }, 1, 0] },
          },
          totalCancelledAmount: {
            // <--- NEW: Sum amount if status IS Cancelled
            $sum: { $cond: [{ $eq: ["$orderStatus", "Cancelled"] }, "$totalAmount", 0] },
          },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    // 2. Top Selling Products
    const productSales = await Order.aggregate([
      { $match: { orderStatus: { $ne: "Cancelled" } } },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          name: { $first: "$orderItems.name" },
          totalSold: { $sum: "$orderItems.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    // 3. Sales Trend
    const salesTrend = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          orderStatus: { $ne: "Cancelled" }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          dailyRevenue: { $sum: "$totalAmount" },
          dailyOrders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 4. Recent Orders
    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    // 5. Unsold Products
    const distinctSoldProductIds = await Order.distinct("orderItems.product", {
       orderStatus: { $ne: "Cancelled" }
    });

    const unsoldProducts = await Product.find({
      _id: { $nin: distinctSoldProductIds },
      isActive: true
    })
    .select("name brand images price")
    .limit(5);

    res.status(200).json({
      success: true,
      // Default values added for safety
      stats: orderStats[0] || {
        totalRevenue: 0,
        totalCancelledOrders: 0,
        totalCancelledAmount: 0,
        totalOrders: 0
      },
      topProducts: productSales,
      salesTrend,
      recentOrders,
      unsoldProducts
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.calculateCosts = async (req, res) => {
  try {
    const { shippingState } = req.body;

    if (!shippingState) {
      return res.status(400).json({
        success: false,
        message: "shippingState is required"
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id })
      .populate({
        path: "items.product",
        select: "name variants weight weightUnit" // only needed fields
      });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    // Reuse the same cost calculation logic you already have
    const costs = await calculateOrderCosts(
      cart.items,
      cart.totalAmount,
      shippingState
    );

    res.status(200).json({
      success: true,
      costs: {
        subtotal: costs.itemsPrice,
        gst: costs.taxPrice,
        shipping: costs.shippingPrice,
        totalWeight: costs.totalWeight,
        total: costs.totalAmount
      }
    });
  } catch (error) {
    console.error("Calculate costs error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error"
    });
  }
};
