const mongoose = require("mongoose");

const storeSettingsSchema = new mongoose.Schema({
  gstRate: {
    type: Number,
    default: 0,
    required: true
  },
  // Array of objects for state-specific logic
  shippingCharges: [
    {
      state: { type: String, required: true },
      charge: { type: Number, required: true }
    }
  ],
  // Fallback if state not found in shippingCharges
  defaultShippingCharge: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model("StoreSettings", storeSettingsSchema);
