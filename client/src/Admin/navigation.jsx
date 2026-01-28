// src/Components/Admin/navigation.js
import {
  LayoutDashboard,
  Layers,
  ListTree,
  ShoppingBag,
  Box,
  ImageIcon
} from "lucide-react";

export const adminSidebarItems = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Categories",
    path: "/admin/categories",
    icon: Layers,
  },
  {
    name: "Sub Categories",
    path: "/admin/subcategories",
    icon: ListTree,
  },
  {
    name: "Products",
    path: "/admin/products",
    icon: ShoppingBag,
  },
  {
    name: "Orders",
    path: "/admin/orders",
    icon: Box,
  },
  {
    name: "Banner",
    path: "/admin/banner",
    icon: ImageIcon,
  },
];
