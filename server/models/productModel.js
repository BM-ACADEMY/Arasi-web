const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: String,

  // --- NEW: Detailed Info Section ---
  details: [
    {
      heading: String, // e.g. "Ingredients"
      content: String  // e.g. "Coconut Oil, Lavender Extract..."
    }
  ],

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategory",
    required: true
  },

  brand: String,
  images: [String],

  variants: [
    {
      label: String,
      quantity: Number,
      unit: { type: String, required: true, default: "piece" },
      price: Number,
      originalPrice: Number,
      stock: Number
    }
  ],

  isActive: { type: Boolean, default: true }
}, { timestamps: true });

productSchema.index({ name: "text", brand: "text" });

module.exports = mongoose.model("Product", productSchema);
