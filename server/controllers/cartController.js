const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

// @desc    Get User Cart
// @route   GET /api/cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product",
      "name images slug category brand"
    );

    if (!cart) {
      return res.status(200).json({ success: true, items: [], totalAmount: 0 });
    }

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add Item to Cart
// @route   POST /api/cart/add
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qty = Number(quantity);

    // 1. Fetch Product to get current price
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Use the first variant price or a base price
    const price = product.variants && product.variants.length > 0
      ? product.variants[0].price
      : 0; // fallback

    // 2. Find Cart for User
    let cart = await Cart.findOne({ user: req.user.id });

    if (cart) {
      // Check if product already exists in cart
      const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

      if (itemIndex > -1) {
        // Product exists, update quantity
        cart.items[itemIndex].quantity += qty;
      } else {
        // Product does not exist, push to items
        cart.items.push({ product: productId, quantity: qty, price });
      }
    } else {
      // Create new cart
      cart = await Cart.create({
        user: req.user.id,
        items: [{ product: productId, quantity: qty, price }],
      });
    }

    // 3. Recalculate Total Amount
    cart.totalAmount = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);

    await cart.save();

    // Populate for frontend response
    const populatedCart = await Cart.findById(cart._id).populate("items.product", "name images slug");

    res.status(200).json({ success: true, message: "Added to cart", data: populatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove Item from Cart
// @route   DELETE /api/cart/:itemId
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);

    // Recalculate Total
    cart.totalAmount = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);

    await cart.save();

    // Return full cart so frontend updates instantly
    const populatedCart = await Cart.findById(cart._id).populate("items.product", "name images slug");

    res.status(200).json({ success: true, data: populatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
