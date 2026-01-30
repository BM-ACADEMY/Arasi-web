const Complaint = require("../models/complaintModel");

// @desc    Create a new complaint
// @route   POST /api/complaints
exports.createComplaint = async (req, res) => {
  try {
    const { subject, description } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ success: false, message: "Please fill all fields" });
    }

    const complaint = await Complaint.create({
      user: req.user.id,
      subject,
      description,
      messages: [],
    });

    await complaint.populate("user", "name email");

    // Notify Admin via Socket
    const io = req.app.get("io");
    if (io) {
      io.emit("newComplaint", {
        _id: complaint._id,
        userName: complaint.user.name,
        subject: complaint.subject,
        createdAt: complaint.createdAt,
      });
    }

    res.status(201).json({ success: true, message: "Complaint submitted successfully", complaint });
  } catch (error) {
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

// @desc    Get single complaint details
// @route   GET /api/complaints/:id
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate("user", "name email");

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    // Authorization Check
    if (req.user.role !== "admin" && complaint.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to view this complaint" });
    }

    res.status(200).json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a chat message
// @route   POST /api/complaints/:id/message
exports.addMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    let sender = req.user.role === "admin" ? "Admin" : "User";
    
    // Safety check for user
    if (sender === "User" && complaint.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const newMessage = {
      sender,
      message,
      seen: false,
      createdAt: new Date()
    };

    complaint.messages.push(newMessage);

    // Auto-update status if Admin replies
    if (sender === "Admin" && complaint.status === "Pending") {
      complaint.status = "In Progress";
    }

    await complaint.save();

    // Emit Real-time Event
    const io = req.app.get("io");
    if (io) {
      io.emit("newMessage", {
        complaintId: complaint._id,
        message: complaint.messages[complaint.messages.length - 1] 
      });
    }

    res.status(200).json({ success: true, data: complaint.messages[complaint.messages.length - 1] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/admin/:id
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body; 
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

// @desc    Mark messages as Seen
// @route   PUT /api/complaints/:id/seen
exports.markMessagesAsSeen = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: "Not found" });

    // Identify who is viewing
    const viewerRole = req.user.role === "admin" ? "Admin" : "User";
    // We want to mark messages sent by the *opposite* party as seen
    const senderToMark = viewerRole === "Admin" ? "User" : "Admin";

    let updated = false;

    complaint.messages.forEach(msg => {
      if (msg.sender === senderToMark && !msg.seen) {
        msg.seen = true;
        msg.seenAt = new Date();
        updated = true;
      }
    });

    if (updated) {
      await complaint.save();
      
      // Notify the sender that their messages have been read
      const io = req.app.get("io");
      if (io) {
        io.emit("messagesRead", {
          complaintId: complaint._id,
          reader: viewerRole
        });
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};