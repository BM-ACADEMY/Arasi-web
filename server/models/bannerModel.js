const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  tagline: {
    type: String,
    required: true,
  },
  heading: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String, // Path to the uploaded image
    required: true,
  }
}, { timestamps: true });

// We typically only want one active banner, but this schema allows flexibility.
module.exports = mongoose.model("Banner", bannerSchema);
