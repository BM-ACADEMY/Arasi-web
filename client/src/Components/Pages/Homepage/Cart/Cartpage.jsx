import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Truck,
  Loader2,
  Lock
} from "lucide-react";
import { useCart } from "@/context/CartContext";

const getImageUrl = (imagePath) => {
  if (!imagePath) return "https://via.placeholder.com/150";
  if (imagePath.startsWith("http")) return imagePath;
  return `${import.meta.env.VITE_API_URL.replace('/api', '')}/${imagePath}`;
};

const CartPage = () => {
  const { cart, addToCart, removeFromCart } = useCart();

  const handleQuantityChange = async (productId, variant, currentQty, change) => {
    if (change === -1 && currentQty <= 1) return;
    await addToCart(productId, change, variant);
  };

  if (!cart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F8F6]">
        <Loader2 className="animate-spin text-[#948F89]" size={32} />
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-[#F9F8F6] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <ShoppingBag size={50} className="mx-auto mb-8 text-[#D1CDC7] stroke-[1px]" />
          <h2 className="text-3xl font-serif italic text-[#2C2C2C] mb-4">The cart is currently empty</h2>
          <p className="text-[#87827D] mb-10 max-w-sm mx-auto font-light leading-relaxed">
            Discover our collection of artisanal soaps, handcrafted for the modern connoisseur.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-3 px-12 py-4 bg-[#2C2C2C] text-[#F9F8F6] text-[11px] tracking-[0.3em] uppercase hover:bg-[#404040] transition-all"
          >
            Shop Collection
          </Link>
        </motion.div>
      </div>
    );
  }

  const subtotal = cart.totalAmount || cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen pt-24 md:pt-32 lg:pt-40 pb-24 bg-[#F9F8F6]"> 
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <header className="mb-10 md:mb-16 text-center lg:text-left">
          <nav className="flex items-center justify-center lg:justify-start gap-2 text-[10px] uppercase tracking-[0.25em] text-[#948F89] mb-4">
            <Link to="/" className="hover:text-[#2C2C2C] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#2C2C2C]">Your Selection</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-serif text-[#2C2C2C] tracking-tight">Shopping Bag</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* LEFT: Items List */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="border-t border-[#E8E4E1]">
              <AnimatePresence mode="popLayout">
                {cart.items.map((item) => {
                  if (!item.product) return null;
                  return (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="py-8 md:py-10 border-b border-[#E8E4E1] flex flex-col sm:flex-row gap-6 md:gap-8 group"
                    >
                      {/* Image Container */}
                      <div className="relative w-full sm:w-32 h-48 sm:h-40 bg-[#F1EFED] overflow-hidden flex-shrink-0 shadow-sm">
                        <img
                          src={getImageUrl(item.product.images?.[0])}
                          alt={item.product.name}
                          className="w-full h-full object-cover mix-blend-multiply opacity-90 transition-transform duration-1000 group-hover:scale-110"
                        />
                      </div>

                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-[#948F89]">
                              {typeof item.product.category === 'object' ? item.product.category.name : "Artisanal"}
                            </p>
                            <h3 className="text-lg md:text-xl font-medium text-[#2C2C2C] leading-tight hover:text-[#948F89] transition-colors">
                              <Link to={`/product/${item.product.slug}`}>{item.product.name}</Link>
                            </h3>
                            {item.variant && (
                              <p className="text-[11px] text-[#87827D] font-light uppercase tracking-widest pt-1">
                                Size: {item.variant}
                              </p>
                            )}
                          </div>
                          <p className="text-lg font-light text-[#2C2C2C]">₹{item.price.toLocaleString()}</p>
                        </div>

                        <div className="mt-6 sm:mt-auto flex justify-between items-center">
                          {/* Quantity Switcher */}
                          <div className="flex items-center border border-[#D1CDC7] rounded-full px-1">
                            <button
                              onClick={() => handleQuantityChange(item.product._id, item.variant, item.quantity, -1)}
                              className="w-8 h-8 flex items-center justify-center text-[#2C2C2C] hover:text-[#948F89]"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-2 text-xs font-medium min-w-[24px] text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.product._id, item.variant, item.quantity, 1)}
                              className="w-8 h-8 flex items-center justify-center text-[#2C2C2C] hover:text-[#948F89]"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="text-[10px] uppercase tracking-[0.2em] text-[#948F89] hover:text-red-800 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 size={13} />
                            <span className="hidden xs:inline">Remove</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT: Sidebar Summary */}
          <aside className="lg:col-span-5 order-1 lg:order-2">
            <div className="bg-[#F1EFED] p-8 md:p-12 lg:sticky lg:top-32 rounded-sm">
              <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-[#2C2C2C] mb-8 text-center">
                Order Summary
              </h2>

              <div className="space-y-4 mb-10">
                <div className="flex justify-between text-sm text-[#87827D]">
                  <span className="font-light">Subtotal</span>
                  <span className="text-[#2C2C2C]">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-[#87827D]">
                  <span className="font-light">Shipping</span>
                  <span className="text-[#2C2C2C] font-serif">Free</span>
                </div>
                <div className="pt-6 border-t border-[#D1CDC7] flex justify-between items-baseline">
                  <span className="text-sm uppercase tracking-widest font-medium text-[#2C2C2C]">Total</span>
                  <span className="text-2xl md:text-3xl text-[#2C2C2C]">₹{total.toLocaleString()}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="flex items-center justify-center w-full py-4 md:py-5 bg-[#2C2C2C] text-[#F9F8F6] text-[11px] uppercase tracking-[0.3em] transition-all hover:bg-[#404040] mb-8"
              >
                Proceed to Checkout
              </Link>

              <div className="space-y-4 pt-6 border-t border-[#D1CDC7]/50">
                <div className="flex items-center gap-4 text-[#948F89]">
                  <Lock size={14} />
                  <span className="text-[10px] uppercase tracking-widest">Secure encrypted checkout</span>
                </div>
                <div className="flex items-center gap-4 text-[#948F89]">
                  <Truck size={14} />
                  <span className="text-[10px] uppercase tracking-widest">Carbon-neutral delivery</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CartPage;