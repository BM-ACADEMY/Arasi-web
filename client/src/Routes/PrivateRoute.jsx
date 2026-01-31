import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const PrivateRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  // 1. Wait for loading to finish before checking for user
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // 2. If no user after loading, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Role Based Access Control
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user tries to access admin route but is not admin
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
