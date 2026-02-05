const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  discountPrice: {
    type: Number,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategory",
  },
  brand: {
    type: String,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  images: [
    {
      type: String,
      required: true,
    },
  ],
  // Variants now hold the weight info
  variants: [
    {
      label: String,
      quantity: String,
      unit: String,
      price: Number,
      originalPrice: Number,
      stock: Number,
      // --- MOVED HERE ---
      weight: {
        type: Number,
        default: 0.5
      },
      weightUnit: {
        type: String,
        enum: ['kg', 'g', 'ml', 'l'],
        default: 'kg'
      }
      // ------------------
    }
  ],
  details: [
    {
      heading: String,
      content: String
    }
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);