// src/Mainroute.js
import React from "react";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";

import Login from "@/Components/Auth/Login";
import Navbar from "@/Components/Layout/Navbar";
import PublicRoute from "@/Routes/PublicRoute";
import PrivateRoute from "@/Routes/PrivateRoute";
import Register from "@/Components/Auth/Register";
import ForgotPassword from "@/Components/Auth/ForgotPassword";
import VerifyEmail from "@/Components/Auth/VerifyEmail";
import Homeroute from "./Homeroute";

// Pages
import SubCategoryPage from "@/Components/Pages/Shop/SubCategoryPage";
import ProductListingPage from "@/Components/Pages/Shop/ProductListingPage";
import ProductDetailsPage from "@/Components/Pages/Shop/ProductDetailsPage"; // New Import
import AdminRoutes from "./AdminRoutes";
import CartPage from "@/Components/Pages/Homepage/Cart/Cartpage";
import CheckoutPage from "@/Components/Checkoutpage/Checkoutpage";
import OrderPage from "@/Components/Order/Orderpage";

// Dummy Pages
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

        {/* Public Pages */}
        <Route path="/" element={<Homeroute />} />
        <Route path="/products" element={<Products />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute allowedRoles={["user", "admin"]} />}>
           <Route path="/cart" element={<CartPage/>} />
        </Route>

        {/* --- SHOP ROUTES --- */}

        {/* 1. Single Product Detail (New Route) */}
        <Route path="/product/:slug" element={<ProductDetailsPage />} />

        {/* 2. Category Click -> Shows SubCategories */}
        <Route path="/:categorySlug" element={<SubCategoryPage />} />

        {/* 3. SubCategory Click -> Shows Products */}
        <Route path="/:categorySlug/:subCategorySlug" element={<ProductListingPage />} />


        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrderPage />} />


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
