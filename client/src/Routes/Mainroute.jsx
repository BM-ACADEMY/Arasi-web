// src/Mainroute.js
import React from "react";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";

// ... existing imports ...
import Login from "@/Components/Auth/Login";
import Navbar from "@/Components/Layout/Navbar";
import PublicRoute from "@/Routes/PublicRoute";
import PrivateRoute from "@/Routes/PrivateRoute";
import Register from "@/Components/Auth/Register";
import ForgotPassword from "@/Components/Auth/ForgotPassword";
import VerifyEmail from "@/Components/Auth/VerifyEmail";
import Homeroute from "./Homeroute";

// --- NEW IMPORTS ---
import SubCategoryPage from "@/Components/Pages/Shop/SubCategoryPage";
import ProductListingPage from "@/Components/Pages/Shop/ProductListingPage";
import AdminRoutes from "./AdminRoutes";

// Dummy Pages (Keep existing)
const Products = () => <div className="pt-24 text-center">Products Page</div>;

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
        {/* Auth Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Route>

        {/* Static Public Pages */}
        <Route path="/" element={<Homeroute />} />
        <Route path="/products" element={<Products />} />
        <Route path="/about" element={<Products />} />
        <Route path="/contact" element={<Products />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute allowedRoles={["user", "admin"]} />}>
           <Route path="/cart" element={<div className="pt-24 text-center">Cart Page</div>} />
        </Route>

        {/* --- DYNAMIC SHOP ROUTES (Must be last in this group) --- */}
        {/* 1. Category Click -> Shows SubCategories */}
        <Route path="/:categorySlug" element={<SubCategoryPage />} />
        
        {/* 2. SubCategory Click -> Shows Products */}
        <Route path="/:categorySlug/:subCategorySlug" element={<ProductListingPage />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default Mainroute;