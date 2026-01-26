import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const PublicRoute = () => {
  const { user } = useAuth();

  if (user) {
    // If logged in, redirect based on role
    return user.role === "admin" 
      ? <Navigate to="/admin/dashboard" replace /> 
      : <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;