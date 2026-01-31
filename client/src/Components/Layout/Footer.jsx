import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Youtube, Phone, Mail, MapPin } from 'lucide-react';
import api from '@/services/api';
import logo from "@/assets/logo.png";

const Footer = () => {
  const [categories, setCategories] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]); // State for social links
  const currentYear = new Date().getFullYear();

  // Icon Mapping
  const iconMap = {
    Instagram: <Instagram size={20} />,
    Facebook: <Facebook size={20} />,
    Twitter: <Twitter size={20} />,
    Youtube: <Youtube size={20} />,
  };

  // Static Links
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Product", path: "/shop" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  useEffect(() => {
    // 1. Fetch Categories
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

    // 2. Fetch Social Links
    const fetchSocialLinks = async () => {
      try {
        const { data } = await api.get('/social-media');
        if (data.success) {
          setSocialLinks(data.data);
        }
      } catch (error) {
        console.error("Failed to load social media links", error);
      }
    };

    fetchFooterCategories();
    fetchSocialLinks();
  }, []);

  return (
    <footer className="bg-[#f8f8f8] pt-16 pb-8 px-6 md:px-12 border-t border-gray-200">
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
              
              {/* Address */}
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-gray-900 shrink-0 mt-0.5" />
                <p className='cursor-pointer'>
                  No. 2, East Coast Road, Bahour,
                  Kattukuppam, Pondicherry 607402, India
                </p>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-gray-900 shrink-0" />
                <p className="text-gray-900 cursor-pointer text-base">+91 8682967445</p>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-gray-900 shrink-0" />
                <a href="mailto:arasisoap@gmail.com" className="hover:text-gray-900 transition-colors">
                 arasisoap@gmail.com
                </a>
              </div>

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
            <span>© <span>IyyanAlli Groups</span> {currentYear} | All rights reserved.</span>
          </div>

          {/* Dynamic Social Media Links */}
          <div className="flex items-center gap-5">
            {socialLinks.length > 0 && socialLinks.map((link) => {
              // Only render if the platform exists in our map and has a URL
              if (!link.url || !iconMap[link.platform]) return null;
              
              return (
                <a 
                  key={link._id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-900 transition-colors"
                  title={link.platform}
                >
                  {iconMap[link.platform]}
                </a>
              );
            })}
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;