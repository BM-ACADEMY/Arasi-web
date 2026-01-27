import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ShoppingCart, Plus, Minus } from 'lucide-react';

// Mock Data
const products = [
  {
    id: 1,
    title: "Omega-3 Heart Support",
    price: 27.49,
    originalPrice: 29.99,
    rating: 4,
    reviews: 189,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Radiance Vitamin C",
    price: 18.50,
    originalPrice: 22.00,
    rating: 5,
    reviews: 420,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdd403348?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Hyaluronic Acid Serum",
    price: 12.99,
    originalPrice: 15.99,
    rating: 4,
    reviews: 85,
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Retinol Night Cream",
    price: 34.00,
    originalPrice: 40.00,
    rating: 5,
    reviews: 120,
    image: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "Revitalizing Eye Cream",
    price: 24.50,
    originalPrice: 28.00,
    rating: 5,
    reviews: 210,
    image: "https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 6,
    title: "Mineral Sunscreen SPF 50",
    price: 22.00,
    originalPrice: 25.00,
    rating: 4,
    reviews: 330,
    image: "https://images.unsplash.com/photo-1556228720-198755645f56?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 7,
    title: "Exfoliating Rose Toner",
    price: 16.00,
    originalPrice: 19.50,
    rating: 4,
    reviews: 95,
    image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 8,
    title: "Clarifying Clay Mask",
    price: 19.99,
    originalPrice: 24.99,
    rating: 5,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=600&auto=format&fit=crop",
  }
];

const ProductSection = () => {
  const [cartItems, setCartItems] = useState({});

  const updateQuantity = (id, change) => {
    setCartItems(prev => {
      const currentQty = prev[id] || 0;
      const newQty = Math.max(0, currentQty + change);
      if (newQty === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newQty };
    });
  };

  return (
    <section className="py-20 bg-gray-50 flex justify-center w-full min-h-screen">
      <div className="w-full max-w-[1400px] px-6">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight font-serif">Best Sellers</h2>
            <p className="text-gray-500 mt-2 font-serif">Daily essentials for your routine.</p>
          </div>
          <a href="#" className="hidden md:block text-sm font-semibold text-[#4183cf] hover:underline">
            View collection &rarr;
          </a>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const quantity = cartItems[product.id] || 0;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-[2rem] p-4 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col relative"
              >
                
                

                {/* Image Container */}
                <div className="relative w-full aspect-square rounded-[1.5rem] bg-gray-50 overflow-hidden mb-4 group cursor-pointer">
                  <img 
                    src={product.image} 
                    alt={product.title}
                    className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-500 ease-in-out"
                  />
                </div>

                {/* Content */}
                <div className="px-2 flex flex-col flex-grow">
                  
                  {/* 1. Title (Specific Font Styles) */}
                  <h3 className="font-serif text-gray-900 tracking-tight text-xl font-medium leading-tight mb-2">
                    {product.title}
                  </h3>

                  {/* 2. Reviews */}
                  <div className="flex items-center gap-1 mb-3">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-500 font-medium">{product.rating}.0</span>
                    <span className="text-gray-300 mx-1">•</span>
                    <span className="text-sm text-gray-400">{product.reviews} reviews</span>
                  </div>

                  {/* 3. Amount / Price */}
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-medium text-gray-900">₹{product.price}</span>
                    {product.originalPrice > product.price && (
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
                          onClick={() => updateQuantity(product.id, 1)}
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
                            onClick={() => updateQuantity(product.id, -1)}
                            className="w-10 h-10 flex items-center justify-center bg-[#326bb3] rounded-full text-white hover:bg-[#25528a] transition-colors"
                          >
                            <Minus size={16} />
                          </button>

                          <span className="font-bold text-white text-base">
                            {quantity}
                          </span>

                          <button 
                            onClick={() => updateQuantity(product.id, 1)}
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
          })}
        </div>
      </div>
    </section>
  )
}

export default ProductSection;