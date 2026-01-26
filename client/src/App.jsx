import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ToasterProvider from "@/Components/UI/ToasterProvider";
import Mainroute from "./Routes/Mainroute";

function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider must be inside BrowserRouter to use navigation features */}
      <AuthProvider>
        <ToasterProvider />
        <Mainroute />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;