import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, ArrowRight, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import Searchiamge from "@/assets/illustration/search.png"; // Importing logo for the center display

const SearchBar = ({ isOpen, onToggle }) => {
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // State
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery(""); // Clear search when closed
      setResults([]);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Live Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 0) {
        setLoading(true);
        try {
          const { data } = await api.get(`/products?keyword=${query}`);
          if (data.success) {
            setResults(data.data);
          }
        } catch (error) {
          console.error("Search Error:", error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
       navigate(`/shop?keyword=${encodeURIComponent(query)}`);
       onToggle(false);
    }
  };

  const handleResultClick = (slug) => {
    navigate(`/product/${slug}`);
    onToggle(false);
  };

  // --- COMPONENT: Compact Product Card ---
  const ProductCard = ({ product }) => (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => handleResultClick(product.slug)}
      className="group flex items-center gap-3 p-2 bg-white rounded-lg border border-transparent hover:border-gray-100 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
    >
      <div className="relative w-14 h-14 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 border border-gray-100">
        <img src={product.images?.[0] || "/placeholder.jpg"} alt={product.name} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
            <h4 className="font-semibold text-slate-800 text-xs truncate pr-2 group-hover:text-[#4B7163] transition-colors">
                {product.name}
            </h4>
            <span className="font-bold text-slate-900 text-xs whitespace-nowrap">
                {product.variants?.[0]?.price ? `₹${product.variants[0].price}` : ""}
            </span>
        </div>
        <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{product.brand || "Arasi"}</span>
            <ArrowRight size={12} className="text-[#4B7163] -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
         <div className="relative z-[100]">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => onToggle(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90]"
            />

            <motion.div
              initial={{ x: "100%" }} animate={{ x: "0%" }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] sm:w-[400px] bg-white z-[100] shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 bg-white">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4B7163] transition-colors" size={16} />
                        <input 
                            ref={inputRef}
                            type="text" 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="What are you looking for?"
                            className="w-full bg-gray-50 focus:bg-white text-slate-800 text-sm rounded-lg pl-9 pr-4 py-2.5 outline-none border border-transparent focus:border-[#4B7163]/30 transition-all"
                        />
                    </div>
                    <button onClick={() => onToggle(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-4 scrollbar-hide flex flex-col">
                    
                    {/* --- INITIAL STATE: Centered Image (Hidden when searching) --- */}
                    <AnimatePresence>
                        {query.length === 0 && !loading && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex-1 flex flex-col items-center justify-center text-center space-y-4"
                            >
                                <div className="w-52 h-52 bg-gray-50 rounded-full flex items-center justify-center p-6 border border-gray-100">
                                    <img src={Searchiamge} alt="Centered Logo" className="w-full h-auto object-contain opacity-70" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-slate-800 font-bold text-sm tracking-widest uppercase">Start Exploring</h3>
                                    <p className="text-slate-400 text-[11px] max-w-[200px] mx-auto">Discover our natural collection of premium soaps and benefits.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* --- SEARCH RESULTS --- */}
                    {loading ? (
                       <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                           <Loader2 className="animate-spin text-[#4B7163]" size={24} />
                           <span className="text-[10px] font-bold tracking-widest uppercase">Searching...</span>
                       </div>
                    ) : (
                       <div className="space-y-1">
                          {query.length > 0 && results.length === 0 && (
                              <div className="text-center py-12">
                                  <div className="inline-flex p-3 bg-gray-50 rounded-full mb-3 text-slate-300">
                                      <ShoppingBag size={20} />
                                  </div>
                                  <p className="text-slate-500 text-xs">No items found for "{query}"</p>
                              </div>
                          )}

                          <AnimatePresence>
                            {query.length > 0 && results.map((product) => (
                              <ProductCard key={product._id} product={product} />
                            ))}
                          </AnimatePresence>
                       </div>
                    )}
                </div>
                
                {/* Footer */}
                {query.length > 0 && results.length > 0 && (
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                      <button 
                         onClick={() => { navigate(`/shop?keyword=${query}`); onToggle(false); }}
                         className="w-full bg-[#006baf] text-white font-bold text-xs py-3 rounded-lg hover:bg-[#3d5c50] transition-colors uppercase tracking-wider"
                      >
                          View All {results.length} Results
                      </button>
                  </div>
                )}
            </motion.div>
         </div>
      )}
    </AnimatePresence>
  );
};

export default SearchBar;