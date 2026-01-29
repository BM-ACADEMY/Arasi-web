import React, { useEffect, useState, useMemo } from "react";
import api from "@/services/api";
import {
  Package, Truck, CheckCircle, Clock, XCircle,
  User, Calendar, X, CreditCard, MapPin, AlertTriangle,
  Eye, ChevronRight, Search, Filter, ArrowUpRight,
  MoreHorizontal, Phone, Mail
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

const getStatusStyles = (status) => {
  switch (status) {
    case "Delivered": return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20";
    case "Shipped": return "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20";
    case "Cancelled": return "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20";
    case "Processing": return "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20";
    default: return "bg-gray-50 text-gray-600 ring-1 ring-gray-500/20";
  }
};

const getPaymentStyles = (isPaid) => {
  return isPaid
    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
    : "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20";
};

// --- SLIDE-OVER DRAWER (DETAILS) ---
const OrderDrawer = ({ order, onClose, SERVER_URL }) => {
  if (!order) return null;
  const isPaid = order.paymentInfo && order.paymentInfo.razorpayPaymentId;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40"
      />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col border-l border-gray-100"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Order #{order._id.slice(-6).toUpperCase()}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* Status Section */}
          <div className="flex gap-3">
             <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${getStatusStyles(order.orderStatus)}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                {order.orderStatus}
             </span>
             <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${getPaymentStyles(isPaid)}`}>
                <CreditCard size={12} />
                {isPaid ? "Paid" : "Pending"}
             </span>
          </div>

          {/* Cancellation Alert */}
          {order.orderStatus === "Cancelled" && (
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 flex gap-3">
              <AlertTriangle className="text-rose-500 shrink-0" size={20} />
              <div>
                <p className="text-sm font-bold text-rose-800">Order Cancelled</p>
                <p className="text-sm text-rose-600 mt-1">"{order.cancellationReason || "No reason provided"}"</p>
              </div>
            </div>
          )}

          {/* Customer Details */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User size={16} className="text-gray-400" /> Customer
            </h3>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 font-bold">
                  {order.user?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{order.user?.name || "Guest User"}</p>
                  <p className="text-xs text-gray-500">ID: {order.user?._id || "N/A"}</p>
                </div>
              </div>
              <div className="h-px bg-gray-200" />
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={14} /> {order.user?.email}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={14} /> {order.shippingAddress?.phone}
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-gray-400" /> Shipping
            </h3>
            <div className="p-4 rounded-xl border border-gray-100 text-sm text-gray-600 leading-relaxed bg-white shadow-sm">
              <span className="font-semibold text-gray-900 block mb-1">Delivery Address:</span>
              {order.shippingAddress?.address},<br/>
              {order.shippingAddress?.city}, {order.shippingAddress?.state}<br/>
              Pincode: <span className="font-mono text-gray-800">{order.shippingAddress?.pincode}</span>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Package size={16} className="text-gray-400" /> Items ({order.orderItems.length})
            </h3>
            <div className="space-y-3">
              {order.orderItems.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-3 bg-white border border-gray-100 rounded-xl hover:border-indigo-100 transition-colors shadow-sm">
                  <div className="h-16 w-16 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                     <img
                       src={item.image ? `${SERVER_URL}/${item.image}` : "/placeholder.jpg"}
                       alt={item.name}
                       className="h-full w-full object-cover"
                     />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Qty: {item.quantity}</span>
                      {item.variant && <span className="text-xs text-gray-500">Var: {item.variant}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col justify-center text-right">
                    <p className="text-sm font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">₹{item.price} ea</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Total */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500 text-sm">Subtotal</span>
            <span className="text-gray-900 font-medium">₹{order.totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold">
            <span className="text-gray-900">Total Amount</span>
            <span className="text-indigo-600">₹{order.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </motion.div>
    </>
  );
};

// --- STATS CARD COMPONENT ---
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} />
    </div>
    <div>
      <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

// --- MAIN PAGE ---
const AdminOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const SERVER_URL = "http://localhost:5000";

  // --- FETCH ORDERS ---
  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders/admin/all-orders");
      if (data.success) setOrders(data.orders);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // --- FILTER & SEARCH LOGIC ---
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesStatus = filterStatus === "All" || order.orderStatus === filterStatus;
      const matchesSearch =
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [orders, filterStatus, searchTerm]);

  // --- STATS CALCULATION ---
  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => o.orderStatus === "Processing").length,
    revenue: orders.reduce((acc, curr) => acc + (curr.paymentInfo?.razorpayPaymentId ? curr.totalAmount : 0), 0)
  }), [orders]);

  // --- UPDATE HANDLER ---
  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const { data } = await api.put(`/orders/admin/order/${orderId}`, { status: newStatus });
      if (data.success) {
        toast.success(`Order marked as ${newStatus}`);
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
      }
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans p-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* 1. Header & Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Orders</h1>
            <p className="text-gray-500 text-sm mt-1">Manage and track your store shipments.</p>
          </div>
          <div className="flex gap-3">
             <button onClick={fetchOrders} className="p-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
               <ArrowUpRight size={18} />
             </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Total Orders" value={stats.total} icon={Package} color="bg-indigo-50 text-indigo-600" />
          <StatCard title="Processing" value={stats.pending} icon={Clock} color="bg-amber-50 text-amber-600" />
          <StatCard title="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={CreditCard} color="bg-emerald-50 text-emerald-600" />
        </div>

        {/* 2. Controls Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            {["All", "Processing", "Shipped", "Delivered", "Cancelled"].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  filterStatus === status
                    ? "bg-gray-900 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* 3. Orders Table (Desktop) / Cards (Mobile) */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

          {/* Desktop Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-2">Order ID</div>
            <div className="col-span-3">Customer</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Total</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* List Content */}
          <div className="divide-y divide-gray-100">
            {filteredOrders.length === 0 ? (
              <div className="p-10 text-center">
                 <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                   <Package className="text-gray-400" size={32} />
                 </div>
                 <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
                 <p className="text-gray-500 mt-1">Try adjusting your filters or search.</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isPaid = order.paymentInfo?.razorpayPaymentId;

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    key={order._id}
                    className="group hover:bg-gray-50 transition-colors"
                  >
                    {/* Desktop Row */}
                    <div className="hidden md:grid grid-cols-12 gap-4 p-4 items-center">
                      <div className="col-span-2 font-mono text-xs font-bold text-gray-600">
                        #{order._id.slice(-6).toUpperCase()}
                      </div>
                      <div className="col-span-3">
                        <div className="text-sm font-medium text-gray-900">{order.user?.name || "Guest"}</div>
                        <div className="text-xs text-gray-500 truncate">{order.user?.email}</div>
                      </div>
                      <div className="col-span-2 text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </div>
                      <div className="col-span-2">
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles(order.orderStatus)}`}>
                           {order.orderStatus}
                         </span>
                      </div>
                      <div className="col-span-1 text-sm font-bold text-gray-900">
                        ₹{order.totalAmount.toLocaleString()}
                      </div>
                      <div className="col-span-2 flex justify-end items-center gap-2">
                        <div className="relative">
                          {updatingId === order._id ? (
                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <select
                              value={order.orderStatus}
                              onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                              disabled={["Delivered", "Cancelled"].includes(order.orderStatus)}
                              className="text-xs border-none bg-transparent focus:ring-0 text-gray-500 hover:text-indigo-600 cursor-pointer outline-none font-medium text-right pr-6"
                            >
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          )}
                        </div>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Mobile Card */}
                    <div className="md:hidden p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold font-mono text-gray-500">#{order._id.slice(-6).toUpperCase()}</span>
                          <h4 className="text-sm font-bold text-gray-900 mt-1">{order.user?.name}</h4>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusStyles(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{formatDate(order.createdAt)}</span>
                        <span className="font-bold text-gray-900">₹{order.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                         <select
                              value={order.orderStatus}
                              onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                              disabled={["Delivered", "Cancelled"].includes(order.orderStatus)}
                              className="bg-gray-50 border border-gray-200 text-xs rounded-md py-1.5 px-2 outline-none"
                            >
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* DRAWER */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDrawer
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
