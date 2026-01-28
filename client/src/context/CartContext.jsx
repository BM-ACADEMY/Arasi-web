import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api"; // Ensure you have this Axios instance setup
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  // 1. Fetch Cart when user logs in
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart(null);
      setCartCount(0);
    }
  }, [user]);

  // 2. Function to get fresh cart data
  const fetchCart = async () => {
    try {
      const { data } = await api.get("/cart");
      if (data.success) {
        setCart(data.data);
        // Calculate total items (sum of all quantities)
        const count = data.data?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
        setCartCount(count);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  // 3. Helper to check how many of a specific product are in the cart
  const getItemQuantity = (productId) => {
    if (!cart || !cart.items) return 0;
    const item = cart.items.find((item) => item.product._id === productId);
    return item ? item.quantity : 0;
  };

  // 4. Add to Cart Function
  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return false;
    }

    try {
      const { data } = await api.post("/cart/add", { productId, quantity });

      if (data.success) {
        setCart(data.data);
        // Update the count immediately
        const count = data.data.items.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(count);

        toast.success("Added to cart!");
        return true;
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add to cart");
      return false;
    }
  };

  // 5. Remove Item Function (Optional for now, but good to have)
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
      toast.error("Failed to remove item");
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        getItemQuantity,
        addToCart,
        removeFromCart,
        fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
