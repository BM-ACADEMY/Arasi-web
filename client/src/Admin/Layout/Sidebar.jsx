// src/Components/Admin/Layout/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { adminSidebarItems } from "../navigation";
import { LogOut, Settings, HelpCircle } from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-[#1F263E] text-white transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* 1. BRAND LOGO AREA */}
        <div className="flex h-16 items-center border-b border-gray-700/50 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF5722] font-bold text-white">
              P
            </div>
            <span className="text-lg font-bold tracking-wide text-gray-100">
              Pluto<span className="text-[#FF5722]">UI</span>
            </span>
          </div>
        </div>

        {/* 2. NAVIGATION LINKS (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-6">
          <div className="px-6 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Main Menu
          </div>
          <nav className="space-y-1 px-3">
            {adminSidebarItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#FF5722] text-white shadow-md shadow-orange-500/20"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <item.icon
                    size={20}
                    className={`${isActive ? "text-white" : "text-gray-400 group-hover:text-white"}`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Secondary Group Example */}
          <div className="mt-8 px-6 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Support
          </div>
          <nav className="space-y-1 px-3">
             <Link to="/admin/help" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-all hover:bg-gray-800 hover:text-white">
                <HelpCircle size={20} /> Help Center
             </Link>
             <Link to="/admin/settings" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-all hover:bg-gray-800 hover:text-white">
                <Settings size={20} /> Settings
             </Link>
          </nav>
        </div>

        {/* 3. USER PROFILE FOOTER (Sticky at bottom) */}
        <div className="border-t border-gray-700/50 bg-[#151A2D] p-4">
          <div className="flex items-center gap-3">
            <img
              src="https://i.pravatar.cc/150?img=12"
              alt="Admin"
              className="h-10 w-10 rounded-full border border-gray-600"
            />
            <div className="flex-1 overflow-hidden">
              <h4 className="truncate text-sm font-semibold text-white">John David</h4>
              <p className="truncate text-xs text-gray-400">john@pluto.com</p>
            </div>
            <button className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
