// src/Components/Admin/Layout/AdminLayout.jsx
import React, { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Menu, Bell, ChevronDown, Package } from "lucide-react";
import Sidebar from "./Sidebar";
import { useAuth } from "@/context/AuthContext";
import { io } from "socket.io-client";

// Initialize socket outside the component to prevent multiple connections
const socket = io(import.meta.env.VITE_SERVER_URL );

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  // -- Notification Logic --
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  // 1. Listen for new orders
  useEffect(() => {
    socket.on("newOrder", (data) => {
      // Optional: Add a simple sound here
      // const audio = new Audio("/sounds/notification.mp3");
      // audio.play().catch(e => console.log(e));

      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off("newOrder");
    };
  }, []);

  // 2. Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. Handle click on a notification item
  const handleNotificationClick = () => {
    setShowNotifications(false);
    setUnreadCount(0); // Clear count on view, or decrease one by one
    navigate("/admin/orders"); // Navigate to orders page
  };

  return (
    <div className="flex h-screen bg-[#F3F4F6] font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden lg:ml-64">

        {/* TOP NAVBAR */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm relative z-20">

          {/* Left: Mobile Toggle & Search */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <Menu size={20} />
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-6">

            {/* --- NOTIFICATIONS BELL --- */}
            <div className="relative" ref={notificationRef}>
              <div
                className="relative cursor-pointer text-gray-500 transition-colors hover:text-[#FF5722]"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </div>

              {/* DROPDOWN MENU */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 transform rounded-xl border border-gray-100 bg-white shadow-2xl transition-all">
                  <div className="flex items-center justify-between border-b px-4 py-3 bg-gray-50 rounded-t-xl">
                    <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                    <button
                      onClick={() => { setNotifications([]); setUnreadCount(0); }}
                      className="text-xs text-[#FF5722] hover:underline"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-gray-500">
                        <p className="text-sm">No new orders yet</p>
                      </div>
                    ) : (
                      notifications.map((notif, index) => (
                        <div
                          key={index}
                          onClick={handleNotificationClick}
                          className="flex cursor-pointer items-start gap-3 border-b px-4 py-3 transition-colors hover:bg-gray-50 last:border-0"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 mt-1">
                            <Package size={16} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">
                              New Order Placed!
                            </p>
                            <p className="text-xs text-gray-500">
                              <span className="font-semibold">{notif.customerName}</span> ordered items worth ₹{notif.amount}
                            </p>
                            <p className="mt-1 text-[10px] text-gray-400">
                              {new Date(notif.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* ------------------------ */}

            {/* User Dropdown Trigger */}
            <div className="hidden items-center gap-2 border-l border-gray-200 pl-6 md:flex">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700">
                    {user?.name || "Admin"}
                </p>
                <p className="text-xs text-gray-500 uppercase">
                    {user?.role || "User"}
                </p>
              </div>
            </div>

          </div>
        </header>

        {/* PAGE CONTENT AREA */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <div className="mx-auto max-w-8xl">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;
