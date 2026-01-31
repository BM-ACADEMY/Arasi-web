const StoreSettings = require("../models/storeSettingsModel");

// @desc    Get Store Settings (Read)
// @route   GET /api/settings
exports.getSettings = async (req, res) => {
  try {
    // Find the first document (since we only need one settings doc)
    let settings = await StoreSettings.findOne();

    // If it doesn't exist yet, create a default one
    if (!settings) {
      settings = await StoreSettings.create({
        gstRate: 0,
        shippingCharges: [],
        defaultShippingCharge: 0
      });
    }

    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Store Settings (Create/Update/Delete via overwrite)
// @route   PUT /api/settings
exports.updateSettings = async (req, res) => {
  try {
    const { gstRate, shippingCharges, defaultShippingCharge } = req.body;

    // Find existing or create new
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = new StoreSettings();
    }

    // Update fields if they are provided in the request
    if (gstRate !== undefined) settings.gstRate = gstRate;
    if (defaultShippingCharge !== undefined) settings.defaultShippingCharge = defaultShippingCharge;

    // This handles Adding, Removing, and Updating state charges
    // (Frontend sends the complete new array)
    if (shippingCharges !== undefined) settings.shippingCharges = shippingCharges;

    await settings.save();
    res.status(200).json({ success: true, message: "Settings updated successfully", settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
