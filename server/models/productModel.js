const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: String,

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
  images: [String], // Array of paths

  variants: [
    {
      label: String,       // e.g. "1kg"
      quantity: Number,
      unit: {
        type: String,
        enum: ["piece", "kg", "g", "ltr", "ml"]
      },
      price: Number,
      stock: Number
    }
  ],

  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Search Index
productSchema.index({ name: "text", brand: "text" });

module.exports = mongoose.model("Product", productSchema);
