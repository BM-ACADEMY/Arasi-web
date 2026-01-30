import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
// ensure you have installed lucide-react or remove the Icon if not needed
import { ArrowRight } from 'lucide-react'; 

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data } = await api.get('/banner');
        if (data.success && data.banners) {
          const fetchedBanners = Array.isArray(data.banners) ? data.banners : [data.banners];
          setBanners(fetchedBanners);
        }
      } catch (error) {
        console.error("Failed to load banner", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  // 2. Auto-Slide Logic
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (loading) return <div className="w-full h-[60vh] bg-gray-900 animate-pulse" />;
  if (banners.length === 0) return null;

  const currentBanner = banners[currentSlide];
  if (!currentBanner) return null;

  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '');
  const imageUrl = currentBanner.image ? `${baseUrl}/${currentBanner.image}` : null;

  // Animation Variants
  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (delay) => ({
      opacity: 1, 
      y: 0,
      transition: { delay, duration: 0.8, ease: "easeOut" }
    })
  };

  return (
    // MAIN CONTAINER
    <section className="relative w-full h-[75vh] md:h-[80vh] min-h-[550px] overflow-hidden bg-black mt-13 md:mt-15 lg:mt-32">
      
      <AnimatePresence mode='wait'>
        <motion.div
          key={currentSlide}
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          
          {/* --- LAYER 1: BACKGROUND IMAGE --- */}
          {imageUrl && (
            <img
              src={imageUrl}
              alt={currentBanner.heading}
              className="absolute inset-0 w-full h-full object-cover object-center z-0"
            />
          )}

          {/* --- LAYER 2: GRADIENT OVERLAY --- */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30 md:bg-gradient-to-r md:from-black/80 md:to-transparent z-10" />

          {/* --- LAYER 3: CONTENT --- */}
          <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 pt-10 md:px-16 md:pt-0 lg:px-24">
            
            <div className="max-w-2xl text-white mt-10 md:mt-0">
              
              {/* 1. Tagline - Elegant, spaced out, not bold */}
              <motion.p 
                custom={0.2}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className="text-xs md:text-sm font-normal tracking-[0.3em] text-gray-300 uppercase mb-4"
              >
                {currentBanner.tagline || "New Collection"}
              </motion.p>
              
              {/* 2. Heading - Light font weight (Thin/Light) for luxury feel */}
              <motion.h1 
                custom={0.3}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[1.1] mb-6 drop-shadow-xl"
              >
                {currentBanner.heading}
              </motion.h1>

              {/* 3. Paragraph - Light weight, relaxed leading */}
              <motion.p 
                custom={0.4}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className="text-gray-200 text-sm sm:text-base md:text-lg font-light leading-relaxed max-w-md md:max-w-lg mb-8 drop-shadow-md line-clamp-3 md:line-clamp-none"
              >
                {currentBanner.description}
              </motion.p>

              {/* 4. Animated Button */}
              <motion.div
                custom={0.5}
                variants={textVariants}
                initial="hidden"
                animate="visible"
              >
                <Link
                  to="/shop"
                  className="group relative inline-flex items-center gap-3 bg-white text-black px-8 py-3 md:px-10 md:py-4 overflow-hidden transition-all duration-300 hover:bg-gray-100"
                >
                  {/* Button Text */}
                  <span className="relative z-10 font-medium text-xs md:text-sm uppercase tracking-widest group-hover:mr-2 transition-all duration-300">
                    Shop Now
                  </span>

                  {/* Arrow Icon Slide Animation */}
                  <ArrowRight className="w-4 h-4 relative z-10 transform -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                  
                  {/* Subtle Background slide effect (Optional) */}
                  <div className="absolute inset-0 bg-gray-200 transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out z-0" />
                </Link>
              </motion.div>

            </div>
          </div>

        </motion.div>
      </AnimatePresence>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-300 shadow-lg ${
              index === currentSlide ? 'bg-white w-8' : 'bg-white/40 w-2 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default Banner;