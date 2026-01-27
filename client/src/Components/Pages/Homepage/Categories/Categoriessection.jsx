// src/Components/Pages/Homepage/Categories/CategoriesSection.jsx
import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom'; // Import Link
import api from '@/services/api'; // Ensure you have your axios instance

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const scrollContainerRef = useRef(null);

  // Fetch Categories on Mount
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

  if (!categories.length) return null; // or a loader

  return (
    <section className="py-16 bg-white flex justify-center w-full">
      <div className="w-full max-w-7xl px-6 md:px-12">
        
        {/* Header */}
        <div className="flex pt-6 flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b border-gray-100 pb-6">
          <div className="space-y-2 w-full md:w-auto">
            <h2 className="text-2xl md:text-3xl font-serif text-gray-900 tracking-tight">Shop by Category</h2>
            <p className="text-gray-500 text-sm font-medium tracking-wide flex items-center gap-2">
              EXCLUSIVE OFFERS AVAILABLE <span className="text-orange-500 text-xs">●</span>
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
        <div ref={scrollContainerRef} className="flex gap-6 md:gap-10 overflow-x-auto pb-10 scrollbar-hide px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {categories.map((category, index) => (
            // WRAP WITH LINK to /slug
            <Link to={`/${category.slug}`} key={category._id || index}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="flex-shrink-0 flex flex-col items-center group cursor-pointer"
              >
                <div className="relative mb-4">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full p-1 border border-gray-100 ring-1 ring-transparent group-hover:ring-gray-200 transition-all duration-500">
                    <div className="w-full h-full rounded-full overflow-hidden relative">
                      <img 
                        src={category.image || "https://via.placeholder.com/150"} 
                        alt={category.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                    </div>
                  </div>
                </div>
                <h3 className="text-center text-xs md:text-sm font-semibold uppercase tracking-widest text-gray-900 group-hover:text-amber-700 transition-colors duration-300">
                  {category.name}
                </h3>
                <span className="text-[10px] text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                  Explore <ArrowRight size={10} />
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