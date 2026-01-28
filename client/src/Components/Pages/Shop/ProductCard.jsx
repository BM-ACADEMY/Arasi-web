import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ShoppingCart, Minus, Plus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext'; // <--- Import Context

const ProductCard = ({ product }) => {
  const { addToCart, getItemQuantity } = useCart(); // Get context functions
  const [quantity, setQuantity] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Sync local state with global cart state
  useEffect(() => {
    const qty = getItemQuantity(product._id);
    setQuantity(qty);
  }, [getItemQuantity, product._id]);

  // Handler for Adding Item
  const handleAddToCart = async (e) => {
    e.preventDefault(); // Stop navigation to detail page
    setIsLoading(true);

    // Call backend
    const success = await addToCart(product._id, 1);

    if (success) {
      // Logic handled by context update, but we can optimistically update local state if needed
      // The useEffect above will catch the change from context
    }
    setIsLoading(false);
  };

  const imageUrl = product.images?.[0] || "https://via.placeholder.com/300";
  const price = product.variants?.[0]?.price || 0;
  const originalPrice = product.originalPrice || (price * 1.2).toFixed(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-[2rem] p-4 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col relative h-full group"
    >
      <Link to={`/product/${product.slug}`} className="block h-full flex flex-col">
        <div className="relative w-full aspect-square rounded-[1.5rem] bg-gray-50 overflow-hidden mb-4">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-500 ease-in-out"
          />
        </div>

        <div className="px-2 flex flex-col flex-grow">
          <h3 className="font-serif text-gray-900 tracking-tight text-xl font-medium leading-tight mb-2 line-clamp-2">
            {product.name}
          </h3>

          <div className="flex items-center gap-1 mb-3">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-500 font-medium">4.8</span>
          </div>

          <div className="flex items-baseline gap-2 mb-4 mt-auto">
            <span className="text-2xl font-medium text-gray-900">₹{price}</span>
            {originalPrice > price && (
              <span className="text-sm text-gray-400 line-through">₹{originalPrice}</span>
            )}
          </div>
        </div>
      </Link>

      {/* --- ADD TO CART BUTTON SECTION --- */}
      <div className="mt-4 px-2">
        <AnimatePresence mode="wait" initial={false}>
          {quantity === 0 ? (
            <motion.button
              key="add-btn"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
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
              className="flex items-center justify-between w-full bg-[#4183cf] text-white rounded-full p-1 pl-2 pr-2 shadow-lg shadow-blue-100"
            >
              <span className="pl-3 font-medium text-sm">Added</span>

              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base bg-white/20 w-8 h-8 rounded-full flex items-center justify-center">
                   {quantity}
                </span>

                <button
                  onClick={handleAddToCart}
                  disabled={isLoading}
                  className="w-10 h-10 flex items-center justify-center bg-white text-[#4183cf] rounded-full hover:bg-gray-100 transition-colors"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={16}/> : <Plus size={16} />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ProductCard;
