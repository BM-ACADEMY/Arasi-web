const Address = require("../models/addressModel");

// Add a new address
exports.addAddress = async (req, res) => {
  try {
    const { address, city, state, pincode, phone } = req.body;
    const userId = req.user.id;

    const newAddress = new Address({
      userId,
      address,
      city,
      state,
      pincode,
      phone // Saving the phone number specifically for this address
    });

    const savedAddress = await newAddress.save();

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      address: savedAddress
    });
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add address",
      error: error.message
    });
  }
};

// Get all addresses for the logged-in user
exports.getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await Address.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      addresses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch addresses",
      error: error.message
    });
  }
};

// Delete an address
exports.deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        await Address.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Address deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting address" });
    }
};
