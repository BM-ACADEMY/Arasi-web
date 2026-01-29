import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Minus, Plus, ShoppingBag, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import api from '@/services/api'; // Imported api service

const ProductCard = ({ product }) => {
  const { addToCart, decreaseQty, getItemQuantity } = useCart();
  const [quantity, setQuantity] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // --- New State for Ratings ---
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // --- Logic ---
  const defaultVariant = product.variants?.[0] || {};
  const variantLabel = defaultVariant.label || defaultVariant.unit || null;
  
  // 1. Setup Primary and Hover Images
  const firstImage = product.images?.[0] || "https://via.placeholder.com/300";
  const secondImage = product.images?.[1] || firstImage;

  const currentPrice = Number(defaultVariant.price) || Number(product.price) || 0;
  const originalPrice = Number(defaultVariant.originalPrice) || Number(product.originalPrice) || 0;
  
  const discountPercentage = originalPrice > currentPrice 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) 
    : 0;

  useEffect(() => {
    const qty = getItemQuantity(product._id, variantLabel);
    setQuantity(qty);
  }, [getItemQuantity, product._id, variantLabel]);

  // --- 2. New Logic: Fetch Reviews for this specific product ---
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await api.get(`/reviews/${product._id}`);
        if (data.success) {
          const reviews = data.data || [];
          const total = reviews.length;
          setTotalReviews(total);

          // Calculate Average
          if (total > 0) {
            const avg = (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1);
            setAverageRating(avg);
          } else {
            setAverageRating(0);
          }
        }
      } catch (error) {
        console.error("Error fetching reviews for card", error);
      }
    };

    if (product._id) {
      fetchReviews();
    }
  }, [product._id]);

  const handleIncrease = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await addToCart(product._id, 1, variantLabel);
    setIsLoading(false);
  };

  const handleDecrease = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await decreaseQty(product._id, variantLabel);
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex flex-col h-full w-full"
    >
      {/* --- Image Area --- */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-gray-50 border border-gray-100 shadow-sm transition-shadow duration-300 hover:shadow-md">
        
        <Link to={`/product/${product.slug}`} className="block w-full h-full cursor-pointer relative">
          
          {/* IMAGE 1: Default View */}
          <img
            src={firstImage}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* IMAGE 2: Hover View (Fades in) */}
          <img
            src={secondImage}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover object-center transition-all duration-700 ease-out opacity-0 group-hover:opacity-100 group-hover:scale-105"
          />
        </Link>

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute left-3 top-3 z-10 rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
            Save {discountPercentage}%
          </div>
        )}

        {/* --- Glassmorphic Action Bar --- */}
        <div className="absolute bottom-0 left-0 right-0 p-3 lg:translate-y-full lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 transition-all duration-300 ease-out z-20">
          <AnimatePresence mode="wait">
            {quantity === 0 ? (
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                onClick={handleIncrease}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/90 backdrop-blur-md py-3 text-sm font-semibold text-gray-900 shadow-lg hover:bg-white transition-colors border border-white/20"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin text-gray-600" size={18} />
                ) : (
                  <>
                    <ShoppingBag size={16} /> 
                    <span>Add to Cart</span>
                  </>
                )}
              </motion.button>
            ) : (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="flex w-full items-center justify-between rounded-xl bg-white/95 backdrop-blur-md px-1 py-1 shadow-lg ring-1 ring-black/5"
              >
                <button 
                  onClick={handleDecrease} 
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-red-500 transition-colors"
                >
                  <Minus size={16} />
                </button>
                
                <span className="font-semibold text-gray-900 w-8 text-center tabular-nums">
                  {quantity}
                </span>
                
                <button 
                  onClick={handleIncrease} 
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-green-600 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- Product Details --- */}
      <div className="mt-4 flex flex-col gap-1 px-1">
        <Link to={`/product/${product.slug}`} className="group/title">
          <h3 className="font-medium text-gray-900 text-base leading-snug line-clamp-1 group-hover/title:text-indigo-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {/* --- Updated Rating Section --- */}
        <div className="flex items-center gap-1">
          <Star size={14} className={`fill-amber-400 ${totalReviews > 0 ? "text-amber-400" : "text-gray-300"}`} />
          <span className="text-xs font-medium text-gray-700">
            {totalReviews > 0 ? averageRating : "New"}
          </span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500">
             {totalReviews > 0 ? `(${totalReviews})` : (product.variants?.length > 0 ? `${product.variants.length} options` : 'In Stock')}
          </span>
        </div>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">
            ₹{currentPrice.toLocaleString()}
          </span>
          
          {originalPrice > currentPrice && (
            <span className="text-sm text-gray-400 line-through">
              ₹{originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;