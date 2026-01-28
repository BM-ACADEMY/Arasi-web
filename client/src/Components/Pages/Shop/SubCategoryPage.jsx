// src/Components/Pages/Shop/SubCategoryPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/services/api';
import { motion } from 'framer-motion';
import { ArrowRight, Plus } from 'lucide-react';

const SubCategoryPage = () => {
  const { categorySlug } = useParams();
  const [subCategories, setSubCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const catRes = await api.get(`/categories/slug/${categorySlug}`);
        const category = catRes.data.data;
        setCategoryName(category.name);

        const subRes = await api.get(`/subcategories?category=${category._id}`);
        setSubCategories(subRes.data.data);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug) fetchData();
  }, [categorySlug]);

  // --- UPDATED LOADING SKELETON (Aligned Top, Grid Layout) ---
  if (loading) return (
    <div className="min-h-screen bg-white pt-36 px-6">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header Skeleton */}
        <div className="flex flex-col items-center mb-16 gap-4">
          <div className="w-32 h-4 bg-gray-100 rounded animate-pulse"></div>
          <div className="w-64 md:w-96 h-12 bg-gray-100 rounded animate-pulse"></div>
        </div>

        {/* Grid Skeleton (Matches the 5-column layout) */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12 justify-center">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="flex flex-col items-center gap-4">
              <div className="w-36 h-36 md:w-48 md:h-48 bg-gray-100 rounded-full animate-pulse"></div>
              <div className="w-24 h-4 bg-gray-100 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-24 pt-36 bg-white min-h-screen w-full relative">
      
      <div className="w-full max-w-[1400px] mx-auto px-6">

        {/* 1. Header */}
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#4183cf] font-bold text-[10px] md:text-xs tracking-[0.3em] uppercase mb-3"
          >
            Curated Collections
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-serif text-gray-900 tracking-tight"
          >
            {categoryName}
          </motion.h1>
          
          <div className="w-12 h-1 bg-[#4183cf] mt-6 rounded-full opacity-80" />
        </div>

        {subCategories.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl mx-auto max-w-2xl">
            <p className="text-lg text-gray-400 font-serif italic">No collections found.</p>
            <Link to="/shop" className="text-[#4183cf] mt-4 inline-block font-semibold hover:underline">
              Back to Shop
            </Link>
          </div>
        ) : (
          /* 2. Grid Layout */
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-14 justify-center">
            {subCategories.map((sub, index) => (
              <Link to={`/${categorySlug}/${sub.slug}`} key={sub._id} className="block group cursor-pointer relative z-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="flex flex-col items-center"
                >
                  {/* --- NEW HOVER DESIGN: "The Lens Effect" --- */}
                  <div className="relative w-36 h-36 md:w-48 md:h-48 mx-auto">
                    
                    {/* A. Focus Ring (Expands & Fades Out on Hover) */}
                    <div className="absolute inset-0 rounded-full border-2 border-gray-100 transition-all duration-300 group-hover:border-[#4183cf]/50 group-hover:scale-110 group-hover:opacity-0" />
                    
                    {/* B. Static Ring (Holds shape) */}
                    <div className="absolute inset-0 rounded-full border border-gray-100 group-hover:border-[#4183cf] transition-colors duration-300" />

                    {/* C. Image Container */}
                    <div className="absolute inset-1.5 rounded-full overflow-hidden bg-white z-10 isolate">
                      <img
                        src={sub.image || "https://via.placeholder.com/400x400?text=Category"}
                        alt={sub.name}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 group-hover:brightness-90"
                      />
                      
                      {/* D. Center Interaction (Scale Up Button) */}
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="bg-white text-[#4183cf] w-12 h-12 rounded-full flex items-center justify-center shadow-xl transform scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)">
                           <ArrowRight size={20} />
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* --- TEXT CONTENT --- */}
                  <div className="text-center mt-5 relative">
                    <h3 className="text-base md:text-lg font-serif font-medium text-gray-900 group-hover:text-[#4183cf] transition-colors duration-200">
                      {sub.name}
                    </h3>
                    
                    {/* Subtle underline animation */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-0 h-[1px] bg-[#4183cf] transition-all duration-300 group-hover:w-1/2 mt-1"></div>
                  </div>

                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SubCategoryPage;