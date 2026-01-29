// src/Routes/AdminRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layout
import AdminLayout from "@/Admin/Layout/AdminLayout";

// Pages
import DashboardHome from "@/Admin/Pages/Categories/Categories";
import CategoryPage from "@/Admin/Pages/Categories/Categories";
import Subcategories from "@/Admin/Pages/Subcategories/Subcategories";
import Product from "@/Admin/Pages/Product/Product";
import AdminOrderPage from "@/Admin/Pages/Order/Order";
import AdminBanner from "@/Admin/Pages/AdminBanner/AdminBanner";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>

        {/* Redirect /admin → /admin/dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* Dashboard */}
        <Route path="dashboard" element={<>Dashboard</>} />

        {/* Category Management */}
        <Route path="categories" element={<CategoryPage />} />

        {/* Sub Category Management */}
        <Route path="subcategories" element={<Subcategories />} />

        {/* Product Management */}
        <Route path="products" element={<Product />} />
        <Route path="orders" element={<AdminOrderPage />} />
        <Route path="banner" element={<AdminBanner />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />

      </Route>
    </Routes>
  );
};

export default AdminRoutes;
