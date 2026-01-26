import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";

const SearchBar = ({ isOpen, onToggle }) => {
  const inputRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside input AND outside the toggle button
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target) && 
        !event.target.closest('button')
      ) {
        onToggle(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onToggle]);

  return (
    <div className="flex items-center justify-end relative">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }} // Slightly wider since logo hides
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex items-center overflow-hidden bg-gray-100 rounded-full mr-2 absolute right-10 top-0 bottom-0 h-10 my-auto z-20 md:static md:h-auto"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              className="w-full bg-transparent border-none outline-none text-sm px-4 py-2 text-slate-700 placeholder-slate-400"
            />
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
    </div>
  );
};

export default SearchBar;