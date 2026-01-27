// src/Components/Pages/Shop/SubCategoryPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/services/api';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const SubCategoryPage = () => {
  const { categorySlug } = useParams();
  const [subCategories, setSubCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Get Category Details
        const catRes = await api.get(`/categories/slug/${categorySlug}`);
        const category = catRes.data.data;
        setCategoryName(category.name);

        // 2. Get SubCategories
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

  if (loading) return (
    <div className="min-h-screen bg-white pt-32 flex justify-center">
      <div className="flex gap-6">
        <div className="w-64 h-80 bg-gray-100 rounded-lg animate-pulse"></div>
        <div className="w-64 h-80 bg-gray-100 rounded-lg animate-pulse"></div>
        <div className="w-64 h-80 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <section className="py-16 pt-25 bg-white min-h-screen flex justify-center w-full">
      <div className="w-full max-w-[1400px] px-6 md:px-12">
        
        {/* Header - Left Aligned & Clean */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-gray-100">
          <div>
            <span className="text-[#4183cf] font-bold text-xs tracking-[0.2em] uppercase mb-2 block">
              Browse Categories
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 tracking-tight">
              {categoryName}
            </h1>
          </div>
          <div className="hidden md:block text-gray-500 text-sm font-medium">
            {subCategories.length} Collections Available
          </div>
        </div>
        
        {subCategories.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl">
            <p className="text-xl text-gray-500 font-serif">No collections found.</p>
            <Link to="/shop" className="text-[#4183cf] mt-4 inline-block font-semibold hover:underline">
              Return to Shop
            </Link>
          </div>
        ) : (
          /* Structured Grid Layout */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {subCategories.map((sub, index) => (
              <Link to={`/${categorySlug}/${sub.slug}`} key={sub._id} className="block group">
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="flex flex-col h-full"
                >
                  {/* Image Container - Tall Aspect Ratio (3:4) */}
                  <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 mb-4">
                    <img 
                      src={sub.image || "https://via.placeholder.com/600x800?text=No+Image"} 
                      alt={sub.name} 
                      className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                    />
                    
                    {/* Dark Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    
                    {/* Floating 'View' Button that appears on hover */}
                    <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="bg-white/95 backdrop-blur-sm text-center py-3 text-xs font-bold uppercase tracking-widest text-gray-900 rounded shadow-lg">
                        View Collection
                      </div>
                    </div>
                  </div>

                  {/* Content - Clean & Minimal */}
                  <div className="flex flex-col">
                    <h3 className="text-lg md:text-xl font-serif text-gray-900 font-medium leading-snug group-hover:text-[#4183cf] transition-colors">
                      {sub.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 mt-2 group/link">
                      <span className="text-sm font-medium text-gray-400 group-hover:text-[#4183cf] transition-colors">
                        Shop Now
                      </span>
                      <ArrowRight size={14} className="text-gray-300 group-hover:text-[#4183cf] -translate-x-1 group-hover:translate-x-0 transition-all duration-300" />
                    </div>
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