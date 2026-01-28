import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // 1. Fetch Data
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        // Assuming API might return an array now, or we wrap a single result
        const { data } = await api.get('/banner');
        if (data.success) {
          // Ensure we always work with an array for the slider
          const bannerData = Array.isArray(data.banner) ? data.banner : [data.banner];
          setBanners(bannerData);
        }
      } catch (error) {
        console.error("Failed to load banner");
      }
    };
    fetchBanners();
  }, []);

  // 2. Auto-Slide Logic
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null; // Or a skeleton loader

  const currentBanner = banners[currentSlide];
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:5000";
  const imageUrl = currentBanner.image ? `${baseUrl}/${currentBanner.image}` : null;

  return (
    <div className="relative w-full h-[600px] bg-[#F9F9F9] overflow-hidden flex items-center">

      {/* Slider Container */}
      <div className="w-full h-full relative">
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col md:flex-row"
          >
            {/* Left Content (Text) */}
            <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 z-10 bg-[#F9F9F9]/90 md:bg-transparent absolute md:relative h-full">
              <div className="space-y-6 max-w-lg">

                {/* Tagline (Small Upper Case) */}
                <p className="text-sm font-bold tracking-widest text-gray-500 uppercase">
                  {currentBanner.tagline || "ESSENTIAL ITEMS"}
                </p>

                {/* Heading */}
                <h1 className="text-5xl md:text-6xl font-medium text-gray-900 leading-[1.1] tracking-tight">
                  {currentBanner.heading}
                </h1>

                {/* Description */}
                <p className="text-gray-500 text-lg leading-relaxed">
                  {currentBanner.description}
                </p>

                {/* Button - Black minimal style */}
                <div className="pt-4">
                  <Link
                    to="/shop"
                    className="inline-flex items-center justify-center bg-black text-white px-10 py-4 font-medium text-sm transition-transform hover:scale-105 active:scale-95"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Content (Image) */}
            <div className="w-full md:w-1/2 h-full relative">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={currentBanner.heading}
                  className="w-full h-full object-cover object-center md:object-right"
                />
              )}
              {/* Subtle shadow overlay to blend image with text area if needed */}
              <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#F9F9F9] to-transparent hidden md:block" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 md:left-24 md:transform-none flex gap-3 z-20">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-3 w-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-black w-3' : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;
