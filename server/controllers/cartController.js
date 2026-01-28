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

// @desc    Add Item to Cart (Handles Variants)
// @route   POST /api/cart/add
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity, variant } = req.body; 
    const qty = Number(quantity);

    // 1. Fetch Product to get current price
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Determine Price: If a variant matches the requested variant string, use that price
    let price = product.price;
    if (product.variants && product.variants.length > 0) {
      const matchedVariant = product.variants.find(v => (v.label || v.unit) === variant);
      if (matchedVariant && matchedVariant.price) {
        price = matchedVariant.price;
      } else {
        // Fallback to first variant price if specific variant not found/has no price
        price = product.variants[0].price;
      }
    }

    // 2. Find Cart for User
    let cart = await Cart.findOne({ user: req.user.id });

    if (cart) {
      // Check if product AND variant already exist
      const itemIndex = cart.items.findIndex((item) => 
        item.product.toString() === productId && item.variant === variant
      );

      if (itemIndex > -1) {
        // Update existing item quantity
        const newQuantity = cart.items[itemIndex].quantity + qty;
        if (newQuantity <= 0) {
          cart.items.splice(itemIndex, 1);
        } else {
          cart.items[itemIndex].quantity = newQuantity;
        }
      } else {
        // New item: Push with variant info
        if (qty > 0) {
          cart.items.push({ product: productId, quantity: qty, price, variant });
        }
      }
    } else {
      // Create new cart
      if (qty > 0) {
        cart = await Cart.create({
          user: req.user.id,
          items: [{ product: productId, quantity: qty, price, variant }],
        });
      } else {
        return res.status(400).json({ success: false, message: "Invalid quantity" });
      }
    }

    // 3. Recalculate Total & Save
    if (cart) {
      cart.totalAmount = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
      await cart.save();
      
      const populatedCart = await Cart.findById(cart._id).populate("items.product", "name images slug");
      res.status(200).json({ success: true, message: "Cart updated", data: populatedCart });
    } else {
      res.status(200).json({ success: true, items: [], totalAmount: 0 });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove Item from Cart
// @route   DELETE /api/cart/:itemId
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Filter by unique Item ID (MongoDB _id of the item inside the array)
    cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);

    cart.totalAmount = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate("items.product", "name images slug");
    res.status(200).json({ success: true, data: populatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};