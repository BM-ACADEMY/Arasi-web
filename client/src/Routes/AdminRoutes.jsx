// src/Routes/AdminRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// 1. Import the Admin Layout (Sidebar + Header)
import AdminLayout from "@/Admin/Layout/AdminLayout";

// 2. Import Admin Pages
import DashboardHome from "@/Admin/Dashboard/DashboardHome";

// Placeholder Components for pages not yet built
const AdminProducts = () => <div className="p-6 text-xl font-bold text-gray-700">Products Management</div>;
const AdminOrders = () => <div className="p-6 text-xl font-bold text-gray-700">Order History</div>;
const AdminCustomers = () => <div className="p-6 text-xl font-bold text-gray-700">Customer List</div>;
const AdminAnalytics = () => <div className="p-6 text-xl font-bold text-gray-700">Analytics & Reports</div>;
const AdminSettings = () => <div className="p-6 text-xl font-bold text-gray-700">System Settings</div>;

const AdminRoutes = () => {
  return (
    <Routes>
      {/* MASTER ADMIN LAYOUT
        This wraps ALL admin pages. The Sidebar & Topbar will appear on every page nested here.
      */}
      <Route element={<AdminLayout />}>

        {/* Default Redirect: If user goes to "/admin", send them to "/admin/dashboard" */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* --- ACTUAL PAGES --- */}

        {/* Dashboard: http://localhost:5173/admin/dashboard */}
        <Route path="dashboard" element={<DashboardHome />} />

        {/* Products: http://localhost:5173/admin/products */}
        <Route path="products" element={<AdminProducts />} />

        {/* Orders: http://localhost:5173/admin/orders */}
        <Route path="orders" element={<AdminOrders />} />

        {/* Customers: http://localhost:5173/admin/customers */}
        <Route path="customers" element={<AdminCustomers />} />

        {/* Analytics: http://localhost:5173/admin/analytics */}
        <Route path="analytics" element={<AdminAnalytics />} />

        {/* Settings: http://localhost:5173/admin/settings */}
        <Route path="settings" element={<AdminSettings />} />

        {/* Catch-all for Admin:
           If they type a random admin URL (e.g. /admin/potato),
           redirect them back to Dashboard
        */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />

      </Route>
    </Routes>
  );
};

export default AdminRoutes;
