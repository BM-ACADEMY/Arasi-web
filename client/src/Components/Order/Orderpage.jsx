import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/services/api";
import {
  Package, Truck, CheckCircle, Clock, ChevronRight,
  ShoppingBag, X, MapPin, AlertCircle, ArrowRight, Receipt
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// --- HELPERS ---
const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric", month: "short", day: "numeric",
  });
};

const getStatusColor = (status) => {
  switch (status) {
    case "Delivered": return "bg-green-100 text-green-700 border-green-200";
    case "Shipped": return "bg-blue-100 text-blue-700 border-blue-200";
    case "Cancelled": return "bg-red-50 text-red-600 border-red-100";
    default: return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return "https://via.placeholder.com/80";
  if (imagePath.startsWith("http")) return imagePath;
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '');
  return `${baseUrl}/${imagePath}`;
};

/**
 * Helper to resolve the variant display name
 * Checks if it's an ID (requiring lookup) or a direct string label.
 */
const getVariantDisplay = (variantId, productVariants = []) => {
  if (!variantId) return "Standard";

  // If it's already a short string (old data/label), just show it
  if (typeof variantId === 'string' && variantId.length < 20) {
    return variantId;
  }

  // Otherwise assume it's an ObjectId -> find matching variant in the product object
  const matched = productVariants.find(v => v._id?.toString() === variantId?.toString());
  if (!matched) return "Variant";

  // Priority: Label (e.g. "Combo Pack") > Unit (e.g. "500g") > Weight+Unit
  let display = matched.label || "";

  if (matched.unit) {
    display = display ? `${display} (${matched.unit})` : matched.unit;
  } else if (matched.weight && matched.weightUnit) {
    const weightLabel = `${matched.weight}${matched.weightUnit}`;
    display = display ? `${display} (${weightLabel})` : weightLabel;
  }

  return display || "Variant";
};

// --- MODAL WRAPPER ---
const ModalWrapper = ({ children, onClose }) => {
  const isMobile = window.innerWidth < 768;
  const variants = isMobile ? {
    hidden: { opacity: 0, y: "100%" },
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 300 } },
    exit: { opacity: 0, y: "100%" }
  } : {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center sm:p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}
      />
      <motion.div
        variants={variants}
        initial="hidden" animate="visible" exit="exit"
        className="relative bg-white w-full max-w-lg md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
      >
        {children}
      </motion.div>
    </div>
  );
};

// --- CANCEL MODAL ---
const CancelOrderModal = ({ onClose, onConfirm, isCancelling }) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const reasons = ["Changed my mind", "Found a better price", "Ordered by mistake", "Delivery time too long", "Other"];

  const handleSubmit = () => {
    let finalReason = selectedReason;
    if (selectedReason === "Other") {
      if (!customReason.trim()) return toast.error("Please type your reason.");
      finalReason = customReason;
    }
    if (!finalReason) return toast.error("Please select a reason.");
    onConfirm(finalReason);
  };

  return (
    <ModalWrapper onClose={onClose}>
      <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50/50">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <AlertCircle className="text-red-500" size={20} /> Cancel Order
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X size={20} className="text-gray-400" />
        </button>
      </div>
      <div className="p-6 overflow-y-auto">
        <p className="text-sm text-gray-500 mb-4">Please select a reason for cancellation:</p>
        <div className="space-y-3 mb-6">
          {reasons.map((reason) => (
            <label key={reason} className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${selectedReason === reason ? "border-red-500 bg-red-50/50 text-red-900 shadow-sm" : "border-gray-100 hover:border-gray-200 bg-white"}`}>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${selectedReason === reason ? "border-red-500" : "border-gray-300"}`}>
                {selectedReason === reason && <div className="w-2 h-2 rounded-full bg-red-500" />}
              </div>
              <input type="radio" name="cancelReason" value={reason} checked={selectedReason === reason} onChange={(e) => setSelectedReason(e.target.value)} className="hidden" />
              <span className="text-sm font-medium">{reason}</span>
            </label>
          ))}
          <AnimatePresence>
            {selectedReason === "Other" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <textarea value={customReason} onChange={(e) => setCustomReason(e.target.value)} placeholder="Tell us more..." className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none h-24 bg-gray-50" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="p-6 border-t bg-white mt-auto flex gap-3">
        <button onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Back</button>
        <button onClick={handleSubmit} disabled={isCancelling} className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-70 shadow-lg shadow-red-100">{isCancelling ? "Processing..." : "Confirm Cancel"}</button>
      </div>
    </ModalWrapper>
  );
};

