// src/Components/Admin/navigation.js
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Settings,
  FileText,
  BarChart3
} from "lucide-react";

export const adminSidebarItems = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard // <--- Pass the component name ONLY (No < />)
  },
  {
    name: "Products",
    path: "/admin/products",
    icon: ShoppingBag
  },
  {
    name: "Orders",
    path: "/admin/orders",
    icon: FileText
  },
  {
    name: "Customers",
    path: "/admin/customers",
    icon: Users
  },
  {
    name: "Analytics",
    path: "/admin/analytics",
    icon: BarChart3
  },
  {
    name: "Settings",
    path: "/admin/settings",
    icon: Settings
  },
];
