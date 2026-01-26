import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { KeyRound, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const VerifyEmail = () => {
  const { state } = useLocation();
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  
  // If user tries to access this page directly without registering first
  if (!state?.email) {
      navigate("/register");
  }

  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);

  const handleVerify = (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 4) return toast.error("Enter full OTP");
    verifyEmail(state.email, otpCode);
  };

  const handleChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 3) inputRefs.current[index + 1].focus();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 pt-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-[#4183cf]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#4183cf]">
              <KeyRound size={28} />
           </div>
           <h2 className="text-2xl font-bold text-slate-800">Verify Email</h2>
           <p className="text-slate-500 text-sm mt-2">Enter code sent to {state?.email}</p>
        </div>

        <div className="flex justify-center gap-3 mb-6">
            {otp.map((digit, index) => (
                <input key={index} ref={(el) => (inputRefs.current[index] = el)} type="text" maxLength="1" value={digit} onChange={(e) => handleChange(index, e)} className="w-12 h-12 text-center text-xl font-bold rounded-lg border border-slate-200 focus:border-[#4183cf] outline-none" />
            ))}
        </div>

        <button onClick={handleVerify} className="w-full bg-[#4183cf] text-white py-2.5 rounded-lg font-semibold hover:bg-[#326cad] flex items-center justify-center gap-2">
            Verify Account <ArrowRight size={18} />
        </button>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;