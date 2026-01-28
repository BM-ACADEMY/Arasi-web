import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api"; // Your Axios instance

const SearchBar = ({ isOpen, onToggle }) => {
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // State
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // --- SEARCH LOGIC (Debounced) ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 0) {
        setLoading(true);
        try {
          // Calls the updated backend route
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
    }, 400); // Wait 400ms after typing

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        !event.target.closest("button") &&
        !event.target.closest(".search-results-dropdown")
      ) {
        onToggle(false);
        setQuery(""); 
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onToggle]);

  // Handle Result Click
  const handleResultClick = (slug) => {
    navigate(`/product/${slug}`); // Navigate to Details Page
    onToggle(false); // Close Search
    setQuery("");
    setResults([]);
  };

  return (
    <div className="flex items-center justify-end relative z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex items-center overflow-hidden bg-gray-100 rounded-full mr-2 absolute right-10 top-0 bottom-0 h-10 my-auto md:static md:h-auto"
          >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-transparent border-none outline-none text-sm px-4 py-2 text-slate-700 placeholder-slate-400"
            />
            {loading && (
              <div className="pr-3 animate-spin text-slate-400">
                <Loader2 size={16} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => onToggle(!isOpen)}
        className={`p-2.5 rounded-full transition-colors relative z-30 ${
          isOpen
            ? "bg-slate-200 text-slate-800"
            : "text-slate-600 hover:bg-[#4183cf]/10 hover:text-[#4183cf]"
        }`}
      >
        {isOpen ? <X size={20} /> : <Search size={20} />}
      </button>

      {/* --- DROPDOWN RESULTS --- */}
      <AnimatePresence>
        {isOpen && query.length > 0 && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="search-results-dropdown absolute top-full right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden max-h-96 overflow-y-auto"
          >
            {results.map((product) => (
              <div
                key={product._id}
                onClick={() => handleResultClick(product.slug)}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-none transition-colors"
              >
                {/* Image */}
                <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={product.images?.[0] || "/placeholder.jpg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Text Info */}
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-gray-800 truncate">
                    {product.name}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-medium uppercase tracking-wider text-[10px] bg-gray-100 px-1 rounded">
                      {product.brand || "Generic"}
                    </span>
                    {product.variants?.[0]?.price && (
                       <span>₹{product.variants[0].price}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results State */}
      {isOpen && query.length > 0 && !loading && results.length === 0 && (
         <div className="absolute top-full right-0 mt-3 w-64 bg-white p-4 rounded-xl shadow-xl border border-gray-100 text-center text-sm text-gray-500">
           No matching products found.
         </div>
      )}
    </div>
  );
};

export default SearchBar;