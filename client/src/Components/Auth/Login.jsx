import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react"; // Added Loader2
import logo from "@/assets/logo.png";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false); // New loading state

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Assuming login is an async function that returns a Promise
      await login(formData.email, formData.password);
    } catch (error) {
      console.error("Login failed:", error);
      // Optional: Add error handling logic here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-35 flex items-center justify-center bg-slate-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <img src={logo} alt="Logo" className="h-10 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  disabled={isLoading} // Disable input during loading
                  placeholder="name@company.com" // Added placeholder
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4183cf] outline-none disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-[#4183cf] hover:underline">Forgot Password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isLoading} // Disable input during loading
                  placeholder="••••••••" // Added placeholder
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 focus:border-[#4183cf] outline-none disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button with Loading State */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-[#4183cf] text-white py-2.5 rounded-lg font-semibold
                flex items-center justify-center gap-2 transition-all duration-200
                ${isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#326cad] hover:shadow-md active:scale-[0.98]"}`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            Don't have an account? <Link to="/register" className="font-semibold text-[#4183cf] hover:underline">Create Account</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
