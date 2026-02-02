// import React, { useState, useEffect, useRef } from "react";
// import { Link, useLocation } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   ShoppingBag,
//   User,
//   Menu,
//   X,
//   LogOut,
//   Package,
//   Settings,
//   LayoutDashboard,
//   Phone,
//   Mail,
//   Search,
//   FileText,
//   AlertCircle,
//   ChevronDown
// } from "lucide-react";
// import logo from "@/assets/logo.png";
// import SearchBar from "./SearchBar";
// import { useAuth } from "@/context/AuthContext";
// import { useCart } from "@/context/CartContext";
// import ComplaintDrawer from "@/Components/Layout/Complaint/ComplaintDrawer";
// import api from "@/services/api";
// import { io } from "socket.io-client";

// const Navbar = () => {
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isSearchOpen, setIsSearchOpen] = useState(false);
//   const [isComplaintOpen, setIsComplaintOpen] = useState(false);

//   // New State for Red Dot
//   const [hasUnreadSupport, setHasUnreadSupport] = useState(false);
//   const socketRef = useRef(null);

//   const { cartCount } = useCart();
//   const location = useLocation();
//   const { user, logout } = useAuth();
//   const isAdmin = user?.role === 'admin';

//   useEffect(() => {
//     const handleScroll = () => setIsScrolled(window.scrollY > 20);
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const checkUnreadSupport = async () => {
//     if (!user || isAdmin) return;
//     try {
//       const { data } = await api.get("/complaints/my");
//       if (data.success) {
//         const hasUnread = data.complaints.some(c =>
//           c.messages.length > 0 &&
//           c.messages[c.messages.length - 1].sender === "Admin" &&
//           !c.messages[c.messages.length - 1].seen
//         );
//         setHasUnreadSupport(hasUnread);
//       }
//     } catch (error) {
//       console.error("Failed to check unread support messages", error);
//     }
//   };

//   // --- UPDATED SOCKET & STATE LOGIC ---
//   useEffect(() => {
//     if (user && !isAdmin) {
//       // 1. Initial Check via API
//       checkUnreadSupport();

//       // 2. Setup Real-time Socket
//       socketRef.current = io(import.meta.env.VITE_SERVER_URL);
//       socketRef.current.on("newMessage", ({ message }) => {
//         if (message.sender === "Admin") {
//           setHasUnreadSupport(true);
//         }
//       });

//       // Cleanup function
//       return () => {
//         if (socketRef.current) socketRef.current.disconnect();
//       };
//     } else {
//       // --- THE FIX: RESET STATE WHEN LOGGED OUT ---
//       setHasUnreadSupport(false);
//       if (socketRef.current) {
//         socketRef.current.disconnect();
//         socketRef.current = null;
//       }
//     }
//   }, [user, isAdmin]);

//   const handleDrawerClose = () => {
//     setIsComplaintOpen(false);
//     checkUnreadSupport();
//   };

//   const navLinks = [
//     { name: "Home", path: "/" },
//     { name: "Product", path: "/shop" },
//     { name: "About", path: "/about" },
//     { name: "Contact", path: "/contact" },
//   ];

//   const getInitials = (name) => {
//     return name ? name.charAt(0).toUpperCase() : "U";
//   };

//   return (
//     <>
//       <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans ${
//         isScrolled ? "bg-white/95 backdrop-blur-md shadow-md" : "bg-white border-b border-gray-100 shadow-sm"
//       }`}>

//         {/* --- 1. UTILITY BAR (Desktop Only) --- */}
//         <div className="hidden lg:block border-b border-gray-200/60 bg-gray-50/50">
//           <div className="container mx-auto px-8 py-2 flex justify-between items-center text-xs font-medium text-slate-500">
//             <div className="flex items-center gap-6">
//               <span className="flex items-center gap-2 hover:text-[#006baf] cursor-pointer transition-colors">
//                 <Phone size={13} className="text-[#006baf]" /> +91 8682967445
//               </span>
//               <span className="flex items-center gap-2 hover:text-[#006baf] cursor-pointer transition-colors">
//                 <Mail size={13} className="text-[#006baf]" /> arasisoap@gmail.com
//               </span>
//               <span className="flex items-center gap-2 cursor-default">
//                 <FileText size={13} className="text-[#006baf]" />
//                 GST: <span className="text-slate-700">34CQMPS5041M1ZB</span>
//               </span>
//             </div>

//             {/* --- PROFILE SECTION --- */}
//             <div className="flex items-center gap-4">
//               <div className="relative group z-50">
//                 {user ? (
//                   // LOGGED IN STATE
//                   <button className="flex items-center gap-2 py-1 focus:outline-none">
//                     <div className="w-7 h-7 rounded-full bg-[#006baf] text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-white ring-offset-1 group-hover:ring-[#006baf] transition-all">
//                       {getInitials(user.name)}
//                     </div>
//                     <span className="max-w-[100px] truncate font-semibold text-slate-700 group-hover:text-[#006baf] transition-colors">
//                       {user.name}
//                     </span>
//                     <ChevronDown size={14} className="text-slate-400 group-hover:text-[#006baf] transition-colors" />

//                     {/* Red Dot Indicator (Only shows if hasUnreadSupport is true AND user exists) */}
//                     {hasUnreadSupport && (
//                       <span className="absolute top-0 left-5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
//                     )}
//                   </button>
//                 ) : (
//                   // GUEST STATE
//                   <Link to="/login" className="flex items-center gap-1.5 hover:text-[#006baf] py-2 transition-colors font-semibold text-slate-600">
//                     <User size={20} />
//                     <span>Login</span>
//                   </Link>
//                 )}

//                 {/* --- DROPDOWN --- */}
//                 {user && (
//                   <div className="absolute right-0 top-full pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
//                     <div className="bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden ring-1 ring-black/5">

//                       <div className="px-5 py-4 bg-gray-50/80 border-b border-gray-100">
//                         <p className="text-sm font-bold text-slate-800">Signed in as</p>
//                         <p className="text-xs text-slate-500 truncate font-medium">{user.email}</p>
//                       </div>

//                       <div className="p-2 space-y-1">
//                         {isAdmin ? (
//                           <Link to="/admin/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-[#006baf] rounded-lg transition-colors font-medium">
//                             <LayoutDashboard size={16} /> Dashboard
//                           </Link>
//                         ) : (
//                           <>
//                             <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-[#006baf] rounded-lg transition-colors font-medium">
//                               <Settings size={16} /> My Profile
//                             </Link>
//                             <Link to="/orders" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-[#006baf] rounded-lg transition-colors font-medium">
//                               <Package size={16} /> My Orders
//                             </Link>

//                             <button
//                               onClick={() => setIsComplaintOpen(true)}
//                               className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-[#006baf] rounded-lg text-left group transition-colors font-medium"
//                             >
//                               <div className="flex items-center gap-3">
//                                 <AlertCircle size={16} /> Support Center
//                               </div>
//                               {hasUnreadSupport && (
//                                 <span className="h-2 w-2 rounded-full bg-red-500 shadow-sm"></span>
//                               )}
//                             </button>
//                           </>
//                         )}

//                         <div className="h-px bg-gray-100 my-1 mx-2"></div>

//                         <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg text-left transition-colors font-semibold">
//                           <LogOut size={16} /> Sign Out
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <Link to="/cart" className="relative hover:text-[#006baf] transition-colors text-slate-600">
//                 <ShoppingBag size={20} />
//                 {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-[#eb2b32] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">{cartCount}</span>}
//               </Link>
//             </div>
//           </div>
//         </div>

//         {/* --- 2. MAIN NAVIGATION --- */}
//         <div className="container mx-auto px-4 md:px-8 py-3 lg:py-4">
//           <div className="flex items-center justify-between">

//             <div className="flex-1 flex items-center justify-start gap-4">
//               <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-1 text-slate-800 hover:text-[#006baf]">
//                 <Menu size={24} />
//               </button>

//               <div className="flex items-start">
//                 <Link to="/" className="flex-shrink-0">
//                   <img src={logo} alt="Arasi Soap" className="h-9 md:h-12 w-auto object-contain" />
//                 </Link>

//                 <div className="relative group cursor-pointer ml-1">
//                   <span className="text-[14px] md:text-[16px] font-bold text-slate-400 select-none">®</span>
//                   <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-max bg-slate-800 text-white text-[10px] py-1 px-2 rounded shadow-lg z-[70]">
//                     Trade Mark No. 4296577
//                     <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* CENTER: Nav Links (Desktop Only) */}
//             <div className="hidden lg:flex flex-initial">
//               <ul className="flex items-center gap-10">
//                 {navLinks.map((link) => (
//                   <li key={link.name}>
//                     <Link
//                       to={link.path}
//                       className={`text-[15px] font-semibold tracking-wide capitalize transition-all duration-200 ${
//                         location.pathname === link.path
//                           ? "text-[#eb2b32]"
//                           : "text-slate-700 hover:text-[#006baf]"
//                       }`}
//                     >
//                       {link.name}
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             {/* RIGHT: Search & Cart (Mobile/Tablet) */}
//             <div className="flex-1 flex items-center justify-end gap-3 md:gap-4">
//               <button
//                 onClick={() => setIsSearchOpen(true)}
//                 className="hidden lg:block text-slate-700 hover:text-[#006baf] transition-colors p-2 hover:bg-gray-100 rounded-full"
//               >
//                 <Search size={20} />
//               </button>

//               <div className="flex items-center gap-3 lg:hidden">
//                 <button
//                   onClick={() => setIsSearchOpen(true)}
//                   className="text-slate-800 hover:text-[#006baf] p-1"
//                 >
//                   <Search size={22} />
//                 </button>
//                 <Link to="/cart" className="relative text-slate-800 p-1">
//                   <ShoppingBag size={22} />
//                   {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-[#eb2b32] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{cartCount}</span>}
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>
//       </nav>

//       <SearchBar isOpen={isSearchOpen} onToggle={setIsSearchOpen} />
//       <ComplaintDrawer isOpen={isComplaintOpen} onClose={handleDrawerClose} />

//       {/* --- MOBILE MENU OVERLAY --- */}
//       <AnimatePresence>
//         {isMobileMenuOpen && (
//           <motion.div className="fixed inset-0 z-[60] lg:hidden font-sans">
//             <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
//             <motion.div
//               initial={{ x: "-100%" }} animate={{ x: "0%" }} exit={{ x: "-100%" }}
//               transition={{ type: "spring", damping: 25, stiffness: 200 }}
//               className="fixed top-0 left-0 bottom-0 w-[85%] max-w-xs bg-white z-50 shadow-2xl flex flex-col"
//             >
//               <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100 bg-white">
//                  <img src={logo} alt="Logo" className="h-8 w-auto" />
//                  <button onClick={() => setIsMobileMenuOpen(false)} className="bg-gray-100 p-2 rounded-full text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"><X size={20} /></button>
//               </div>

//               <div className="flex-1 overflow-y-auto px-6 py-4">
//                  <div className="space-y-2">
//                     {navLinks.map((link) => (
//                         <Link key={link.name} to={link.path} onClick={() => setIsMobileMenuOpen(false)}
//                         className={`block py-3 px-4 rounded-lg text-sm font-semibold tracking-wide ${location.pathname === link.path ? "bg-red-50 text-[#eb2b32]" : "text-slate-600 hover:bg-gray-50"}`}>
//                           {link.name}
//                         </Link>
//                     ))}
//                  </div>
//               </div>

//               <div className="bg-gray-50 px-6 py-6 border-t border-gray-100">
//                 {user ? (
//                   <div className="space-y-4">
//                       <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
//                         <div className="w-10 h-10 rounded-full bg-[#006baf] text-white flex items-center justify-center font-bold text-sm shadow-md">{getInitials(user.name)}</div>
//                         <div className="overflow-hidden">
//                             <p className="font-bold text-slate-800 text-sm truncate">{user.name}</p>
//                             <p className="text-xs text-slate-500 truncate">{user.email}</p>
//                         </div>
//                       </div>

//                       <div className="grid grid-cols-2 gap-2">
//                         {isAdmin ? (
//                           <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="col-span-2 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-white border border-gray-200 rounded-lg text-slate-700 hover:bg-blue-50 hover:border-blue-200 transition-colors"><LayoutDashboard size={16} /> Dashboard</Link>
//                         ) : (
//                           <>
//                             <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-white border border-gray-200 rounded-lg text-slate-700 hover:bg-blue-50 hover:border-blue-200 transition-colors"><Settings size={16} /> Profile</Link>
//                             <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-white border border-gray-200 rounded-lg text-slate-700 hover:bg-blue-50 hover:border-blue-200 transition-colors"><Package size={16} /> Orders</Link>
//                             <button
//                                 onClick={() => { setIsMobileMenuOpen(false); setIsComplaintOpen(true); }}
//                                 className="col-span-2 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-white border border-gray-200 rounded-lg text-slate-700 hover:bg-blue-50 hover:border-blue-200 transition-colors relative"
//                             >
//                                 <AlertCircle size={16} /> Support Center
//                                 {hasUnreadSupport && <span className="absolute top-2 right-4 h-2 w-2 rounded-full bg-red-500"></span>}
//                             </button>
//                           </>
//                         )}
//                       </div>
//                       <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 shadow-lg shadow-red-200 transition-colors"><LogOut size={16} /> Logout</button>
//                   </div>
//                 ) : (
//                   <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 bg-[#eb2b32] text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:shadow-xl transition-all"><User size={18} /> Sign In / Register</Link>
//                 )}
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// };

// export default Navbar;


import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  User,
  Menu,
  X,
  LogOut,
  Package,
  Settings,
  LayoutDashboard,
  Phone,
  Mail,
  Search,
  FileText,
  AlertCircle,
  ChevronDown
} from "lucide-react";
import logo from "@/assets/logo.png";
import SearchBar from "./SearchBar";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import ComplaintDrawer from "@/Components/Layout/Complaint/ComplaintDrawer";
import api from "@/services/api";
import { io } from "socket.io-client";
import toast, { Toaster } from 'react-hot-toast'; // Import Toaster

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isComplaintOpen, setIsComplaintOpen] = useState(false);

  // New State for Red Dot
  const [hasUnreadSupport, setHasUnreadSupport] = useState(false);
  const socketRef = useRef(null);

  const { cartCount } = useCart();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Helper for System Notifications
  const showSystemNotification = (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, { 
        body, 
        icon: logo // Ensure this path is correct
      });
    }
  };

  const checkUnreadSupport = async () => {
    if (!user || isAdmin) return;
    try {
      const { data } = await api.get("/complaints/my");
      if (data.success) {
        const hasUnread = data.complaints.some(c =>
          c.messages.length > 0 &&
          c.messages[c.messages.length - 1].sender === "Admin" &&
          !c.messages[c.messages.length - 1].seen
        );
        setHasUnreadSupport(hasUnread);
      }
    } catch (error) {
      console.error("Failed to check unread support messages", error);
    }
  };

  // --- UPDATED SOCKET & STATE LOGIC ---
  useEffect(() => {
    if (user && !isAdmin) {
      // 0. Request Notification Permission
      if (Notification.permission !== "granted") {
        Notification.requestPermission();
      }

      // 1. Initial Check via API
      checkUnreadSupport();

      // 2. Setup Real-time Socket
      socketRef.current = io(import.meta.env.VITE_SERVER_URL);
      
      socketRef.current.on("newMessage", ({ message, complaintId }) => {
        // Only notify if the sender is Admin (Support)
        if (message.sender === "Admin") {
          setHasUnreadSupport(true);
          
          // Trigger System Notification (Outside Browser)
          showSystemNotification("New Message from arasi soap", message.message);
          
          // Trigger In-App Toast
          // toast('New message from Support!', {
          //   duration: 4000,
          // });
        }
      });

      // Cleanup function
      return () => {
        if (socketRef.current) socketRef.current.disconnect();
      };
    } else {
      // --- RESET STATE WHEN LOGGED OUT ---
      setHasUnreadSupport(false);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    }
  }, [user, isAdmin]);

  const handleDrawerClose = () => {
    setIsComplaintOpen(false);
    checkUnreadSupport();
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Product", path: "/shop" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <>
      <Toaster position="top-center" /> {/* Add Toaster here */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-md" : "bg-white border-b border-gray-100 shadow-sm"
      }`}>

        {/* --- 1. UTILITY BAR (Desktop Only) --- */}
        <div className="hidden lg:block border-b border-gray-200/60 bg-gray-50/50">
          <div className="container mx-auto px-8 py-2 flex justify-between items-center text-xs font-medium text-slate-500">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2 hover:text-[#006baf] cursor-pointer transition-colors">
                <Phone size={13} className="text-[#006baf]" /> +91 8682967445
              </span>
              <span className="flex items-center gap-2 hover:text-[#006baf] cursor-pointer transition-colors">
                <Mail size={13} className="text-[#006baf]" /> arasisoap@gmail.com
              </span>
              <span className="flex items-center gap-2 cursor-default">
                <FileText size={13} className="text-[#006baf]" />
                GST: <span className="text-slate-700">34CQMPS5041M1ZB</span>
              </span>
            </div>

            {/* --- PROFILE SECTION --- */}
            <div className="flex items-center gap-4">
              <div className="relative group z-50">
                {user ? (
                  // LOGGED IN STATE
                  <button className="flex items-center gap-2 py-1 focus:outline-none">
                    <div className="w-7 h-7 rounded-full bg-[#006baf] text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-white ring-offset-1 group-hover:ring-[#006baf] transition-all">
                      {getInitials(user.name)}
                    </div>
                    <span className="max-w-[100px] truncate font-semibold text-slate-700 group-hover:text-[#006baf] transition-colors">
                      {user.name}
                    </span>
                    <ChevronDown size={14} className="text-slate-400 group-hover:text-[#006baf] transition-colors" />

                    {/* Red Dot Indicator */}
                    {hasUnreadSupport && (
                      <span className="absolute top-0 left-5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
                    )}
                  </button>
                ) : (
                  // GUEST STATE
                  <Link to="/login" className="flex items-center gap-1.5 hover:text-[#006baf] py-2 transition-colors font-semibold text-slate-600">
                    <User size={20} />
                    <span>Login</span>
                  </Link>
                )}

                {/* --- DROPDOWN --- */}
                {user && (
                  <div className="absolute right-0 top-full pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                    <div className="bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden ring-1 ring-black/5">

                      <div className="px-5 py-4 bg-gray-50/80 border-b border-gray-100">
                        <p className="text-sm font-bold text-slate-800">Signed in as</p>
                        <p className="text-xs text-slate-500 truncate font-medium">{user.email}</p>
                      </div>

                      <div className="p-2 space-y-1">
                        {isAdmin ? (
                          <Link to="/admin/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-[#006baf] rounded-lg transition-colors font-medium">
                            <LayoutDashboard size={16} /> Dashboard
                          </Link>
                        ) : (
                          <>
                            <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-[#006baf] rounded-lg transition-colors font-medium">
                              <Settings size={16} /> My Profile
                            </Link>
                            <Link to="/orders" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-[#006baf] rounded-lg transition-colors font-medium">
                              <Package size={16} /> My Orders
                            </Link>

                            <button
                              onClick={() => setIsComplaintOpen(true)}
                              className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-[#006baf] rounded-lg text-left group transition-colors font-medium"
                            >
                              <div className="flex items-center gap-3">
                                <AlertCircle size={16} /> Support Center
                              </div>
                              {hasUnreadSupport && (
                                <span className="h-2 w-2 rounded-full bg-red-500 shadow-sm"></span>
                              )}
                            </button>
                          </>
                        )}

                        <div className="h-px bg-gray-100 my-1 mx-2"></div>

                        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg text-left transition-colors font-semibold">
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link to="/cart" className="relative hover:text-[#006baf] transition-colors text-slate-600">
                <ShoppingBag size={20} />
                {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-[#eb2b32] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">{cartCount}</span>}
              </Link>
            </div>
          </div>
        </div>

        {/* --- 2. MAIN NAVIGATION --- */}
        <div className="container mx-auto px-4 md:px-8 py-3 lg:py-4">
          <div className="flex items-center justify-between">

            <div className="flex-1 flex items-center justify-start gap-4">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-1 text-slate-800 hover:text-[#006baf]">
                <Menu size={24} />
              </button>

              <div className="flex items-start">
                <Link to="/" className="flex-shrink-0">
                  <img src={logo} alt="Arasi Soap" className="h-9 md:h-12 w-auto object-contain" />
                </Link>

                <div className="relative group cursor-pointer ml-1">
                  <span className="text-[14px] md:text-[16px] font-bold text-slate-400 select-none">®</span>
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-max bg-slate-800 text-white text-[10px] py-1 px-2 rounded shadow-lg z-[70]">
                    Trade Mark No. 4296577
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* CENTER: Nav Links (Desktop Only) */}
            <div className="hidden lg:flex flex-initial">
              <ul className="flex items-center gap-10">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className={`text-[15px] font-semibold tracking-wide capitalize transition-all duration-200 ${
                        location.pathname === link.path
                          ? "text-[#eb2b32]"
                          : "text-slate-700 hover:text-[#006baf]"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* RIGHT: Search & Cart (Mobile/Tablet) */}
            <div className="flex-1 flex items-center justify-end gap-3 md:gap-4">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hidden lg:block text-slate-700 hover:text-[#006baf] transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <Search size={20} />
              </button>

              <div className="flex items-center gap-3 lg:hidden">
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="text-slate-800 hover:text-[#006baf] p-1"
                >
                  <Search size={22} />
                </button>
                <Link to="/cart" className="relative text-slate-800 p-1">
                  <ShoppingBag size={22} />
                  {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-[#eb2b32] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{cartCount}</span>}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <SearchBar isOpen={isSearchOpen} onToggle={setIsSearchOpen} />
      <ComplaintDrawer isOpen={isComplaintOpen} onClose={handleDrawerClose} />

      {/* --- MOBILE MENU OVERLAY --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div className="fixed inset-0 z-[60] lg:hidden font-sans">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: "0%" }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-xs bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100 bg-white">
                 <img src={logo} alt="Logo" className="h-8 w-auto" />
                 <button onClick={() => setIsMobileMenuOpen(false)} className="bg-gray-100 p-2 rounded-full text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                 <div className="space-y-2">
                    {navLinks.map((link) => (
                        <Link key={link.name} to={link.path} onClick={() => setIsMobileMenuOpen(false)}
                        className={`block py-3 px-4 rounded-lg text-sm font-semibold tracking-wide ${location.pathname === link.path ? "bg-red-50 text-[#eb2b32]" : "text-slate-600 hover:bg-gray-50"}`}>
                          {link.name}
                        </Link>
                    ))}
                 </div>
              </div>

              <div className="bg-gray-50 px-6 py-6 border-t border-gray-100">
                {user ? (
                  <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-[#006baf] text-white flex items-center justify-center font-bold text-sm shadow-md">{getInitials(user.name)}</div>
                        <div className="overflow-hidden">
                            <p className="font-bold text-slate-800 text-sm truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {isAdmin ? (
                          <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="col-span-2 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-white border border-gray-200 rounded-lg text-slate-700 hover:bg-blue-50 hover:border-blue-200 transition-colors"><LayoutDashboard size={16} /> Dashboard</Link>
                        ) : (
                          <>
                            <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-white border border-gray-200 rounded-lg text-slate-700 hover:bg-blue-50 hover:border-blue-200 transition-colors"><Settings size={16} /> Profile</Link>
                            <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-white border border-gray-200 rounded-lg text-slate-700 hover:bg-blue-50 hover:border-blue-200 transition-colors"><Package size={16} /> Orders</Link>
                            <button
                                onClick={() => { setIsMobileMenuOpen(false); setIsComplaintOpen(true); }}
                                className="col-span-2 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-white border border-gray-200 rounded-lg text-slate-700 hover:bg-blue-50 hover:border-blue-200 transition-colors relative"
                            >
                                <AlertCircle size={16} /> Support Center
                                {hasUnreadSupport && <span className="absolute top-2 right-4 h-2 w-2 rounded-full bg-red-500"></span>}
                            </button>
                          </>
                        )}
                      </div>
                      <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 shadow-lg shadow-red-200 transition-colors"><LogOut size={16} /> Logout</button>
                  </div>
                ) : (
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 bg-[#eb2b32] text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:shadow-xl transition-all"><User size={18} /> Sign In / Register</Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
