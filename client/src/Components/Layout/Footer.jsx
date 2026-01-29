import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Youtube } from 'lucide-react';
import api from '@/services/api';
import logo from "@/assets/logo.png";

const Footer = () => {
  const [categories, setCategories] = useState([]);
  const currentYear = new Date().getFullYear();

  // Static Links
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "Our Story", path: "/about" },
    { name: "Benefits", path: "/why-arasi" },
    { name: "Contact", path: "/contact" },
  ];

  // Fetch Categories
  useEffect(() => {
    const fetchFooterCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        if (data.success) {
          setCategories(data.data.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to load footer categories", error);
      }
    };
    fetchFooterCategories();
  }, []);

  return (
    <footer className="bg-[#f8f8f8] pt-16 pb-8 px-6 md:px-12 border-t border-gray-100">
      <div className="max-w-screen-2xl mx-auto">
        
        {/* Main Footer Grid - Now 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          
          {/* Column 1: Logo */}
          <div className="flex flex-col items-start">
            <Link to="/">
              <img 
                src={logo} 
                alt="Arasi Logo" 
                className="h-14 w-auto object-contain" 
              />
            </Link>
            <p className="mt-4 text-gray-500 text-sm leading-relaxed">
              Crafting premium products for your daily lifestyle. Quality you can trust.
            </p>
          </div>

          {/* Column 2: Contact Information */}
          <div className="space-y-6">
            <h4 className="text-xl font-serif font-medium text-gray-900">Contact Us</h4>
            <div className="space-y-4 text-gray-500 text-sm">
              <p>Find a location nearest<br />you. See <Link to="/stores" className="font-bold text-gray-900 border-b border-gray-900">Our Stores</Link></p>
              <p className="text-gray-900 font-bold text-base">+391 (0)35 2568 4593</p>
              <p>hello@domain.com</p>
            </div>
          </div>

          {/* Column 3: Useful Links */}
          <div className="space-y-6">
            <h4 className="text-xl font-serif font-medium text-gray-900">Useful Links</h4>
            <ul className="space-y-4 text-gray-500 text-sm">
              {navLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.path} className="hover:text-gray-900 transition-colors duration-300">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Shop by Category */}
          <div className="space-y-6">
            <h4 className="text-xl font-serif font-medium text-gray-900">Categories</h4>
            <ul className="space-y-4 text-gray-500 text-sm">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <li key={category._id}>
                    <Link to={`/${category.slug}`} className="hover:text-gray-900 transition-colors duration-300">
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-gray-400">Loading...</li>
              )}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-gray-500 text-sm">
            <span>© Arasi {currentYear} | Powered by Bmtechx.in</span>
          </div>
          
          <div className="flex items-center gap-5">
            <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors"><Instagram size={20} /></a>
            <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors"><Twitter size={20} /></a>
            <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors"><Facebook size={20} /></a>
            <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors"><Youtube size={20} /></a>
          </div>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;