// src/Components/Admin/Layout/AdminLayout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, Bell, Search, ChevronDown } from "lucide-react";
import Sidebar from "./Sidebar";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F3F4F6] font-sans">
      {/* Sidebar (Fixed width) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Wrapper (Flex Grow) */}
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-64">

        {/* 1. TOP NAVBAR */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">

          {/* Left: Mobile Toggle & Search */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <Menu size={20} />
            </button>

            {/* Global Search Bar */}
            <div className="hidden items-center rounded-lg bg-gray-100 px-3 py-2 md:flex">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search orders, customers..."
                className="ml-2 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400 w-64"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-6">

            {/* Notifications */}
            <div className="relative cursor-pointer text-gray-500 transition-colors hover:text-[#FF5722]">
              <Bell size={20} />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                3
              </span>
            </div>

            {/* User Dropdown Trigger (Visual Only) */}
            <div className="hidden items-center gap-2 border-l border-gray-200 pl-6 md:flex">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700">John David</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
              <img
                src="https://i.pravatar.cc/150?img=12"
                className="h-9 w-9 rounded-full border border-gray-200"
                alt="Profile"
              />
              <ChevronDown size={16} className="text-gray-400" />
            </div>

          </div>
        </header>

        {/* 2. PAGE CONTENT AREA (Scrollable) */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;
