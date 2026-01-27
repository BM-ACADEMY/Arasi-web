// src/Components/Pages/Shop/ProductCard.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ShoppingCart, Minus, Plus } from 'lucide-react';

const ProductCard = ({ product }) => {
  // Local state for quantity for UI demo. 
  // In real app, connect this to your Global CartContext.
  const [quantity, setQuantity] = useState(0);

  const updateQuantity = (id, change) => {
    setQuantity(prev => {
      const newQty = prev + change;
      return newQty < 0 ? 0 : newQty;
    });
    // Call global add-to-cart API here
  };

  // Safe fallback for image
  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0] 
    : "https://via.placeholder.com/300";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-[2rem] p-4 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col relative h-full"
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square rounded-[1.5rem] bg-gray-50 overflow-hidden mb-4 group cursor-pointer">
        <img 
          src={imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-500 ease-in-out"
        />
      </div>

      {/* Content */}
      <div className="px-2 flex flex-col flex-grow">
        
        {/* 1. Title */}
        <h3 className="font-serif text-gray-900 tracking-tight text-xl font-medium leading-tight mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* 2. Reviews (Mock data if missing from backend) */}
        <div className="flex items-center gap-1 mb-3">
          <Star size={14} className="fill-yellow-400 text-yellow-400" />
          <span className="text-sm text-gray-500 font-medium">{product.rating || "4.5"}</span>
          <span className="text-gray-300 mx-1">•</span>
          <span className="text-sm text-gray-400">{product.numReviews || 0} reviews</span>
        </div>

        {/* 3. Amount / Price */}
        <div className="flex items-baseline gap-2 mb-4">
          {/* Assuming variants[0] holds the main price */}
          <span className="text-2xl font-medium text-gray-900">
            ₹{product.variants?.[0]?.price || 0}
          </span>
          {/* Mock Original Price logic */}
          {(product.originalPrice || 0) > (product.variants?.[0]?.price || 0) && (
            <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
          )}
        </div>

        {/* 4. Button Area (Bottom) */}
        <div className="mt-auto h-12">
          <AnimatePresence mode="wait" initial={false}>
            {quantity === 0 ? (
              <motion.button
                key="add-btn"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateQuantity(product._id, 1)}
                className="w-full bg-[#4183cf] hover:bg-[#326bb3] text-white rounded-full py-3 px-4 font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-100"
              >
                <ShoppingCart size={16} />
                Add to Cart
              </motion.button>
            ) : (
              <motion.div
                key="controls"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center justify-between w-full bg-[#4183cf] text-white rounded-full p-1 pl-2 pr-2 shadow-lg shadow-blue-100"
              >
                <button 
                  onClick={() => updateQuantity(product._id, -1)}
                  className="w-10 h-10 flex items-center justify-center bg-[#326bb3] rounded-full text-white hover:bg-[#25528a] transition-colors"
                >
                  <Minus size={16} />
                </button>

                <span className="font-bold text-white text-base">
                  {quantity}
                </span>

                <button 
                  onClick={() => updateQuantity(product._id, 1)}
                  className="w-10 h-10 flex items-center justify-center bg-white text-[#4183cf] rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
};

export default ProductCard;