const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

// @desc    Get User Cart
// @route   GET /api/cart
exports.getCart = async (req, res) => {
  try {
    // FIX: Added "variants" to populate so frontend can look up labels by ID
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product",
      "name images slug category brand variants" 
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

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    let selectedVariant = null;
    let price = product.price || 0;

    // 1. Resolve Variant (Handle both ID or Label inputs)
    if (product.variants?.length > 0) {
      // Try to find by _id first (preferred), then by label/unit
      selectedVariant = product.variants.find(v => 
        String(v._id) === String(variant) || 
        v.label === variant || 
        v.unit === variant
      );

      if (selectedVariant) {
        price = selectedVariant.price || price;
      } else {
        // Fallback to first variant if valid one not found
        selectedVariant = product.variants[0];
        price = selectedVariant.price || price;
      }
    }

    let cart = await Cart.findOne({ user: req.user.id });

    // Determine the Variant ID to store (or null)
    const variantIdToStore = selectedVariant ? selectedVariant._id.toString() : null;

    if (cart) {
      // Check if product AND variant already exist
      const itemIndex = cart.items.findIndex(item => 
        item.product.toString() === productId &&
        String(item.variant) === String(variantIdToStore || variant)
      );

      if (itemIndex > -1) {
        // Update existing item quantity
        const newQuantity = cart.items[itemIndex].quantity + qty;
        if (newQuantity <= 0) {
          cart.items.splice(itemIndex, 1);
        } else {
          cart.items[itemIndex].quantity = newQuantity;
        }
      } else if (qty > 0) {
        // Add new item
        cart.items.push({
          product: productId,
          quantity: qty,
          price,
          variant: variantIdToStore // Store the ID
        });
      }
    } else if (qty > 0) {
      // Create new cart
      cart = await Cart.create({
        user: req.user.id,
        items: [{
          product: productId,
          quantity: qty,
          price,
          variant: variantIdToStore
        }],
      });
    }

    if (cart) {
      cart.totalAmount = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
      await cart.save();

      // FIX: Ensure "variants" is populated here too
      const populatedCart = await Cart.findById(cart._id).populate(
        "items.product", 
        "name images slug variants"
      );

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

    // FIX: Added "variants" to populate
    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product", 
      "name images slug variants"
    );
    
    res.status(200).json({ success: true, data: populatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};