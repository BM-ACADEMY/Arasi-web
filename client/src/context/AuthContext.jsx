import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // App initial load
  const [isButtonLoading, setIsButtonLoading] = useState(false); // Button Loading
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        // 1. Try to fetch the profile from the server (using the httpOnly cookie)
        const { data } = await api.get("/auth/profile");

        if (data.success && data.user) {
          setUser(data.user);
          // Sync localStorage just in case, but Server is the source of truth
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          // Response success is false
          setUser(null);
          localStorage.removeItem("user");
        }
      } catch (error) {
        // 2. If server call fails (e.g. 401 Unauthorized), clear user
        // console.log("Not authenticated", error);
        setUser(null);
        localStorage.removeItem("user");
      } finally {
        // 3. Always finish loading
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // --- REGISTER ---
  const register = async (name, email, password) => {
    setIsButtonLoading(true);
    try {
      await api.post("/auth/register", { name, email, password });
      toast.success("OTP sent to your email!");
      navigate("/verify-email", { state: { email } });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsButtonLoading(false);
    }
  };

  // --- LOGIN ---
  const login = async (email, password) => {
    setIsButtonLoading(true);
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
      setIsButtonLoading(false);
    }
  };

  // --- VERIFY EMAIL ---
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

  // --- LOGOUT ---
  const logout = async () => {
    try {
      await api.get("/auth/logout");
      toast.success("Logged out successfully");
    } catch (e) {
      console.error(e);
    }

    // Clear local state
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login"); // Usually better to send to login on logout
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isButtonLoading,
        login,
        register,
        verifyEmail,
        logout
      }}
    >
      {!loading ? children : <div className="flex justify-center items-center h-screen">Loading...</div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
