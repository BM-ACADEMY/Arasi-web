// src/Mainroute.js
import React from "react";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";

// Auth & Public Pages
import Login from "@/Components/Auth/Login";
import Navbar from "@/Components/Layout/Navbar";
import PublicRoute from "@/Routes/PublicRoute";
import PrivateRoute from "@/Routes/PrivateRoute";

// Import the new Admin Routes file
import AdminRoutes from "@/Routes/AdminRoutes";
import Register from "@/Components/Auth/Register";
import ForgotPassword from "@/Components/Auth/ForgotPassword";
import VerifyEmail from "@/Components/Auth/VerifyEmail";
import Homeroute from "./Homeroute";

// Dummy Pages
const Products = () => <div className="pt-24 text-center">Products Page</div>;

// PUBLIC LAYOUT
const MainLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

function Mainroute() {
  return (
    <Routes>

      {/* GROUP A: Public Website (With Navbar) */}
      <Route element={<MainLayout />}>
        {/* Auth Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
           <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Route>

        {/* Public Pages */}
        <Route path="/" element={<Homeroute />} />
        <Route path="/products" element={<Products />} />
        <Route path="/about" element={<Products />} />
        <Route path="/why-arasi" element={<Products />} />
        <Route path="/contact" element={<Products />} />

        {/* User Protected Routes */}
        <Route element={<PrivateRoute allowedRoles={["user", "admin"]} />}>
           <Route path="/cart" element={<div className="pt-24 text-center">Cart Page</div>} />
        </Route>
      </Route>


      {/* GROUP B: Admin Routes (Clean & Modular) */}
      <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
        {/* 1. We match "/admin/*" to catch any admin sub-path.
            2. We render <AdminRoutes /> which handles the rest.
        */}
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Route>


      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default Mainroute;
