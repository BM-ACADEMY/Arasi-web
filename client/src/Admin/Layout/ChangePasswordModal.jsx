import React, { useState } from "react";
import { X, Lock, Eye, EyeOff, KeyRound } from "lucide-react";
import api from "@/services/api"; // Adjust path to where you saved your axios instance
import { toast } from "react-hot-toast";

const ChangePasswordModal = ({ isOpen, onClose }) => {
  // Form State
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Visibility State (Independent for each field)
  const [showPass, setShowPass] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Helper to toggle visibility for a specific field
  const toggleVisibility = (field) => {
    setShowPass((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("New passwords do not match");
    }

    if (formData.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setLoading(true);
    try {
      // Using 'api' instance automatically handles Base URL and Cookies
      const res = await api.put("/auth/update-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if (res.data.success) {
        toast.success("Password Changed Successfully");
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        // Reset visibility
        setShowPass({ current: false, new: false, confirm: false });
        onClose();
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Error updating password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-xl bg-[#1F263E] shadow-2xl border border-gray-700 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700/50 bg-[#151A2D] px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="text-[#FF5722]" size={20} />
            Change Password
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors rounded-full p-1 hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* 1. Current Password */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-400">
              Current Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-2.5 text-gray-500">
                <KeyRound size={18} />
              </div>
              <input
                type={showPass.current ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full rounded-lg bg-[#0F121E] border border-gray-700 py-2.5 pl-10 pr-10 text-sm text-white placeholder-gray-600 focus:border-[#FF5722] focus:outline-none focus:ring-1 focus:ring-[#FF5722] transition-colors"
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                onClick={() => toggleVisibility("current")}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-white transition-colors"
              >
                {showPass.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* 2. New Password */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-400">
              New Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-2.5 text-gray-500">
                <Lock size={18} />
              </div>
              <input
                type={showPass.new ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full rounded-lg bg-[#0F121E] border border-gray-700 py-2.5 pl-10 pr-10 text-sm text-white placeholder-gray-600 focus:border-[#FF5722] focus:outline-none focus:ring-1 focus:ring-[#FF5722] transition-colors"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => toggleVisibility("new")}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-white transition-colors"
              >
                {showPass.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* 3. Confirm Password */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-400">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-2.5 text-gray-500">
                <Lock size={18} />
              </div>
              <input
                type={showPass.confirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-lg bg-[#0F121E] border border-gray-700 py-2.5 pl-10 pr-10 text-sm text-white placeholder-gray-600 focus:border-[#FF5722] focus:outline-none focus:ring-1 focus:ring-[#FF5722] transition-colors"
                placeholder="Retype new password"
                required
              />
              <button
                type="button"
                onClick={() => toggleVisibility("confirm")}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-white transition-colors"
              >
                {showPass.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#FF5722] py-2.5 text-sm font-bold text-white transition-all hover:bg-[#F4511E] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;