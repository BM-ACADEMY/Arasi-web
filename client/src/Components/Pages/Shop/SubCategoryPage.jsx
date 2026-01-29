import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/services/api';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Soap from "@/assets/soap.png"

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

  if (loading) return (
    <div className="h-screen bg-[#0d1a15] flex flex-col justify-center items-center">
        <div className="w-16 h-16 border-4 border-[#4183cf] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white/50 font-serif text-xl animate-pulse">Loading Collections...</p>
    </div>
  );

  return (
    /* REMOVED min-h-screen - Now content defines the height */
    <section className="relative pt-15 w-full overflow-hidden bg-[#0d1a15]">
      
      {/* 1. Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img 
          src={Soap} 
          className="w-full h-full object-cover brightness-[0.6] contrast-125 scale-110"
          alt="background texture"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a2e26]/60 via-[#0d1a15]/90 to-[#0d1a15]" />
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 py-20 md:py-32">
        
        {/* 2. Header Section */}
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gray-400 font-bold text-[10px] md:text-xs tracking-[0.4em] uppercase mb-4"
          >
            Our Collections
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-5xl font-medium capitalize text-white tracking-tight max-w-4xl leading-[1.1] font-serif"
          > 
            {categoryName} Collections
          </motion.h1>
          <div className="w-20 h-1 bg-orange-400/50 mt-4 rounded-full" />
        </div>

        {subCategories.length === 0 ? (
          <div className="text-center py-20 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 max-w-2xl mx-auto">
            <p className="text-xl text-white/40 italic">No collections found.</p>
            <Link to="/shop" className="mt-6 inline-block text-orange-400 hover:text-white transition-colors">
              Return to Shop
            </Link>
          </div>
        ) : (
          /* 3. Circular Grid Layout */
          <div className="flex flex-wrap justify-center gap-10 md:gap-16">
            {subCategories.map((sub, index) => (
              <Link 
                to={`/${categorySlug}/${sub.slug}`} 
                key={sub._id} 
                className="group flex flex-col items-center w-40 md:w-56"
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative w-full"
                >
                  <div className="relative aspect-square w-full rounded-full overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-2 border-white/10 group-hover:border-white/40 transition-all duration-700">
                    <div className="absolute inset-0 bg-[#2a3c35] z-0" />
                    <img
                      src={sub.image || "https://via.placeholder.com/600x600?text=Collection"}
                      alt={sub.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-in-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-[#1a2e26]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[2px]">
                      <div className="bg-white text-[#1a2e26] p-4 rounded-full shadow-2xl transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                        <ArrowRight size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="text-center mt-6">
                    <h3 className="text-lg md:text-xl font-serif capitalize font-medium text-white group-hover:text-orange-300 transition-colors duration-300">
                      {sub.name}
                    </h3>
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