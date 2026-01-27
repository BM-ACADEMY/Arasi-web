const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  image: String, // Path to image
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Category", categorySchema);