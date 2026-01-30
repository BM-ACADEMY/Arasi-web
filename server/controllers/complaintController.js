const Complaint = require("../models/complaintModel");

// @desc    Create a new complaint/suggestion
// @route   POST /api/complaints
exports.createComplaint = async (req, res) => {
  try {
    const { type, subject, description, images } = req.body;

    if (!subject || !description || !type) {
      return res.status(400).json({ success: false, message: "Please fill all fields" });
    }

    // 1. Save to Database
    const complaint = await Complaint.create({
      user: req.user.id,
      type,
      subject,
      description,
      images: images || [],
    });

    // 2. Populate user details for the notification
    await complaint.populate("user", "name email");

    // 3. Emit Real-time Socket Event (Notify Admin)
    const io = req.app.get("io"); // Get the socket instance attached in server.js
    if (io) {
      io.emit("newComplaint", {
        _id: complaint._id,
        userName: complaint.user.name,
        type: complaint.type,
        subject: complaint.subject,
        createdAt: complaint.createdAt,
      });
      console.log("🔔 Socket event 'newComplaint' emitted");
    }

    res.status(201).json({ success: true, message: "Submitted successfully", complaint });
  } catch (error) {
    console.error("Complaint Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged-in user's complaints
// @route   GET /api/complaints/my
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all complaints (Admin)
// @route   GET /api/complaints/admin/all
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/admin/:id
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'Pending', 'Reviewed', 'Resolved'
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    complaint.status = status;
    await complaint.save();

    res.status(200).json({ success: true, message: "Status updated", complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};