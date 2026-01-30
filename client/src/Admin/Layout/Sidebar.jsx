import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { adminSidebarItems } from "../navigation";
import { LogOut, Settings } from "lucide-react"; // Import Settings Icon
import { useAuth } from "@/context/AuthContext";
import ChangePasswordModal from "./ChangePasswordModal"; // Import the Modal

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // State for Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

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
        {/* 1. BRAND LOGO */}
        <div className="flex h-16 items-center border-b border-gray-700/50 px-6">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold tracking-wide text-gray-100">
              Arasi Soaps
            </span>
          </div>
        </div>

        {/* 2. NAVIGATION LINKS */}
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
        </div>

        {/* 3. USER PROFILE FOOTER */}
        <div className="border-t border-gray-700/50 bg-[#151A2D] p-4">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar || "https://imgs.search.brave.com/JqLkOW5ls518f8t5iH3rCS376Any3y5s4Jko9jGBHgg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/a2luZHBuZy5jb20v/cGljYy9tLzI0LTI0/ODI1M191c2VyLXBy/b2ZpbGUtZGVmYXVs/dC1pbWFnZS1wbmct/Y2xpcGFydC1wbmct/ZG93bmxvYWQucG5n"}
              alt="Admin"
              className="h-10 w-10 rounded-full border border-gray-600"
            />
            <div className="flex-1 overflow-hidden">
              <h4 className="truncate text-sm font-semibold text-white">
                {user?.name || "Admin"}
              </h4>
              <p className="truncate text-xs text-gray-400">
                {user?.email}
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-1">
              {/* Settings / Change Password Button */}
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-[#FF5722]"
                title="Change Password"
              >
                <Settings size={18} />
              </button>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-red-400"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Render the Modal */}
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </>
  );
};

export default Sidebar;