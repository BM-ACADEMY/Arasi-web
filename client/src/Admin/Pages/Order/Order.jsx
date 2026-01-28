import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { 
  Package, Truck, CheckCircle, Clock, XCircle, 
  User, Calendar, X, CreditCard, MapPin, AlertTriangle, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// --- HELPERS ---
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
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

// --- ADMIN ORDER DETAILS MODAL ---
const OrderDetailsModal = ({ order, onClose, SERVER_URL }) => {
  if (!order) return null;

  const isPaid = order.paymentInfo && order.paymentInfo.razorpayPaymentId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Order Details</h3>
            <p className="text-xs text-gray-500">ID: #{order._id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="p-6 overflow-y-auto">
          
          {/* 1. Status & Payment Bar */}
          <div className="flex flex-wrap gap-4 mb-6">
             <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 text-sm font-bold ${getStatusColor(order.orderStatus)}`}>
                <span>Status: {order.orderStatus}</span>
             </div>
             <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 text-sm font-bold ${isPaid ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}>
                <CreditCard size={16} />
                <span>{isPaid ? "Payment: Paid" : "Payment: Pending"}</span>
             </div>
          </div>

          {/* 2. Cancellation Reason (Only if Cancelled) */}
          {order.orderStatus === "Cancelled" && order.cancellationReason && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
               <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
               <div>
                 <p className="text-sm font-bold text-red-700">Cancellation Reason:</p>
                 <p className="text-sm text-red-600 mt-1 italic">"{order.cancellationReason}"</p>
               </div>
            </div>
          )}

          {/* 3. Customer & Shipping Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                <User size={16} /> Customer Info
              </h4>
              <p className="text-sm text-gray-700 font-medium">{order.user?.name || "N/A"}</p>
              <p className="text-xs text-gray-500">{order.user?.email}</p>
              <p className="text-xs text-gray-500 mt-1">Phone: {order.shippingAddress?.phone}</p>
            </div>
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                <MapPin size={16} /> Shipping Address
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {order.shippingAddress?.address},<br/>
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
              </p>
            </div>
          </div>

          {/* 4. Products List */}
          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Package size={16} /> Products ({order.orderItems.length})
          </h4>
          <div className="space-y-3">
            {order.orderItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <img 
                  src={item.image ? `${SERVER_URL}/${item.image}` : "/placeholder.jpg"} 
                  alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    {item.variant && <span className="mr-2">Variant: {item.variant}</span>}
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          
          {/* Total */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Total Amount</span>
            <span className="text-xl font-bold text-gray-900">₹{order.totalAmount.toLocaleString()}</span>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

// --- MAIN ADMIN PAGE ---
const AdminOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null); // For Modal

  const SERVER_URL = "http://localhost:5000";

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders/admin/all-orders");
      if (data.success) {
        setOrders(data.orders);
        setFilteredOrders(data.orders);
      }
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    if (filterStatus === "All") setFilteredOrders(orders);
    else setFilteredOrders(orders.filter(order => order.orderStatus === filterStatus));
  }, [filterStatus, orders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const { data } = await api.put(`/orders/admin/order/${orderId}`, { status: newStatus });
      if (data.success) {
        toast.success(`Updated to ${newStatus}`);
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
      }
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
        <div className="flex flex-wrap gap-2 pt-4">
          {["All", "Processing", "Shipped", "Delivered", "Cancelled"].map(status => (
            <button key={status} onClick={() => setFilterStatus(status)} 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterStatus === status ? "bg-black text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredOrders.map((order) => {
          const isPaid = order.paymentInfo?.razorpayPaymentId;
          
          return (
            <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
              
              {/* Card Header: ID & Status */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600 tracking-wider">#{order._id.slice(-6).toUpperCase()}</span>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar size={12} className="text-gray-400"/> 
                    <span className="text-xs text-gray-500">{formatDate(order.createdAt)}</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border ${getStatusColor(order.orderStatus)}`}>
                  {order.orderStatus.toUpperCase()}
                </div>
              </div>

              {/* Payment Status Badge */}
              <div className="mb-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${isPaid ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}>
                  <CreditCard size={12} />
                  {isPaid ? "PAID" : "PENDING"}
                </span>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                 <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User size={16} className="text-gray-500" />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-gray-900">{order.user?.name || "Guest"}</p>
                    <p className="text-xs text-gray-500">{order.user?.email}</p>
                 </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                 
                 {/* Update Dropdown */}
                 <div className="relative">
                   {updatingId === order._id ? (
                      <span className="text-xs text-gray-400">Updating...</span>
                   ) : (
                     <select 
                       value={order.orderStatus}
                       onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                       disabled={order.orderStatus === "Cancelled" || order.orderStatus === "Delivered"}
                       className="bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg p-2 outline-none cursor-pointer hover:border-gray-400"
                     >
                       {["Processing", "Shipped", "Delivered", "Cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                   )}
                 </div>

                 {/* View Details Button */}
                 <button 
                   onClick={() => setSelectedOrder(order)}
                   className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors"
                 >
                   <Eye size={16} /> View Details
                 </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* RENDER MODAL */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailsModal 
            order={selectedOrder} 
            SERVER_URL={SERVER_URL}
            onClose={() => setSelectedOrder(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrderPage;