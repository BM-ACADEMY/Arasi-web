import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/services/api";
import {
  Package, Truck, CheckCircle, Clock, ChevronRight,
  ShoppingBag, X, MapPin, AlertCircle, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// --- HELPERS ---
const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric", month: "long", day: "numeric",
  });
};

const getStatusColor = (status) => {
  switch (status) {
    case "Delivered": return "bg-green-100 text-green-700 border-green-200";
    case "Shipped": return "bg-blue-100 text-blue-700 border-blue-200";
    case "Cancelled": return "bg-red-100 text-red-700 border-red-200";
    default: return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return "https://via.placeholder.com/80";
  if (imagePath.startsWith("http")) return imagePath;
  // Dynamically get base URL from VITE_API_URL (removes '/api' from end)
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '');
  return `${baseUrl}/${imagePath}`;
};

// --- ANIMATION VARIANTS ---
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 }
  },
  exit: { opacity: 0, scale: 0.95, y: 20 }
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

// --- COMPONENTS ---
const AnimatedCheck = () => (
  <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
    <motion.path d="M20 6L9 17l-5-5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, ease: "easeOut" }} />
  </motion.svg>
);

// --- CANCELLATION MODAL ---
const CancelOrderModal = ({ isOpen, onClose, onConfirm, isCancelling }) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const reasons = [
    "Changed my mind",
    "Found a better price elsewhere",
    "Ordered by mistake",
    "Delivery time is too long",
    "Duplicate order",
    "Other"
  ];

  const handleSubmit = () => {
    let finalReason = selectedReason;
    if (selectedReason === "Other") {
      if (!customReason.trim()) return toast.error("Please type your reason.");
      finalReason = customReason;
    }
    if (!finalReason) return toast.error("Please select a reason.");

    onConfirm(finalReason);
  };

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedReason("");
      setCustomReason("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        variants={overlayVariants} initial="hidden" animate="visible" exit="exit"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}
      />

      <motion.div
        variants={modalVariants} initial="hidden" animate="visible" exit="exit"
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle className="text-red-500" size={20} />
              Cancel Order
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <p className="text-sm text-gray-500 mb-4">Please select a reason for cancellation:</p>

          <div className="space-y-3 mb-6">
            {reasons.map((reason) => (
              <label
                key={reason}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedReason === reason
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedReason === reason ? "border-red-500" : "border-gray-300"
                }`}>
                  {selectedReason === reason && <div className="w-2 h-2 rounded-full bg-red-500" />}
                </div>
                <input
                  type="radio"
                  name="cancelReason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="hidden"
                />
                <span className="text-sm font-medium">{reason}</span>
              </label>
            ))}

            {/* Custom Input for 'Other' */}
            <AnimatePresence>
              {selectedReason === "Other" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Type your reason here..."
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none h-24"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Keep Order
            </button>
            <button
              onClick={handleSubmit}
              disabled={isCancelling}
              className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-70 flex justify-center items-center gap-2 shadow-lg shadow-red-200"
            >
              {isCancelling ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Confirm Cancel"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- TRACKING MODAL ---
const TrackOrderModal = ({ order, onClose }) => {
  if (!order) return null;
  const steps = [
    { label: "Order Placed", icon: Package, date: order.createdAt },
    { label: "Processing", icon: Clock, date: null },
    { label: "Shipped", icon: Truck, date: null },
    { label: "Delivered", icon: CheckCircle, date: order.deliveredAt },
  ];

  let activeStep = 0;
  if (order.orderStatus === "Processing") activeStep = 1;
  else if (order.orderStatus === "Shipped") activeStep = 2;
  else if (order.orderStatus === "Delivered") activeStep = 3;

  const isCancelled = order.orderStatus === "Cancelled";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        variants={modalVariants} initial="hidden" animate="visible" exit="exit"
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50/80">
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">Track Order</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="p-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Order ID</p>
              <p className="font-bold text-gray-900 text-xl tracking-tight">#{order._id.slice(-8).toUpperCase()}</p>
            </div>
            <div className={`px-4 py-2 rounded-full text-xs font-bold border ${getStatusColor(order.orderStatus)}`}>
              {order.orderStatus.toUpperCase()}
            </div>
          </div>

          {isCancelled ? (
            <div className="bg-red-50 text-red-700 p-8 rounded-2xl text-center border border-red-100">
              <X size={48} className="mx-auto mb-3 text-red-400" />
              <p className="font-bold text-xl">Order Cancelled</p>
              <p className="text-sm opacity-80 mt-2">Reason: {order.cancellationReason || "Request by user"}</p>
            </div>
          ) : (
            <div className="relative pl-4 flex flex-col gap-8">
               <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-gray-100 -z-20 rounded-full"></div>
               <motion.div initial={{ height: 0 }} animate={{ height: `${(activeStep / (steps.length - 1)) * 100}%` }} transition={{ duration: 1, ease: "easeInOut", delay: 0.5 }} className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-green-500 -z-10 origin-top rounded-full" style={{ maxHeight: 'calc(100% - 3rem)' }} />
               {steps.map((step, index) => {
                 const isCompleted = index <= activeStep;
                 const isCurrent = index === activeStep;
                 const Icon = step.icon;
                 return (
                   <div key={index} className="flex items-center gap-5 relative z-0">
                     <div className="relative flex-shrink-0">
                        {isCurrent && <span className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-20"></span>}
                        <motion.div animate={{ backgroundColor: isCompleted ? "#22c55e" : "#ffffff", borderColor: isCompleted ? "#22c55e" : "#e2e8f0", scale: isCurrent ? 1.1 : 1 }} transition={{ duration: 0.4 }} className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-sm z-10 relative bg-white`}>
                          {isCompleted ? ((index < activeStep || order.orderStatus === "Delivered") ? <AnimatedCheck /> : <Icon size={20} className="text-white" />) : <Icon size={20} className="text-gray-300" />}
                        </motion.div>
                     </div>
                     <div className="flex-1">
                       <p className={`text-base font-bold transition-colors duration-300 ${isCompleted ? "text-gray-900" : "text-gray-300"}`}>{step.label}</p>
                       {step.date ? <p className="text-xs text-gray-500 mt-1 font-medium">{formatDate(step.date)}</p> : (isCurrent && <p className="text-xs text-green-600 font-bold mt-1 tracking-wide uppercase">In Progress</p>)}
                     </div>
                   </div>
                 );
               })}
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-gray-100 flex gap-4">
             <div className="p-3 bg-gray-50 text-gray-700 rounded-xl h-fit"><MapPin size={22} /></div>
             <div>
               <p className="text-sm font-bold text-gray-900">Shipping Address</p>
               <p className="text-sm text-gray-500 mt-1 leading-relaxed max-w-xs">{order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- MAIN ORDER PAGE ---
const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [selectedOrder, setSelectedOrder] = useState(null); // For Tracking
  const [cancelOrderData, setCancelOrderData] = useState(null); // For Cancelling (stores order to cancel)
  const [isCancelling, setIsCancelling] = useState(false); // API Loading State

  // NOTE: Removed hardcoded SERVER_URL, now using getImageUrl helper

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/orders/my-orders");
        if (data.success) setOrders(data.orders);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        toast.error("Could not load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // --- HANDLERS ---
  const handleCancelClick = (order) => {
    setCancelOrderData(order); // Opens the modal
  };

  const processCancellation = async (reason) => {
    if (!cancelOrderData) return;
    setIsCancelling(true);
    try {
      const { data } = await api.put(`/orders/${cancelOrderData._id}/cancel`, { reason });
      if (data.success) {
        toast.success("Order cancelled successfully");
        setOrders((prev) =>
          prev.map((o) => o._id === cancelOrderData._id ? { ...o, orderStatus: "Cancelled", cancellationReason: reason } : o)
        );
        setCancelOrderData(null); // Close modal
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] md:pt-37 pt-25 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
          <p className="text-gray-500 mt-2">Track and manage your recent purchases</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100">
            <ShoppingBag className="mx-auto h-20 w-20 text-gray-200 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No orders placed yet</h2>
            <Link to="/" className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-sm font-bold rounded-full text-white bg-black hover:bg-gray-800 transition-all hover:shadow-lg hover:-translate-y-0.5">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">

                {/* Header */}
                <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex gap-8">
                    <div>
                       <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Order ID</span>
                       <p className="text-sm font-bold text-gray-900 mt-0.5">#{order._id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div>
                       <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Date</span>
                       <p className="text-sm font-medium text-gray-900 mt-0.5">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus === "Delivered" && <CheckCircle size={14} />}
                    {order.orderStatus === "Processing" && <Clock size={14} />}
                    {order.orderStatus === "Shipped" && <Truck size={14} />}
                    {order.orderStatus.toUpperCase()}
                  </div>
                </div>

                {/* Items */}
                <div className="p-6">
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-6 mb-6 last:mb-0">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                        {/* FIXED: Using getImageUrl helper */}
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {e.target.src = "https://via.placeholder.com/80"}}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{item.name}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                           {item.variant && <span>Size: {item.variant}</span>}
                           <span>Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-100 flex flex-wrap justify-between items-center gap-4">
                  <p className="text-sm font-medium text-gray-500">Total Paid: <span className="text-gray-900 font-bold">₹{order.totalAmount.toLocaleString()}</span></p>

                  <div className="flex items-center gap-3">
                    {/* CANCEL BUTTON */}
                    {order.orderStatus === "Processing" && (
                      <button
                        onClick={() => handleCancelClick(order)}
                        className="px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 border border-transparent hover:border-red-100"
                      >
                        <AlertCircle size={16} /> Cancel Order
                      </button>
                    )}

                    {/* TRACK BUTTON */}
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center gap-2 text-sm font-bold text-white bg-black hover:bg-gray-800 px-5 py-2 rounded-lg transition-all shadow-md shadow-gray-200 hover:shadow-lg hover:-translate-y-0.5"
                    >
                      Track Order <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODALS */}
        <AnimatePresence>
          {selectedOrder && (
            <TrackOrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
          )}
          {cancelOrderData && (
            <CancelOrderModal
              isOpen={!!cancelOrderData}
              onClose={() => setCancelOrderData(null)}
              onConfirm={processCancellation}
              isCancelling={isCancelling}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrderPage;
