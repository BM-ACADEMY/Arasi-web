import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import toast, { Toaster } from 'react-hot-toast';
import Mainroute from "./Routes/Mainroute";

function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider must be inside BrowserRouter to use navigation features */}
      <AuthProvider>
        {/* <ToasterProvider /> */}
        <Toaster position="top-center" reverseOrder={false} />
        <Mainroute />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;