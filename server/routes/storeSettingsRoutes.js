const express = require("express");
const router = express.Router();
const { getSettings, updateSettings } = require("../controllers/storeSettingsController");
const { protect, authorize } = require("../middleware/authMiddleware"); // <--- Import authorize

// Get Settings (Public or Private depending on your need, usually Public for Checkout)
router.get("/", getSettings);

// Update Settings (Admin Only)
// ERROR WAS HERE: 'admin' was undefined. distinct usage: authorize("admin")
router.put("/", protect, authorize("admin"), updateSettings);

module.exports = router;
