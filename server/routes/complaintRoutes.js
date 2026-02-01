const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  addMessage,
  markMessagesAsSeen,
  getAllComplaints,
  updateComplaintStatus,
  deleteComplaint // Import the new controller
} = require("../controllers/complaintController");

const router = express.Router();

// User Routes
router.post("/", protect, createComplaint);
router.get("/my", protect, getMyComplaints);

// Shared Routes (View details, Chat, Mark Seen)
router.get("/:id", protect, getComplaintById);
router.post("/:id/message", protect, addMessage);
router.put("/:id/seen", protect, markMessagesAsSeen);

// Admin Routes
router.get("/admin/all", protect, authorize("admin"), getAllComplaints);
router.put("/admin/:id", protect, authorize("admin"), updateComplaintStatus);
router.delete("/admin/:id", protect, authorize("admin"), deleteComplaint); // New Delete Route

module.exports = router;
