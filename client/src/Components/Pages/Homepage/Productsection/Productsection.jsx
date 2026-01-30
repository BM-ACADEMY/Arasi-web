// src/Components/Pages/Homepage/ProductSection.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import ProductCard from '../../Shop/ProductCard';
// Use lucide-react icons if available, else standard text
import { TrendingUp, ArrowRight } from 'lucide-react'; 

const ProductSection = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Standard Products (Featured)
        const productsReq = api.get('/products');
        // 2. Fetch Best Sellers (Top Selling > 10)
        // If this endpoint returns 404 (until backend updates are applied), it will be caught
        const bestSellersReq = api.get('/products/best-sellers');

        const [productsRes, bestSellersRes] = await Promise.allSettled([productsReq, bestSellersReq]);

        // Handle Featured Products
        if (productsRes.status === "fulfilled") {
            const data = productsRes.value.data;
            const featured = data.data
                .filter(p => p.isActive)
                .slice(0, 8);
            setFeaturedProducts(featured);
        }

        // Handle Best Sellers
        if (bestSellersRes.status === "fulfilled" && bestSellersRes.value.data.success) {
            setBestSellers(bestSellersRes.value.data.data);
        }

      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return null; 

  return (
    <>
      {/* --- SECTION 1: EXISTING FEATURED GRID --- */}
      <section className="py-15 bg-white border-t border-gray-100 flex justify-center w-full">
        <div className="w-full max-w-screen-2xl px-6 md:px-12">
          
          {/* Header */}
          <div className="flex justify-between items-end mb-12">
            <div className="space-y-1">
              <h2 className="text-3xl md:text-4xl font-medium text-gray-900 font-serif tracking-tight">
                Featured <span className="text-[#d5242c]">Arrivals</span>
              </h2>
              <div className="flex items-center gap-2">
                <div className="h-[2px] w-6 bg-red-600"></div>
                <p className="text-gray-500 text-sm font-medium tracking-wide uppercase">
                  Daily essentials for your routine
                </p>
              </div>
            </div>

            <Link to="/shop" className="hidden font-serif md:flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-[#d5242c] transition-colors group">
              View collection 
              <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
            </Link>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 2: NEW BEST SELLERS SLIDER (Dark Background) --- */}
      {bestSellers.length > 0 && (
        <section className="py-20 bg-[#faf9f6] text-white w-full overflow-hidden">
          <div className="w-full max-w-screen-2xl mx-auto px-6 md:px-12">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
               <div className="flex items-center gap-3">
                  <div className="space-y-1">
              <h2 className="text-3xl md:text-4xl font-medium text-gray-900 font-serif tracking-tight">
                Trending <span className="text-[#d5242c]">Products</span>
              </h2>
              <div className="flex items-center gap-2">
                <div className="h-[2px] w-6 bg-red-600"></div>
                <p className="text-gray-500 text-sm font-medium tracking-wide uppercase">
                  Most popular picks, sold over 1k
                </p>
              </div>
            </div>
               </div>
               
               <Link to="/shop" className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-700 transition-colors">
                  Shop All <ArrowRight className="w-4 h-4" />
               </Link>
            </div>

            {/* Horizontal Slider */}
            {/* 'snap-x' enables snap scrolling, 'overflow-x-auto' enables horizontal scroll */}
            <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
               {bestSellers.map((product) => (
                 <div key={product._id} className="snap-center shrink-0 w-[260px] md:w-[280px]">
                    <ProductCard product={product} />
                 </div>
               ))}
            </div>

          </div>
        </section>
      )}
    </>
  );
};

export default ProductSection;