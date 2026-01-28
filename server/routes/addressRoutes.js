const express = require("express");
const router = express.Router();
// 1. Fix the Import: Use destructuring for 'protect'
const { protect } = require("../middleware/authMiddleware");
const { addAddress, getAddresses, deleteAddress } = require("../controllers/addressController");

// 2. Use 'protect' instead of 'authMiddleware' in the routes
router.post("/add", protect, addAddress);
router.get("/get", protect, getAddresses);
router.delete("/delete/:id", protect, deleteAddress);

module.exports = router;
