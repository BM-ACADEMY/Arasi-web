const mongoose = require("mongoose");

const storeSettingsSchema = new mongoose.Schema({
  gstRate: {
    type: Number,
    default: 0,
    required: true
  },
  // UPDATED: Shipping charges now contain tiers
  shippingCharges: [
    {
      state: { type: String, required: true },
      tiers: [
        {
          limit: { type: Number, required: true }, // The weight limit (e.g. 1, 3, 5)
          unit: { type: String, required: true, default: 'kg' },
          price: { type: Number, required: true }  // The cost for this tier
        }
      ]
    }
  ],
  // Fallback if state not found
  defaultShippingCharge: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model("StoreSettings", storeSettingsSchema);