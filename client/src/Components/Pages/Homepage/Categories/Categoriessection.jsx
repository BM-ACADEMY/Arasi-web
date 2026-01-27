import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

// Mock Data
const categories = [
  { id: 1, title: "Foundations", image: "https://images.unsplash.com/photo-1552693673-1bf958298935?q=80&w=300&auto=format&fit=crop" },
  { id: 2, title: "Blush & Bronzers", image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=300&auto=format&fit=crop" },
  { id: 3, title: "Lipsticks", image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=300&auto=format&fit=crop" },
  { id: 4, title: "Hair Care", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=300&auto=format&fit=crop" },
  { id: 5, title: "Highlighters", image: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=300&auto=format&fit=crop" },
  { id: 6, title: "Nails", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=300&auto=format&fit=crop" },
  { id: 7, title: "Skin Care", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=300&auto=format&fit=crop" },
  { id: 8, title: "Eye Shadows", image: "https://images.unsplash.com/photo-1552693673-1bf958298935?q=80&w=300&auto=format&fit=crop" }
];

const CategoriesSection = () => {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = 300; 
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="py-16 bg-white flex justify-center w-full">
      <div className="w-full max-w-7xl px-6 md:px-12">
        
        {/* Premium Header */}
        {/* FIXED: items-start keeps text left on mobile, md:items-end aligns bottom on desktop */}
        <div className="flex pt-6 flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b border-gray-100 pb-6">
          <div className="space-y-2 w-full md:w-auto">
            <h2 className="text-2xl md:text-3xl font-serif text-gray-900 tracking-tight">
              Shop by Category
            </h2>
            <p className="text-gray-500 text-sm font-medium tracking-wide flex items-center gap-2">
              EXCLUSIVE OFFERS AVAILABLE <span className="text-orange-500 text-xs">●</span>
            </p>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex gap-3 self-end md:self-auto">
            <button 
              onClick={() => scroll('left')}
              className="p-2.5 rounded-full border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 text-gray-400"
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-2.5 rounded-full border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 text-gray-400"
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Categories Carousel */}
        {/* REMOVED: snap-x and snap-center for free-flowing fluid scroll */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-6 md:gap-10 overflow-x-auto pb-10 scrollbar-hide px-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="flex-shrink-0 flex flex-col items-center group cursor-pointer"
            >
              {/* Premium Image Container */}
              <div className="relative mb-4">
                {/* Ring Effect Container */}
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full p-1 border border-gray-100 ring-1 ring-transparent group-hover:ring-gray-200 group-hover:border-gray-300 transition-all duration-500">
                  <div className="w-full h-full rounded-full overflow-hidden relative">
                    <img 
                      src={category.image} 
                      alt={category.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    {/* Subtle Tint Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                  </div>
                </div>
              </div>

              {/* Category Title */}
              <h3 className="text-center text-xs md:text-sm font-semibold uppercase tracking-widest text-gray-900 group-hover:text-amber-700 transition-colors duration-300">
                {category.title}
              </h3>
              
              {/* Explore Link */}
              <span className="text-[10px] text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                Explore <ArrowRight size={10} />
              </span>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default CategoriesSection;