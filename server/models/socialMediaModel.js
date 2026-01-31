const mongoose = require("mongoose");

const socialMediaSchema = mongoose.Schema(
  {
    platform: {
      type: String,
      required: [true, "Please select a platform"],
      enum: ["Instagram", "Facebook", "Twitter", "Youtube"],
      unique: true, // Ensures only one link per platform
    },
    url: {
      type: String,
      required: [true, "Please enter the profile URL"],
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SocialMedia", socialMediaSchema);