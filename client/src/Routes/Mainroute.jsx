import React from "react";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";

// Pages
import Login from "@/Components/Auth/Login";
import Register from "@/Components/Auth/Register";
import ForgotPassword from "@/Components/Auth/ForgotPassword";
import VerifyEmail from "@/Components/Auth/VerifyEmail";
import Navbar from "@/Components/Layout/Navbar";

// Route Guards
import PublicRoute from "@/Routes/PublicRoute";
import PrivateRoute from "@/Routes/PrivateRoute";

// Dummy Pages (Replace with real imports)
const Home = () => <div className="pt-24 text-center">Home Page</div>;
const Products = () => <div className="pt-24 text-center">Products Page</div>;
const About = () => <div className="pt-24 text-center">About Page</div>;
const Contact = () => <div className="pt-24 text-center">Contact Page</div>;
const Arasai = () => <div className="pt-24 text-center">Contact Page</div>;
const AdminDashboard = () => <div className="pt-24 text-center text-red-600 font-bold">Admin Dashboard</div>;

const MainLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

function Mainroute() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        
        {/* 1. AUTH ROUTES */}
        {/* NOTE: If you are logged in, PublicRoute will redirect you to Home automatically */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Route>

        {/* 2. PUBLIC PAGES */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="//why-arasi" element={<Arasai />} />

        {/* 3. PROTECTED USER ROUTES */}
        <Route element={<PrivateRoute allowedRoles={["user", "admin"]} />}>
           <Route path="/cart" element={<div className="pt-24 text-center">Cart Page</div>} />
        </Route>

        {/* 4. ADMIN ROUTES */}
        <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
           <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        {/* Catch-all: Redirect to home or login */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Route>
    </Routes>
  );
}

export default Mainroute;