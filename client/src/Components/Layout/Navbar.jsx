import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
// Added LayoutDashboard to imports
import { ShoppingBag, User, Menu, X, LogOut, Package, Settings, ChevronDown, LayoutDashboard } from "lucide-react";
import logo from "@/assets/logo.png";
import SearchBar from "./SearchBar";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cartCount } = useCart();

  const location = useLocation();
  const { user, logout } = useAuth();

  // CHECK: verify 'role' is the correct property in your database
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/products" },
    { name: "Our Story", path: "/about" },
    { name: "Benefits", path: "/why-arasi" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white shadow-md py-2"
            : "bg-white border-b border-gray-100 py-3"
        }`}
      >
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">

          {/* 1. LEFT SIDE: Logo */}
          <Link
            to="/"
            className={`flex-shrink-0 z-50 mr-4 transition-all duration-200 ${
              isSearchOpen ? "hidden lg:block" : "block"
            }`}
          >
            <img src={logo} alt="Arasi Soap" className="h-10 md:h-12 w-auto object-contain" />
          </Link>

          {/* 2. MIDDLE: Desktop Navigation */}
          <div className="hidden lg:flex items-center bg-[#4183cf]/5 px-2 py-1.5 rounded-full absolute left-1/2 -translate-x-1/2">
            <ul className="flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="relative px-5 py-2.5 block text-sm font-medium tracking-wide transition-all duration-300"
                    >
                      {isActive && (
                        <motion.span
                          layoutId="navPill"
                          className="absolute inset-0 bg-[#4183cf] rounded-full shadow-md"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <span className={`relative z-10 transition-colors duration-200 ${
                        isActive ? "text-white" : "text-slate-600 hover:text-[#4183cf]"
                      }`}>
                        {link.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* 3. RIGHT SIDE: Icons */}
          <div className={`flex items-center gap-1 md:gap-3 ${isSearchOpen ? 'flex-1 justify-end' : ''}`}>

             <SearchBar isOpen={isSearchOpen} onToggle={setIsSearchOpen} />

             <Link to="/cart" className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-2">
                <ShoppingBag size={20} />
                <span className="hidden sm:inline text-sm font-medium">Cart</span>
{cartCount > 0 && (
           <span className="absolute top-1 right-1 sm:top-0 sm:right-0 bg-[#4183cf] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
              {cartCount}
           </span>
        )}             </Link>

             <div className="hidden lg:block h-6 w-px bg-slate-200 mx-1"></div>

             {/* --- AUTH SECTION --- */}
             <div className="hidden lg:block relative z-50">
               {user ? (
                 <div className="relative group">
                    <button className="flex items-center gap-2 p-2 rounded-full hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-[#4183cf] text-white flex items-center justify-center font-bold text-sm">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <ChevronDown size={14} className="text-slate-400 group-hover:rotate-180 transition-transform duration-300"/>
                    </button>

                    <div className="absolute right-0 top-full pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100">
                      <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden p-1">
                        <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                          <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>

                        <div className="p-1 space-y-0.5">
                          {/* --- DESKTOP DROPDOWN LOGIC --- */}
                          {isAdmin ? (
                            <Link to="/admin/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-[#4183cf] hover:bg-slate-50 rounded-lg transition-colors">
                              <LayoutDashboard size={16} />
                              <span>Dashboard</span>
                            </Link>
                          ) : (
                            <>
                              <Link to="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-[#4183cf] hover:bg-slate-50 rounded-lg transition-colors">
                                <Settings size={16} />
                                <span>Profile</span>
                              </Link>
                              <Link to="/orders" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-[#4183cf] hover:bg-slate-50 rounded-lg transition-colors">
                                <Package size={16} />
                                <span>Orders</span>
                              </Link>
                            </>
                          )}

                          <div className="h-px bg-gray-100 my-1 mx-2"></div>
                          <button
                            onClick={logout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <LogOut size={16} />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    </div>
                 </div>
               ) : (
                 <Link to="/login">
                   <IconButton icon={<User size={20} />} label="Login" />
                 </Link>
               )}
             </div>

             <button
               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
               className="lg:hidden p-2 text-slate-800 hover:bg-slate-100 rounded-full transition-colors ml-1"
             >
               {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
             </button>
          </div>
        </div>
      </motion.nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div className="fixed inset-0 z-[60] lg:hidden">
            <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "100%" }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                 <span className="font-bold text-lg text-slate-800">Menu</span>
                 <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gray-50 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors">
                    <X size={20} />
                 </button>
              </div>

              {/* Mobile Links */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                 {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block py-3.5 border-b border-gray-50 font-medium ${
                         location.pathname === link.path ? "text-[#4183cf]" : "text-slate-600"
                      }`}
                    >
                      {link.name}
                    </Link>
                 ))}
              </div>

              {/* Mobile Footer (Auth) */}
              <div className="bg-gray-50 px-6 py-6 border-t border-gray-100">
                {user ? (
                  <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#4183cf] text-white flex items-center justify-center font-bold text-lg">
                           {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                           <p className="font-bold text-slate-800">{user.name}</p>
                           <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>

                      {/* --- MOBILE AUTH ACTIONS LOGIC --- */}
                      <div className="grid grid-cols-2 gap-2">
                        {isAdmin ? (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="col-span-2 flex items-center justify-center gap-2 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg text-slate-700 active:bg-gray-50"
                          >
                             <LayoutDashboard size={16} />
                             Dashboard
                          </Link>
                        ) : (
                          <>
                            <Link
                              to="/profile"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="flex items-center justify-center gap-2 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg text-slate-700 active:bg-gray-50"
                            >
                              <Settings size={16} />
                              Profile
                            </Link>
                            <Link
                              to="/orders"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="flex items-center justify-center gap-2 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg text-slate-700 active:bg-gray-50"
                            >
                              <Package size={16} />
                              Orders
                            </Link>
                          </>
                        )}
                      </div>

                      <button
                         onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                         className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white bg-red-500 rounded-lg shadow-sm hover:bg-red-600"
                      >
                         <LogOut size={16} />
                         Logout
                      </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#4183cf] text-white rounded-xl font-bold shadow-md shadow-blue-200"
                  >
                     <User size={18} />
                     Sign In / Register
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const IconButton = ({ icon, label }) => (
  <button className="p-2.5 rounded-full text-slate-600 hover:bg-[#4183cf]/10 hover:text-[#4183cf] transition-colors relative group">
    {icon}
    <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
      {label}
    </span>
  </button>
);

export default Navbar;
