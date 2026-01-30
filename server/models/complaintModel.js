const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["Complaint", "Suggestion"], // Limit to these two types
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Resolved"],
      default: "Pending",
    },
    images: [String], // Optional: URL array for uploaded screenshots
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);