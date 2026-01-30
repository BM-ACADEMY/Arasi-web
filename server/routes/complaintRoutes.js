const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { createComplaint, getMyComplaints, getAllComplaints,updateComplaintStatus } = require("../controllers/complaintController");

const router = express.Router();

// User Routes
router.post("/", protect, createComplaint);
router.get("/my", protect, getMyComplaints);

// Admin Routes
router.get("/admin/all", protect, authorize("admin"), getAllComplaints);
router.put("/admin/:id", protect, authorize("admin"), updateComplaintStatus);

module.exports = router;