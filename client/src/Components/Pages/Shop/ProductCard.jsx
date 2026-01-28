import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ShoppingCart, Minus, Plus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';

const ProductCard = ({ product }) => {
  // 1. Get the updated functions from Context
  const { addToCart, decreaseQty, getItemQuantity } = useCart();
  const [quantity, setQuantity] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 2. Identify the "Default" Variant (First one)
  const defaultVariant = product.variants?.[0];
  const variantLabel = defaultVariant?.label || defaultVariant?.unit || null;

  // 3. Get Price from the default variant
  const price = defaultVariant?.price || product.price || 0;
  const originalPrice = product.originalPrice || (price * 1.2).toFixed(0);
  const imageUrl = product.images?.[0] || "https://via.placeholder.com/300";

  // 4. Sync State: Check quantity SPECIFICALLY for this variant
  useEffect(() => {
    // Pass variantLabel to see how many of *this specific size* are in cart
    const qty = getItemQuantity(product._id, variantLabel);
    setQuantity(qty);
  }, [getItemQuantity, product._id, variantLabel]);

  const handleIncrease = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // 5. Pass variantLabel to addToCart
    await addToCart(product._id, 1, variantLabel);
    setIsLoading(false);
  };

  const handleDecrease = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // 6. Pass variantLabel to decreaseQty
    await decreaseQty(product._id, variantLabel);
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-[2rem] p-4 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col relative h-full group"
    >
      <Link to={`/product/${product.slug}`} className="block h-full flex flex-col">
        {/* Image Container */}
        <div className="relative w-full aspect-square rounded-[1.5rem] bg-gray-50 overflow-hidden mb-4">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-500 ease-in-out"
          />
        </div>

        {/* Text Content */}
        <div className="px-2 flex flex-col flex-grow">
          <h3 className="font-serif text-gray-900 tracking-tight text-xl font-medium leading-tight mb-2 line-clamp-2">
            {product.name}
          </h3>

          <div className="flex items-center gap-1 mb-3">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-500 font-medium">4.8</span>
          </div>

          <div className="flex items-baseline gap-2 mb-4 mt-auto">
            {/* Display the price of the first variant */}
            <span className="text-2xl font-medium text-gray-900">₹{price}</span>
            {originalPrice > price && (
              <span className="text-sm text-gray-400 line-through">₹{originalPrice}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Buttons */}
      <div className="mt-2 px-2 h-12 relative z-10">
        <AnimatePresence mode="wait" initial={false}>
          {quantity === 0 ? (
            <motion.button
              key="add-btn"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleIncrease}
              disabled={isLoading}
              className="w-full bg-[#4183cf] hover:bg-[#326bb3] text-white rounded-full py-3 px-4 font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-100 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="animate-spin" size={16}/> : <ShoppingCart size={16} />}
              Add to Cart
            </motion.button>
          ) : (
            <motion.div
              key="controls"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-between w-full bg-[#4183cf] text-white rounded-full p-1 shadow-lg shadow-blue-100"
            >
              <button
                onClick={handleDecrease}
                disabled={isLoading}
                className="w-10 h-10 flex items-center justify-center bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
              >
                 <Minus size={16} />
              </button>

              <span className="font-bold text-white text-base w-8 text-center tabular-nums">
                {isLoading ? <Loader2 className="animate-spin inline" size={14} /> : quantity}
              </span>

              <button
                onClick={handleIncrease}
                disabled={isLoading}
                className="w-10 h-10 flex items-center justify-center bg-white text-[#4183cf] rounded-full hover:bg-gray-100 transition-colors"
              >
                <Plus size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ProductCard;
