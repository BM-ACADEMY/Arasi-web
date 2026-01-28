import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import toast, { Toaster } from 'react-hot-toast';
import Mainroute from "./Routes/Mainroute";
import { CartProvider } from "@/context/CartContext";

function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider must be inside BrowserRouter to use navigation features */}
      <AuthProvider>
        <CartProvider>
           {/* <ToasterProvider /> */}
        <Toaster position="top-center" reverseOrder={false} />
        <Mainroute />
        </CartProvider>

      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
