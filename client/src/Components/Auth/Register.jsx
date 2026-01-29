import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/context/AuthContext";

const Register = () => {
  const { register, isButtonLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    register(formData.name, formData.email, formData.password);
  };

  return (
    <div className="min-h-screen pt-45 flex items-center justify-center bg-slate-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <img src={logo} alt="Logo" className="h-10 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800">Create Account</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  required
                  disabled={isButtonLoading}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4183cf] outline-none disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  disabled={isButtonLoading}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4183cf] outline-none disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isButtonLoading}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 focus:border-[#4183cf] outline-none disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  disabled={isButtonLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isButtonLoading}
              className={`w-full bg-[#4183cf] text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 mt-4 transition-all duration-200
                ${isButtonLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#326cad] hover:shadow-md active:scale-[0.98]"}`}
            >
              {isButtonLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Processing...
                </>
              ) : (
                <>
                  Sign Up <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className="font-semibold text-[#4183cf] hover:underline">Log In</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
