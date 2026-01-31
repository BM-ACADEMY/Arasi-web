const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto"); // Built-in node module for random OTP
const Order = require("../models/orderModel");

// --- Helper: Generate JWT ---
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// --- Helper: Send Token Response ---
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = generateToken(user._id);

  // Cookie options
  const options = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    httpOnly: true, // Prevents client-side JS from reading the cookie (Security)
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  // Remove password from output
  user.password = undefined;
  user.otp = undefined;

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    message,
    token, // Sending token in body as fallback
    user,
  });
};

// @desc    Register User
// @route   POST /api/auth/register
// @desc    Register User
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: "User already exists" });

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedOtp = await bcrypt.hash(otp, salt);

    // 4. Create User (Database is fast)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      otp: hashedOtp,
      otpExpires: Date.now() + 10 * 60 * 1000,
      isVerified: false
    });

    // 5. Send Email (BACKGROUND PROCESS - NO 'await')
    // This allows the code to continue immediately without waiting 3-5 seconds
    sendEmail({
      email: user.email,
      subject: "Verify your Account",
      message: `Your verification code is: ${otp}`,
    }).catch(err => console.error("Background Email Error:", err.message));

    // 6. Respond Immediately
    res.status(200).json({
      success: true,
      message: "OTP sent. Please verify.",
      email: user.email
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ success: false, message: "User not found" });

    if (user.isVerified) return res.status(400).json({ success: false, message: "User already verified" });

    // Check Expiry
    if (user.otpExpires < Date.now()) {
        return res.status(400).json({ success: false, message: "OTP Expired" });
    }

    // Verify OTP
    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid OTP" });

    // Activate User
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, "Email Verified Successfully");
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login User
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    // 2. Check User (Include password field explicitly if select: false was used, but here model is simple)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // 3. Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    sendTokenResponse(user, 200, res, "Logged in Successfully");
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Logout User
// @route   GET /api/auth/logout
exports.logout = async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// @desc    Forgot Password (Send OTP)
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Change this in your Node.js authController.js
    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit OTP

    // 2. Hash OTP before saving (Security)
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    // 3. Save to DB with Expiry (10 Minutes)
    user.otp = hashedOtp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // 4. Send Email
    const message = `Your Password Reset OTP is: ${otp}\n\nIt is valid for 10 minutes.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset OTP",
        message,
      });

      res.status(200).json({ success: true, message: "OTP sent to email" });
    } catch (err) {
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
      return res.status(500).json({ success: false, message: "Email could not be sent" });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
exports.resendOtp = async (req, res) => {
  // Logic is largely same as Forgot Password, but you can add rate limiting here
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    user.otp = hashedOtp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail({
      email: user.email,
      subject: "Resend: Password Reset OTP",
      message: `Your new OTP is: ${otp}`,
    });

    res.status(200).json({ success: true, message: "OTP Resent successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password (Verify OTP & Set New Password)
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email,
      otpExpires: { $gt: Date.now() }, // Check if not expired
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid Email or OTP Expired" });
    }

    // Verify OTP
    const isOtpMatch = await bcrypt.compare(otp, user.otp);
    if (!isOtpMatch) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Hash New Password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear OTP fields
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, "Password Reset Successfully");

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



exports.getUserProfile = async (req, res) => {
  try {
    // 1. Get Basic User Info
    const user = await User.findById(req.user.id).select("-password -otp -otpExpires");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2. Get All Orders to extract addresses
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });

    // 3. Extract Unique Addresses
    const uniqueAddresses = [];
    const seen = new Set();

    orders.forEach((order) => {
      const addr = order.shippingAddress;
      // Create a unique key based on address content
      const key = `${addr.address}-${addr.city}-${addr.pincode}-${addr.phone}`.toLowerCase();

      if (!seen.has(key)) {
        seen.add(key);
        uniqueAddresses.push({
          ...addr, // address, city, state, pincode, phone
          _id: order._id, // use order id as a temporary unique key for lists
          lastUsed: order.createdAt
        });
      }
    });

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        addresses: uniqueAddresses
      }
    });

  } catch (error) {
    console.error("Profile Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update User Profile (Name Only)
// @route   PUT /api/auth/profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.name = name || user.name;
    // Email is intentionally NOT updated here for security

    await user.save();

    res.status(200).json({ success: true, message: "Profile updated successfully", user });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // 1. Get user (password is needed for comparison)
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2. Check Current Password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    // 3. Hash New Password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    // Optional: Send new token or just success message
    sendTokenResponse(user, 200, res, "Password updated successfully");

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Create a new Admin (Protected)
// @route   POST /api/auth/create-admin
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create Admin User (Verified by default since created by another admin)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      isVerified: true,
    });

    res.status(201).json({
      success: true,
      message: "New Admin created successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all Admins
// @route   GET /api/auth/admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password -otp -otpExpires");
    res.status(200).json({ success: true, admins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ... existing imports

// @desc    Update Admin Details
// @route   PUT /api/auth/admin/:id
exports.updateAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update basic fields
    user.name = name || user.name;
    user.email = email || user.email;

    // Update password only if provided
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.status(200).json({ success: true, message: "Admin updated successfully", user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Admin
// @route   DELETE /api/auth/admin/:id
exports.deleteAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Optional: Prevent deleting self
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: "You cannot delete yourself" });
    }

    await user.deleteOne();

    res.status(200).json({ success: true, message: "Admin removed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
