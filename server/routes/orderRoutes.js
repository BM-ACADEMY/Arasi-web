const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware"); // Import authorize
const { 
  createRazorpayOrder, 
  verifyPayment, 
  getUserOrders,
  getAllOrders,       // <--- Import
  updateOrderStatus,
  getDashboardStats,
  cancelOrder   // <--- Import
} = require("../controllers/orderController");

const router = express.Router();

router.post("/create-order", protect, createRazorpayOrder);
router.post("/verify-payment", protect, verifyPayment);
router.get("/my-orders", protect, getUserOrders);

router.put("/:id/cancel", protect, cancelOrder);



// --- ADMIN ROUTES ---
router.get("/admin/all-orders", protect, authorize("admin"), getAllOrders);
router.put("/admin/order/:id", protect, authorize("admin"), updateOrderStatus);

router.get("/admin/stats", protect, authorize("admin"), getDashboardStats);




module.exports = router;