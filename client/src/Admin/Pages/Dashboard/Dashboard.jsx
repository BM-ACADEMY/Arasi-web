import React, { useEffect, useState, useCallback } from "react";
import api from "@/services/api"; // Adjust path if needed
import { io } from "socket.io-client"; // <--- Import Socket.io
import toast from "react-hot-toast"; // <--- Import Toast for notifications
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import {
  TrendingUp,
  ShoppingBag,
  XCircle,
  AlertCircle,
  Package,
  CreditCard,
  Users,
  ArrowUpRight,
  Calendar,
  Image as ImageIcon,
  Clock,
  Truck,
  CheckCircle,
  Banknote
} from "lucide-react";
import { format, subDays } from "date-fns";

// --- 1. CONFIGURATION ---
// Calculate the Socket URL (Base URL without /api)
const BASE_URL = import.meta.env.VITE_SERVER_URL ;

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath; 
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  return `${BASE_URL}/${cleanPath}`;
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 2. FETCH DATA FUNCTION (Memoized to be called by Socket) ---
  const fetchStats = useCallback(async (isBackgroundUpdate = false) => {
    try {
      if (!isBackgroundUpdate) setLoading(true);
      const res = await api.get("/orders/admin/stats");
      if (res.data.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      if (!isBackgroundUpdate) toast.error("Failed to load dashboard data");
    } finally {
      if (!isBackgroundUpdate) setLoading(false);
    }
  }, []);

  // --- 3. INITIAL LOAD & SOCKET CONNECTION ---
  useEffect(() => {
    // A. Initial Fetch
    fetchStats();

    // B. Setup Socket Connection
    const socket = io(BASE_URL);

    socket.on("connect", () => {
      console.log("Dashboard connected to Socket.io");
    });

    // C. Listen for 'newOrder' event
    socket.on("newOrder", (newOrderData) => {
      console.log("New Order Received:", newOrderData);
      
      // 1. Play a notification sound (Optional)
      const audio = new Audio('/notification.mp3'); // Ensure you have a file or remove this line
      audio.play().catch(e => console.log("Audio play failed", e));

      // 2. Show Toast Notification
      toast.success(
        <div className="flex flex-col">
          <span className="font-bold">New Order Received!</span>
          <span className="text-sm">
            {newOrderData.customerName} spent ₹{newOrderData.amount}
          </span>
        </div>,
        { duration: 4000, position: "top-right" }
      );

      // 3. Refresh Dashboard Data silently (real-time update)
      fetchStats(true); 
    });

    // D. Cleanup on Unmount
    return () => {
      socket.disconnect();
      console.log("Dashboard disconnected");
    };
  }, [fetchStats]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center text-red-500">Failed to load data. Please check your connection.</div>;

  const { stats, topProducts, unsoldProducts, recentOrders, salesTrend } = data;

  // --- Prepare Data for Area Chart ---
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const dateStr = format(subDays(new Date(), i), "yyyy-MM-dd");
    const found = salesTrend?.find((item) => item._id === dateStr);
    chartData.push({
      date: format(subDays(new Date(), i), "MMM dd"),
      revenue: found ? found.dailyRevenue : 0,
      orders: found ? found.dailyOrders : 0,
    });
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen font-sans text-slate-800">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 text-slate-500 mb-1 text-sm font-medium">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(), "EEEE, MMMM do, yyyy")}</span>
           </div>
           <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
             Dashboard Overview
             {/* Live Indicator */}
             <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
             </span>
           </h1>
        </div>
      </div>

      {/* --- 1. STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
          bg="bg-emerald-50"
          trend="+12.5%" 
          trendColor="text-emerald-600"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<ShoppingBag className="w-6 h-6 text-blue-600" />}
          bg="bg-blue-50"
          trend="+5.2%"
          trendColor="text-blue-600"
        />
        <StatCard
          title="Avg. Order Value"
          value={`₹${stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders) : 0}`}
          icon={<CreditCard className="w-6 h-6 text-violet-600" />}
          bg="bg-violet-50"
          trend="+3.4%"
          trendColor="text-violet-600"
        />
        
        {/* Cancelled Count */}
        <StatCard
          title="Cancelled Orders"
          value={stats.totalCancelledOrders}
          icon={<XCircle className="w-6 h-6 text-rose-600" />}
          bg="bg-rose-50"
          trend="-2.1%"
          trendColor="text-rose-600"
          desc="volume"
        />

        {/* Cancelled Amount */}
        <StatCard
          title="Cancelled Amount"
          value={`₹${stats.totalCancelledAmount?.toLocaleString() || 0}`}
          icon={<Banknote className="w-6 h-6 text-red-600" />}
          bg="bg-red-50"
          trend="Lost Revenue"
          trendColor="text-red-700 font-bold bg-red-100"
          desc="refunded/void"
        />
      </div>

      {/* --- 2. CHARTS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" /> Revenue Trends
            </h2>
            <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-xs font-medium text-slate-400">Live</span>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} 
                  tickFormatter={(value) => `₹${value}`} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "12px", color: "#fff", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                  itemStyle={{ color: "#e2e8f0" }}
                  cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-500" /> Top Selling
          </h2>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100} 
                  tick={{fontSize: 11, fill: '#64748b', fontWeight: 500}} 
                  interval={0}
                  tickFormatter={(val) => val.length > 12 ? `${val.substring(0, 12)}...` : val}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="totalSold" radius={[0, 6, 6, 0]} barSize={24}>
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#818cf8" : "#a5b4fc"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- 3. RECENT ORDERS TABLE --- */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" /> Recent Orders
            </h2>
            <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded-full transition">
              View All Orders
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 text-sm font-mono text-slate-500 group-hover:text-indigo-600 transition-colors">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 flex items-center justify-center font-bold text-xs shadow-sm">
                          {order.user?.name?.charAt(0) || "G"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{order.user?.name || "Guest User"}</p>
                          <p className="text-xs text-slate-400">{format(new Date(order.createdAt), "MMM dd, HH:mm")}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-700">
                      ₹{order.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- 4. UNSOLD PRODUCTS --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
           <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" /> Needs Attention
            </h2>
            <p className="text-xs text-slate-400 mt-1">Zero sales detected</p>
          </div>
          <div className="p-4 space-y-3 overflow-y-auto max-h-[400px]">
            {unsoldProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-emerald-500">
                <Package className="w-10 h-10 mb-2 opacity-50" />
                <p className="font-medium">All products are moving!</p>
              </div>
            ) : (
              unsoldProducts.map((prod) => {
                const imgUrl = getImageUrl(prod.images?.[0]);
                return (
                  <div key={prod._id} className="flex items-center gap-4 p-3 rounded-xl border border-dashed border-slate-200 hover:border-orange-200 hover:bg-orange-50/30 transition group">
                    <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 relative">
                      {imgUrl ? (
                         <img src={imgUrl} alt={prod.name} className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-slate-400">
                           <ImageIcon size={20} />
                         </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-orange-700 transition-colors">
                        {prod.name}
                      </p>
                      <p className="text-xs text-slate-400">{prod.brand}</p>
                    </div>
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-md uppercase tracking-wide">
                      Stagnant
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const StatCard = ({ title, value, icon, bg, trend, trendColor, desc = "vs last month" }) => (
  <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-100 hover:-translate-y-1 transition-transform duration-300">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-extrabold text-slate-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${bg}`}>
        {icon}
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center gap-1 text-xs font-medium">
        <span className={`${trendColor} bg-slate-50 px-1.5 py-0.5 rounded`}>
          {trend}
        </span>
        <span className="text-slate-400">{desc}</span>
      </div>
    )}
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    Processing: "bg-blue-50 text-blue-700 border-blue-100",
    Shipped: "bg-purple-50 text-purple-700 border-purple-100",
    Delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Cancelled: "bg-rose-50 text-rose-700 border-rose-100",
  };
  
  const iconMap = {
    Processing: Clock,
    Shipped: Truck,
    Delivered: CheckCircle,
    Cancelled: XCircle
  };

  const IconComponent = iconMap[status] || AlertCircle;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
      <IconComponent className="w-3.5 h-3.5" />
      {status}
    </span>
  );
};

export default Dashboard;