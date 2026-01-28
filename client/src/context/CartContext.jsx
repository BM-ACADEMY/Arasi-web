import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
// Adjust this import path if needed based on your folder structure
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
        setCart(data.data);
        const count = data.data?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
        setCartCount(count);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  // 2. Safe ID Helper
  const getProductId = (item) => {
    return (item.product._id || item.product).toString();
  };

  // 3. Get Quantity Helper (Optional: Updated to support variants if needed)
  const getItemQuantity = (productId, variant = null) => {
    if (!cart || !cart.items) return 0;
    const item = cart.items.find((item) => 
      getProductId(item) === productId.toString() && 
      (!variant || item.variant === variant)
    );
    return item ? item.quantity : 0;
  };

  // 4. Add to Cart (FIXED: Accepts variant and sends it to backend)
  const addToCart = async (productId, quantity = 1, variant = null) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return false;
    }

    try {
      // Pass 'variant' in the body so the controller can save it
      const { data } = await api.post("/cart/add", { 
        productId, 
        quantity, 
        variant 
      });

      if (data.success) {
        setCart(data.data);
        const count = data.data.items.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(count);
        
        // Only show toast for manual adds (quantity > 0)
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
        setCart(data.data);
        const count = data.data.items.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(count);
        toast.success("Item removed");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to remove item");
    }
  };

  // 6. Decrease Quantity Logic (Updated to handle variants)
  const decreaseQty = async (productId, variant = null) => {
    if (!cart) return;

    // Find specific item by ID AND variant
    const item = cart.items.find((i) => 
      getProductId(i) === productId.toString() && 
      (!variant || i.variant === variant)
    );
    
    if (!item) return;

    // Logic: If > 1, decrease. If 1, remove.
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