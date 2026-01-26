import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowRight, ArrowLeft, KeyRound, Lock } from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // 4-Digit OTP State
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // --- Step 1: Send OTP ---
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("OTP sent to your email");
      setStep(2);
      setTimer(30);
      setCanResend(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // --- Resend OTP ---
  const handleResend = async () => {
    try {
      await api.post("/auth/resend-otp", { email });
      toast.success("OTP Resent");
      setTimer(30);
      setCanResend(false);
      setOtp(["", "", "", ""]); 
    } catch (error) {
      toast.error("Failed to resend OTP");
    }
  };

  // --- Step 2: Verify & Reset ---
  const handleVerifyAndReset = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 4) return toast.error("Please enter a valid 4-digit OTP");
    if (!newPassword) return toast.error("Please enter a new password");

    setLoading(true);
    try {
      // Backend expects: { email, otp, newPassword }
      await api.post("/auth/reset-password", { 
        email, 
        otp: otpCode, 
        newPassword 
      });
      toast.success("Password reset successfully! Please login.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  // --- OTP Inputs Logic ---
  const handleOtpChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 3 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
             <div className="w-16 h-16 bg-[#4183cf]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#4183cf]">
                <KeyRound size={28} />
             </div>
            <h2 className="text-2xl font-bold text-slate-800">{step === 1 ? "Forgot Password?" : "Verify OTP"}</h2>
            <p className="text-slate-500 text-sm mt-2">{step === 1 ? "Enter email to receive code." : `Code sent to ${email}`}</p>
          </div>

          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4183cf] outline-none" />
                </div>
              </div>
              <button disabled={loading} className="w-full bg-[#4183cf] text-white py-2.5 rounded-lg font-semibold hover:bg-[#326cad] flex items-center justify-center gap-2">
                {loading ? "Sending..." : <>Send OTP <ArrowRight size={18} /></>}
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* OTP Inputs */}
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input key={index} ref={(el) => (inputRefs.current[index] = el)} type="text" maxLength="1" value={digit} onChange={(e) => handleOtpChange(index, e)} onKeyDown={(e) => handleOtpKeyDown(index, e)} className="w-12 h-12 text-center text-xl font-bold rounded-lg border border-slate-200 focus:border-[#4183cf] outline-none" />
                ))}
              </div>

              {/* New Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="password" placeholder="New password" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-[#4183cf] outline-none" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
              </div>

              <div className="text-center">
                 {canResend ? (
                   <button onClick={handleResend} className="text-sm font-semibold text-[#4183cf] hover:underline">Resend Code</button>
                 ) : (
                   <p className="text-sm text-slate-400">Resend in <span className="text-slate-600 font-medium">{timer}s</span></p>
                 )}
              </div>

              <button onClick={handleVerifyAndReset} disabled={loading} className="w-full bg-[#4183cf] text-white py-2.5 rounded-lg font-semibold hover:bg-[#326cad]">
                {loading ? "Verifying..." : "Reset Password"}
              </button>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#4183cf]">
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;