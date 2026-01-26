import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // App initial load
  const [isButtonLoading, setIsButtonLoading] = useState(false); // NEW: Button Loading
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };
    checkUserLoggedIn();
  }, []);

  // --- REGISTER ---
  const register = async (name, email, password) => {
    setIsButtonLoading(true); // 1. Start Loading
    try {
      await api.post("/auth/register", { name, email, password });
      
      toast.success("OTP sent to your email!");
      navigate("/verify-email", { state: { email } }); 
      
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsButtonLoading(false); // 2. Stop Loading
    }
  };

  // --- LOGIN ---
  const login = async (email, password) => {
    setIsButtonLoading(true); // 1. Start Loading
    try {
      const { data } = await api.post("/auth/login", { email, password });
      
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      toast.success("Logged in successfully!");
      if (data.user.role === "admin") navigate("/admin/dashboard");
      else navigate("/");
      
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setIsButtonLoading(false); // 2. Stop Loading
    }
  };

  // ... keep verifyEmail and logout exactly as they were ...
  const verifyEmail = async (email, otp) => {
    try {
      const { data } = await api.post("/auth/verify-email", { email, otp });
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Email Verified! Welcome.");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    }
  };

  const logout = async () => {
    try { await api.get("/auth/logout"); } catch (e) { console.error(e); }
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        isButtonLoading, // <--- EXPORT THIS
        login, 
        register, 
        verifyEmail, 
        logout 
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);