// src/Admin/navigation.jsx
import {
  LayoutDashboard,
  Layers,
  ListTree,
  ShoppingBag,
  Box,
  ImageIcon,
  MessageSquare, // Recommended for complaints
  Share2
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
  {
    name: "Social Media",
    path: "/admin/social-media",
    icon: Share2,
  },
  {
    name: "Complaints",
    path: "/admin/complaints", // Path updated for consistency
    icon: MessageSquare,
  },
];