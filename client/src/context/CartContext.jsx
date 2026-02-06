import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext"; 
import toast from "react-hot-toast";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  // 1. Fetch Cart
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart(null);
      setCartCount(0);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const { data } = await api.get("/cart");
      if (data.success) {
        // --- FIX: Filter out null products immediately ---
        // If a product was deleted from DB, item.product will be null.
        // We filter them out so the UI doesn't crash.
        const validItems = data.data?.items?.filter(item => item.product) || [];
        
        const cleanCart = { ...data.data, items: validItems };
        setCart(cleanCart);
        
        const count = validItems.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(count);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  // 2. Safe ID Helper (FIXED)
  const getProductId = (item) => {
    // Safety check: if product is null, return empty string to prevent crash
    if (!item || !item.product) return ""; 
    return (item.product._id || item.product).toString();
  };

  // 3. Get Quantity Helper
  const getItemQuantity = (productId, variant = null) => {
    if (!cart || !cart.items) return 0;
    
    const item = cart.items.find((item) => {
      // Skip invalid items to be safe
      if (!item.product) return false; 

      return (
        getProductId(item) === productId.toString() && 
        (!variant || item.variant === variant)
      );
    });
    
    return item ? item.quantity : 0;
  };

  // 4. Add to Cart
  const addToCart = async (productId, quantity = 1, variant = null) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return false;
    }

    try {
      const { data } = await api.post("/cart/add", { 
        productId, 
        quantity, 
        variant 
      });

      if (data.success) {
        // Also apply the filter here just in case backend returns ghost items
        const validItems = data.data.items.filter(item => item.product);
        const cleanCart = { ...data.data, items: validItems };

        setCart(cleanCart);
        const count = validItems.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(count);
        
        if (quantity > 0) toast.success("Cart updated");
        return true;
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update cart");
      return false;
    }
  };

  // 5. Remove Item
  const removeFromCart = async (itemId) => {
    try {
      const { data } = await api.delete(`/cart/${itemId}`);
      if (data.success) {
        const validItems = data.data.items.filter(item => item.product);
        const cleanCart = { ...data.data, items: validItems };

        setCart(cleanCart);
        const count = validItems.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(count);
        toast.success("Item removed");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to remove item");
    }
  };

  // 6. Decrease Quantity Logic
  const decreaseQty = async (productId, variant = null) => {
    if (!cart) return;

    const item = cart.items.find((i) => {
       if (!i.product) return false;
       return getProductId(i) === productId.toString() && (!variant || i.variant === variant)
    });
    
    if (!item) return;

    if (item.quantity > 1) {
      await addToCart(productId, -1, variant);
    } else {
      await removeFromCart(item._id);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        getItemQuantity,
        addToCart,
        decreaseQty,
        removeFromCart,
        fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);