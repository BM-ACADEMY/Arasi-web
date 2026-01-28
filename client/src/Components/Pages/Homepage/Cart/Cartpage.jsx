import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Loader2
} from "lucide-react";
import { useCart } from "@/context/CartContext";

// Helper to construct image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return "https://via.placeholder.com/150";
  if (imagePath.startsWith("http")) return imagePath;
  return `${import.meta.env.VITE_API_URL.replace('/api', '')}/${imagePath}`;
};

const CartPage = () => {
  const { cart, addToCart, removeFromCart } = useCart();

  // --- HANDLERS ---
  const handleQuantityChange = async (productId, variant, currentQty, change) => {
    // If decrementing would result in 0, don't do anything (use remove button instead)
    if (change === -1 && currentQty <= 1) return;

    // Call addToCart with +1 or -1 and include Variant
    await addToCart(productId, change, variant);
  };

  const handleRemove = async (itemId) => {
    await removeFromCart(itemId);
  };

  // --- LOADING / EMPTY STATES ---
  if (!cart) {
     return (
        <div className="min-h-screen pt-24 flex items-center justify-center">
           <Loader2 className="animate-spin text-[#4183cf]" size={40} />
        </div>
     );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-slate-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <ShoppingBag size={48} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
          <p className="text-slate-500 mb-8">Looks like you haven't added anything to your cart yet. Discover our premium handmade soaps.</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#4183cf] text-white rounded-xl font-semibold shadow-lg shadow-blue-200 hover:bg-[#357abd] transition-all hover:-translate-y-1"
          >
            Start Shopping
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    );
  }

  // --- CALCULATIONS ---
  const subtotal = cart.totalAmount || cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = 0; // Free shipping logic
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen pt-24 pb-20 bg-slate-50">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">

        {/* Header */}
        <div className="flex items-center gap-2 mb-8 text-sm text-slate-500">
          <Link to="/" className="hover:text-[#4183cf] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">Shopping Cart</span>
        </div>

        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-slate-800 mb-8"
        >
          Your Cart <span className="text-lg font-normal text-slate-400 ml-2">({cart.items.length} items)</span>
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* LEFT COLUMN: Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart.items.map((item) => {
                 // item.product might be null if product was deleted from DB
                 if(!item.product) return null;

                 return (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 sm:gap-6 group"
                >
                  {/* Image */}
                  <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-slate-100 rounded-xl overflow-hidden">
                    <img
                      src={getImageUrl(item.product.images?.[0])}
                      alt={item.product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        {item.product.category && (
                             <p className="text-xs font-semibold text-[#4183cf] uppercase tracking-wider mb-1">
                                {typeof item.product.category === 'object' ? item.product.category.name : "Collection"}
                             </p>
                        )}
                        <h3 className="text-slate-800 font-bold text-lg leading-tight">
                            <Link to={`/product/${item.product.slug}`} className="hover:underline">
                                {item.product.name}
                            </Link>
                        </h3>
                        
                        {/* --- VARIANT DISPLAY --- */}
                        {item.variant && (
                            <p className="text-sm text-slate-500 mt-1 font-medium bg-slate-50 inline-block px-2 py-0.5 rounded border border-slate-200">
                                Size: {item.variant}
                            </p>
                        )}
                      </div>
                      <p className="text-lg font-bold text-slate-800">₹{item.price}</p>
                    </div>

                    <div className="flex justify-between items-end mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1 border border-slate-100">
                        <button
                          onClick={() => handleQuantityChange(item.product._id, item.variant, item.quantity, -1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-slate-600 shadow-sm hover:text-[#4183cf] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-4 text-center text-sm font-semibold text-slate-700">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.product._id, item.variant, item.quantity, 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-slate-600 shadow-sm hover:text-[#4183cf] transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="flex items-center gap-1 text-sm text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            </AnimatePresence>

            <Link to="/products" className="inline-flex items-center gap-2 text-sm font-medium text-[#4183cf] hover:underline mt-4">
               <ArrowLeft size={16} />
               Continue Shopping
            </Link>
          </div>

          {/* RIGHT COLUMN: Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping Estimate</span>
                  <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                    {shipping === 0 ? "Free" : `₹${shipping}`}
                  </span>
                </div>
                <div className="h-px bg-slate-100 my-2"></div>
                <div className="flex justify-between text-lg font-bold text-slate-800">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
  to="/checkout"
  className="w-full py-4 bg-[#4183cf] hover:bg-[#357abd] text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mb-4"
>
  Proceed to Checkout
  <ArrowRight size={20} />
</Link>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
                 <div className="flex flex-col items-center text-center gap-2">
                    <ShieldCheck size={20} className="text-slate-400" />
                    <span className="text-xs text-slate-500">Secure Payment</span>
                 </div>
                 <div className="flex flex-col items-center text-center gap-2">
                    <Truck size={20} className="text-slate-400" />
                    <span className="text-xs text-slate-500">Fast Delivery</span>
                 </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default CartPage;