const express = require("express");
const router = express.Router();
const { 
  register, 
  login, 
  logout, 
  forgotPassword, 
  resendOtp, 
  resetPassword ,
  verifyEmail
} = require("../controllers/authController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/resend-otp", resendOtp);
router.post("/reset-password", resetPassword);
router.post("/verify-email", verifyEmail);

// Example Protected Admin Route
router.get("/admin-dashboard", protect, authorize("admin"), (req, res) => {
  res.status(200).json({ success: true, data: "Admin access granted" });
});

module.exports = router;