import React, { useState, useEffect } from "react";
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
  FileText
} from "lucide-react";
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
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Product", path: "/shop" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${
        isScrolled ? "shadow-md" : "border-b border-gray-100 shadow-sm"
      }`}>
        
        {/* --- 1. UTILITY BAR (Desktop Only) --- */}
        <div className="hidden lg:block border-b border-gray-300">
            <div className="container mx-auto px-8 py-2 flex justify-between items-center text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2 hover:text-[#006baf] cursor-pointer transition-colors">
                      <Phone size={14} className="text-[#006baf]" /> +91 8682967445
                    </span>
                    <span className="flex items-center gap-2 hover:text-[#006baf] cursor-pointer transition-colors">
                      <Mail size={14} className="text-[#006baf]" />arasisoap@gmail.com
                    </span>
                    <span className="flex items-center gap-2 hover:text-[#006baf] transition-colors cursor-default">
                      <FileText size={14} className="text-[#006baf]" /> 
                      GST: <span>34CQMPS5041M1ZB</span>
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group z-50">
                        <Link to={user ? "/profile" : "/login"} className="flex items-center gap-1 hover:text-[#006baf] py-2 transition-colors">
                             <User size={18} /> {user && <span className="max-w-[100px] truncate">{user.name}</span>}
                        </Link>
                        {user && (
                           <div className="absolute right-0 top-full pt-0 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                             <div className="bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden mt-1">
                                <div className="p-1">
                                  {isAdmin ? (
                                    <Link to="/admin/dashboard" className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-gray-50 hover:text-[#006baf] rounded-md"><LayoutDashboard size={14} /> Dashboard</Link>
                                  ) : (
                                    <>
                                      <Link to="/profile" className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-gray-50 hover:text-[#006baf] rounded-md"><Settings size={14} /> Profile</Link>
                                      <Link to="/orders" className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-gray-50 hover:text-[#006baf] rounded-md"><Package size={14} /> Orders</Link>
                                    </>
                                  )}
                                  <div className="h-px bg-gray-100 my-1"></div>
                                  <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-md text-left"><LogOut size={14} /> Logout</button>
                                </div>
                             </div>
                           </div>
                        )}
                    </div>
                    <Link to="/cart" className="relative hover:text-[#006baf] transition-colors">
                      <ShoppingBag size={18} />
                      {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-[#eb2b32] text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full">{cartCount}</span>}
                    </Link>
                </div>
            </div>
        </div>

        {/* --- 2. MAIN NAVIGATION --- */}
        <div className="container mx-auto px-4 md:px-8 py-3 lg:py-4">
            <div className="flex items-center justify-between">
                
                {/* LEFT: Logo & Mobile Toggle */}
                <div className="flex-1 flex items-center justify-start gap-4">
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-1 text-slate-800 hover:text-[#006baf]">
                        <Menu size={24} />
                    </button>
                    <Link to="/" className="flex-shrink-0">
                      <img src={logo} alt="Arasi Soap" className="h-8 md:h-12 w-auto object-contain" />
                    </Link>
                </div>

                {/* CENTER: Nav Links (Desktop Only) */}
                <div className="hidden lg:flex flex-initial">
                    <ul className="flex items-center gap-8">
                        {navLinks.map((link) => (
                            <li key={link.name}>
                              <Link
                                to={link.path}
                                className={`text-sm md:text-md font-medium  tracking-widest capitalize transition-colors ${
                                  location.pathname === link.path
                                    ? "text-[#eb2b32]"
                                    : "text-slate-800 hover:text-[#006baf]"
                                }`}
                              >
                                {link.name}
                              </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* RIGHT: Search & Cart */}
                <div className="flex-1 flex items-center justify-end gap-3 md:gap-4">
                   <button 
                       onClick={() => setIsSearchOpen(true)} 
                       className="hidden lg:block text-slate-800 hover:text-[#006baf] transition-colors p-1"
                   >
                       <Search size={22} />
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

      {/* --- MOBILE MENU OVERLAY --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div className="fixed inset-0 z-[60] lg:hidden">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: "0%" }} exit={{ x: "-100%" }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-xs bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-[#eb2b32] text-white">
                 <span className="font-bold text-lg tracking-widest">MENU</span>
                 <button onClick={() => setIsMobileMenuOpen(false)} className="hover:text-red-300 transition-colors"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                 <div className="space-y-1">
                    {navLinks.map((link) => (
                        <Link key={link.name} to={link.path} onClick={() => setIsMobileMenuOpen(false)} className={`block py-3 border-b border-gray-50 text-sm font-medium  tracking-wider ${location.pathname === link.path ? "text-[#eb2b32]" : "text-slate-600"}`}>
                          {link.name}
                        </Link>
                    ))}
                 </div>
              </div>

              <div className="bg-gray-50 px-6 py-6 border-t border-gray-100">
                {user ? (
                  <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#eb2b32] text-white flex items-center justify-center font-bold">{user.name ? user.name.charAt(0).toUpperCase() : "U"}</div>
                        <div><p className="font-bold text-slate-800">{user.name}</p><p className="text-xs text-slate-500 truncate w-32">{user.email}</p></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {isAdmin ? (
                          <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="col-span-2 flex items-center justify-center gap-2 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg text-slate-700"><LayoutDashboard size={16} /> Dashboard</Link>
                        ) : (
                          <>
                            <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg text-slate-700"><Settings size={16} /> Profile</Link>
                            <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg text-slate-700"><Package size={16} /> Orders</Link>
                          </>
                        )}
                      </div>
                      <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"><LogOut size={16} /> Logout</button>
                  </div>
                ) : (
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 bg-[#eb2b32] text-white rounded-lg font-bold"><User size={18} /> Sign In</Link>
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