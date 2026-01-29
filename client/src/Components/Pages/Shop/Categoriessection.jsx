// src/Components/Pages/Homepage/Categories/CategoriesSection.jsx
import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/services/api';

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    };
    fetchCategories();
  }, []);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = 300;
      current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  if (!categories.length) return null;

  return (
    <section className="relative py-0 w-full flex justify-center bg-[#eee6af6c]">

      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-32 " />
      <div className="w-full max-w-screen-2xl py-9 px-6 md:px-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-6 border-b border-gray-200 pb-6">
          <div className="space-y-2 w-full md:w-auto">
            <h2 className="text-2xl md:text-3xl font-serif text-gray-900 tracking-tight">Shop by Category</h2>
            <p className="text-gray-500 text-sm font-medium tracking-wide flex items-center gap-2">
              EXCLUSIVE OFFERS AVAILABLE <span className="text-red-500 text-xs">●</span>
            </p>
          </div>
          <div className="flex gap-3 self-end md:self-auto">
            <button onClick={() => scroll('left')} className="p-2.5 rounded-full border border-gray-200 hover:bg-gray-900 hover:text-white transition-all duration-300 text-gray-400">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => scroll('right')} className="p-2.5 rounded-full border border-gray-200 hover:bg-gray-900 hover:text-white transition-all duration-300 text-gray-400">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div ref={scrollContainerRef} className="flex gap-6 pt-5 md:gap-10 overflow-x-auto scrollbar-hide px-2 pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {categories.map((category, index) => (
            <Link to={`/${category.slug}`} key={category._id || index}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="flex-shrink-0 flex flex-col items-center group cursor-pointer"
              >
                <div className="relative mb-4">
                  {/* UPDATED: Increased ring width (ring-2), added offset (ring-offset-2), and changed color to amber-600 */}
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full p-1 border border-gray-200 ring-2 ring-transparent group-hover:ring-[#eb2b3133] group-hover:ring-offset-2 transition-all duration-500">
                    <div className="w-full h-full rounded-full overflow-hidden relative">
                      <img
                        src={category.image || "https://via.placeholder.com/150"}
                        alt={category.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    </div>
                  </div>
                </div>

                <h3 className="text-center text-xs md:text-sm font-medium captilize font-serif tracking-widest text-gray-900 group-hover:text-amber-700 transition-colors duration-300">
                  {category.name}
                </h3>

                {/* UPDATED: Changed text color to amber-600 and added font-medium */}
                <span className="text-[11px] font-medium text-blue-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                  Explore <ArrowRight size={12} />
                </span>
              </motion.div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}

export default CategoriesSection;
