// backend/controllers/orderController.js
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const sendEmail = require("../utils/sendEmail"); //

const Product = require("../models/productModel");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay Order ID
// @route   POST /api/orders/create-order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "No items in cart" });
    }

    const totalAmount = cart.totalAmount;
    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Payment & Save Order
// @route   POST /api/orders/verify-payment
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingAddress
    } = req.body;

    // 1. Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid Signature" });
    }

    // 2. Fetch Cart
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    // 3. Construct Order Items
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.images[0] || "",
      price: item.price,
      quantity: item.quantity,
      variant: item.variant
    }));

    // 4. Create Order in DB
    const order = await Order.create({
      user: req.user.id,
      orderItems,
      shippingAddress,
      paymentInfo: {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
      totalAmount: cart.totalAmount,
      orderStatus: "Processing"
    });

    // 5. Clear Cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    // ---------------------------------------------------------
    // EMAIL NOTIFICATION LOGIC (HTML TABLE FORMAT)
    // ---------------------------------------------------------
    try {
      // Helper to generate the HTML Table Row for each product
      const productRows = orderItems.map(item => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px; font-family: sans-serif; color: #333;">
            <strong>${item.name}</strong>
            <br/>
            <span style="font-size: 12px; color: #777;">Variant: ${item.variant || "Standard"}</span>
          </td>
          <td style="padding: 12px; font-family: sans-serif; color: #333; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 12px; font-family: sans-serif; color: #333; text-align: right;">
            ₹${item.price}
          </td>
        </tr>
      `).join("");

      // HTML Template
      const htmlTemplate = (recipientName, isUser = true) => `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          
          <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0; font-size: 24px;">
              ${isUser ? "Order Confirmed!" : "New Order Received"}
            </h2>
            <p style="color: #e0e7ff; margin: 5px 0 0 0; font-size: 14px;">
              Order ID: #${order._id}
            </p>
          </div>

          <div style="padding: 20px;">
            <p style="font-size: 16px; color: #333;">
              Hello ${recipientName},
            </p>
            <p style="color: #555; line-height: 1.5;">
              ${isUser 
                ? "Thank you for shopping with us. We have received your order and it is being processed." 
                : `You have received a new order from <strong>${req.user.name}</strong>.`}
            </p>

            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr style="background-color: #f8fafc; text-align: left;">
                  <th style="padding: 12px; border-bottom: 2px solid #e2e8f0; font-size: 14px; color: #64748b;">Product</th>
                  <th style="padding: 12px; border-bottom: 2px solid #e2e8f0; font-size: 14px; color: #64748b; text-align: center;">Qty</th>
                  <th style="padding: 12px; border-bottom: 2px solid #e2e8f0; font-size: 14px; color: #64748b; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${productRows}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 15px; text-align: right; font-weight: bold; color: #333;">Total Amount:</td>
                  <td style="padding: 15px; text-align: right; font-weight: bold; color: #4f46e5; font-size: 18px;">₹${order.totalAmount}</td>
                </tr>
              </tfoot>
            </table>

            <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin-top: 25px;">
              <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Shipping Address</h3>
              <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6;">
                <strong>${req.user.name}</strong><br/>
                ${shippingAddress.address}<br/>
                ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}<br/>
                Phone: ${shippingAddress.phone}
              </p>
            </div>
          </div>

          <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
            <p style="margin: 0;">Need help? Contact our support.</p>
            <p style="margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
          </div>
        </div>
      `;

      // B. Send Email to USER
      await sendEmail({
        email: req.user.email,
        subject: `Order Confirmed: ${order._id}`,
        message: `Your order ${order._id} of ₹${order.totalAmount} has been placed successfully.`, // Fallback text
        html: htmlTemplate(req.user.name, true), // Pass HTML
      });

      // C. Send Email to ADMIN
      await sendEmail({
        email: process.env.SMTP_USER,
        subject: `New Order Received: ${order._id}`,
        message: `New order ${order._id} received from ${req.user.name}.`, // Fallback text
        html: htmlTemplate("Admin", false), // Pass HTML
      });

      console.log("HTML Emails sent to User and Admin successfully.");

    } catch (emailError) {
      console.error("Email Sending Failed:", emailError.message);
      // Logic continues even if email fails
    }
    // ---------------------------------------------------------

    // --- SOCKET.IO NOTIFICATION ---
    const io = req.app.get("io");
    if(io) {
      io.emit("newOrder", {
        _id: order._id,
        customerName: req.user.name,
        amount: order.totalAmount,
        createdAt: new Date()
      });
    }
    // ------------------------------

    res.status(201).json({ success: true, message: "Order placed successfully", order });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ... (Rest of your controller functions: getUserOrders, getAllOrders, etc. remain unchanged)
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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

exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (order.orderStatus !== "Processing") {
      return res.status(400).json({ success: false, message: `Cannot cancel order. Current status: ${order.orderStatus}` });
    }

    if (!reason) return res.status(400).json({ success: false, message: "Cancellation reason is required" });

    order.orderStatus = "Cancelled";
    order.cancellationReason = reason;
    await order.save();

    res.status(200).json({ success: true, message: "Order cancelled successfully", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// @desc    Get Admin Dashboard Statistics
// @route   GET /api/orders/admin/stats
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. General Order Stats (Revenue, Cancelled, etc.)
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: { $cond: [{ $ne: ["$orderStatus", "Cancelled"] }, "$totalAmount", 0] },
          },
          totalCancelledOrders: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "Cancelled"] }, 1, 0] },
          },
          totalCancelledAmount: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "Cancelled"] }, "$totalAmount", 0] },
          },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    // 2. Product Sales Stats (Most Sold)
    const productSales = await Order.aggregate([
      { $match: { orderStatus: { $ne: "Cancelled" } } },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          name: { $first: "$orderItems.name" },
          image: { $first: "$orderItems.image" },
          totalSold: { $sum: "$orderItems.quantity" },
          totalRevenueGenerated: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } }
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    // 3. Unsold Products
    const soldProductIds = await Order.distinct("orderItems.product", { orderStatus: { $ne: "Cancelled" } });
    const unsoldProducts = await Product.find({ _id: { $nin: soldProductIds } })
      .select("name images category price brand")
      .limit(5);

    // 4. Recent Orders
    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    // --- NEW: 5. Sales Trend (Last 7 Days) for Charts ---
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const salesTrend = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
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

    res.status(200).json({
      success: true,
      stats: orderStats[0] || { totalRevenue: 0, totalCancelledOrders: 0, totalCancelledAmount: 0, totalOrders: 0 },
      topProducts: productSales,
      unsoldProducts,
      recentOrders,
      salesTrend // <--- Sending this to frontend
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
