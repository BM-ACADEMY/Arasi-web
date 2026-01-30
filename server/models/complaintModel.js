const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Removed 'type' field as requested previously
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
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
    },
    // Chat Messages
    messages: [
      {
        sender: {
          type: String,
          enum: ["User", "Admin"],
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        seen: {
          type: Boolean,
          default: false,
        },
        seenAt: {
          type: Date,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);