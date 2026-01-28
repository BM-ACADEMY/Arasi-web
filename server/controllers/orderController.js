const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
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

    // Calculate Total securely on backend
    const totalAmount = cart.totalAmount;

    const options = {
      amount: totalAmount * 100, // Amount in paise (multiply by 100)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order, 
    });
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

    // 2. Fetch Cart Items
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

    res.status(201).json({ success: true, message: "Order placed successfully", order });

  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getUserOrders = async (req, res) => {
  try {
    // Find orders where 'user' matches the logged-in user ID
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ... existing imports and functions

// @desc    Get All Orders (Admin)
// @route   GET /api/orders/admin/all-orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email") // Show who placed the order
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Order Status (Admin)
// @route   PUT /api/orders/admin/order/:id
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (req.body.status) {
      order.orderStatus = req.body.status;
      if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
      } else {
        order.deliveredAt = undefined; // Reset if changed back
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
    const { reason } = req.body; // <--- Get reason from request body

    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.orderStatus !== "Processing") {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot cancel order. Current status: ${order.orderStatus}` 
      });
    }

    if (!reason) {
       return res.status(400).json({ success: false, message: "Cancellation reason is required" });
    }

    order.orderStatus = "Cancelled";
    order.cancellationReason = reason; // <--- Save the reason
    await order.save();

    res.status(200).json({ success: true, message: "Order cancelled successfully", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};