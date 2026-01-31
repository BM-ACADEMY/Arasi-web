const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  forgotPassword,
  resendOtp,
  resetPassword ,
  verifyEmail,
  getUserProfile,
  updateUserProfile,
  updatePassword,
  createAdmin,
  getAllAdmins,
  updateAdmin, // Import this
  deleteAdmin  // Import this
} = require("../controllers/authController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/resend-otp", resendOtp);
router.post("/reset-password", resetPassword);
router.post("/verify-email", verifyEmail);
// Add this line
router.put("/update-password", protect, updatePassword);
// --- NEW PROFILE ROUTE ---
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);


router.post("/create-admin", protect, authorize("admin"), createAdmin);
router.get("/admins", protect, authorize("admin"), getAllAdmins);
router.put("/admin/:id", protect, authorize("admin"), updateAdmin);   // NEW
router.delete("/admin/:id", protect, authorize("admin"), deleteAdmin);


// Example Protected Admin Route
router.get("/admin-dashboard", protect, authorize("admin"), (req, res) => {
  res.status(200).json({ success: true, data: "Admin access granted" });
});

module.exports = router;
