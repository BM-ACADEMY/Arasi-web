// src/components/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // instant jump to top (no smooth behavior)
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