// --- ORDER DETAILS / TRACKING MODAL ---
const TrackOrderModal = ({ order, onClose }) => {
  const steps = [
    { label: "Order Placed", icon: Package, date: order.createdAt },
    { label: "Processing", icon: Clock },
    { label: "Shipped", icon: Truck },
    { label: "Delivered", icon: CheckCircle, date: order.deliveredAt || null },
  ];

  let activeStep = 0;
  if (order.orderStatus === "Processing") activeStep = 1;
  else if (order.orderStatus === "Shipped") activeStep = 2;
  else if (order.orderStatus === "Delivered") activeStep = 3;

  return (
    <ModalWrapper onClose={onClose}>
      <div className="sticky top-0 bg-white/90 backdrop-blur-md px-6 py-4 border-b flex items-center justify-between z-10">
        <h3 className="font-medium text-gray-900 text-lg">Order Details</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
      </div>

      <div className="p-6 overflow-y-auto">
        {/* Status Timeline & Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-medium tracking-widest">Order #{order._id?.slice(-6).toUpperCase()}</p>
            <div className={`mt-2 inline-flex px-3 py-1 rounded-full text-[10px] font-medium border ${getStatusColor(order.orderStatus)}`}>
              {order.orderStatus}
            </div>
          </div>
        </div>

        {order.orderStatus === "Cancelled" ? (
          <div className="bg-red-50 rounded-xl p-6 text-center border border-red-100 mb-6">
            <X className="mx-auto text-red-400 mb-2" size={32} />
            <p className="font-medium text-red-900">Order Cancelled</p>
            <p className="text-xs text-red-600 mt-1">Reason: {order.cancellationReason || "Not specified"}</p>
          </div>
        ) : (
          <div className="relative pl-2 flex flex-col gap-6 mb-8">
            <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-gray-100 -z-0" />
            {steps.map((step, index) => {
              const isCompleted = index <= activeStep;
              const Icon = step.icon;
              return (
                <div key={index} className="flex gap-4 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isCompleted ? "bg-black border-black text-white" : "bg-white border-gray-100 text-gray-300"}`}>
                    <Icon size={18} />
                  </div>
                  <div className="pt-2">
                    <p className={`text-sm font-medium ${isCompleted ? "text-gray-900" : "text-gray-300"}`}>{step.label}</p>
                    {step.date && <p className="text-xs text-gray-500 mt-0.5">{formatDate(step.date)}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Order Items with Variant Display */}
        <div className="space-y-4 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Items</h4>
          {order.orderItems?.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-50">
              <div className="flex gap-3 items-center">
                <img src={getImageUrl(item.image)} className="w-12 h-12 object-cover rounded-lg border" alt="" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    Size: {getVariantDisplay(item.variant, item.product?.variants || [])} • Qty: {item.quantity}
                  </p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Cost Breakdown */}
        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 mb-6">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600"><span>Item Total</span><span className="text-gray-900 font-medium">₹{(order.itemsPrice || 0).toLocaleString()}</span></div>
            <div className="flex justify-between text-gray-600"><span>GST</span><span className="text-gray-900 font-medium">+ ₹{(order.taxPrice || 0).toLocaleString()}</span></div>
            <div className="flex justify-between text-gray-600"><span>Delivery</span><span className="text-gray-900 font-medium">{order.shippingPrice === 0 ? "Free" : `+ ₹${order.shippingPrice}`}</span></div>
            <div className="h-px bg-gray-200 my-2" />
            <div className="flex justify-between items-center"><span className="font-bold text-gray-900">Total Paid</span><span className="font-bold text-black text-lg">₹{(order.totalAmount || 0).toLocaleString()}</span></div>
          </div>
        </div>

        {/* Address */}
        <div className="border-t pt-6 flex gap-4">
          <MapPin size={16} className="text-gray-400 mt-1" />
          <div>
            <p className="text-xs font-medium text-gray-900">Delivery Address</p>
            <p className="text-xs text-gray-500 leading-relaxed mt-1">
              {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
            </p>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

// --- MAIN PAGE ---
const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelOrderData, setCancelOrderData] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/orders/my-orders");
        if (data.success) setOrders(data.orders || []);
      } catch (error) {
        toast.error("Could not load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const processCancellation = async (reason) => {
    if (!cancelOrderData?._id) return;
    setIsCancelling(true);
    try {
      const { data } = await api.put(`/orders/${cancelOrderData._id}/cancel`, { reason });
      if (data.success) {
        toast.success("Order cancelled");
        setOrders(prev => prev.map(o => o._id === cancelOrderData._id ? { ...o, orderStatus: "Cancelled", cancellationReason: reason } : o));
        setCancelOrderData(null);
      }
    } catch (error) {
      toast.error("Failed to cancel");
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" /></div>;

  return (
    <div className="min-h-screen bg-[#f8f9fa] pt-24 md:pt-42 pb-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-medium text-gray-900">Your Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your recent purchases and tracking.</p>
        </header>

        {orders.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h2 className="text-lg font-medium text-gray-900">No orders yet</h2>
            <Link to="/" className="mt-6 inline-block bg-black text-white px-8 py-3 rounded-full text-sm font-medium">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
                {/* Order Summary Header */}
                <div className="px-5 py-4 bg-gray-50/50 flex items-center justify-between border-b border-gray-100">
                  <div className="flex gap-4">
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">#{order._id?.slice(-8).toUpperCase()}</span>
                    <span className="text-[10px] font-medium text-gray-400 hidden sm:inline-block">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-medium border ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </div>
                </div>

                {/* Items in the Order Card */}
                <div className="p-5 space-y-5">
                  {order.orderItems?.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden border border-gray-100">
                        <img src={getImageUrl(item.image)} className="w-full h-full object-cover mix-blend-multiply" alt="" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Size: {getVariantDisplay(item.variant, item.product?.variants || [])} • Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">₹{item.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                {/* Card Footer Actions */}
                <div className="px-5 py-4 bg-white border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Total Amount</p>
                    <p className="text-lg font-medium text-gray-900">₹{(order.totalAmount || 0).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {order.orderStatus === "Processing" && (
                      <button onClick={() => setCancelOrderData(order)} className="text-xs font-medium text-red-600 px-4 py-2 hover:bg-red-50 rounded-xl transition-colors">Cancel</button>
                    )}
                    <button onClick={() => setSelectedOrder(order)} className="bg-black text-white text-xs font-medium px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-gray-200">
                      View Details & Invoice <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Logic */}
        <AnimatePresence>
          {selectedOrder && <TrackOrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
          {cancelOrderData && <CancelOrderModal onClose={() => setCancelOrderData(null)} onConfirm={processCancellation} isCancelling={isCancelling} />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrderPage;