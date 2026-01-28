import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/services/api';
import { useCart } from "@/context/CartContext"; 
import { 
  Star, ShoppingBag, ChevronRight, Minus, Plus, 
  Truck, ShieldCheck, Share2 // Removed Heart import
} from 'lucide-react';

const ProductDetailsPage = () => {
  const { slug } = useParams();
  const { addToCart } = useCart(); 
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Interaction State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  
  // Cart State
  const [isAdded, setIsAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Inject Google Font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/slug/${slug}`);
        if(data.success) setProduct(data.data);
      } catch (error) {
        console.error("Error fetching product", error);
      } finally {
        setLoading(false);
      }
    };
    if(slug) fetchProduct();
  }, [slug]);

  // --- LOGIC START ---
  const getActiveVariant = () => {
    if (!product) return null;
    const active = product.variants?.[selectedVariantIndex] || {};
    return active.label || active.unit || null;
  };

  const handleInitialAdd = async () => {
    if (!product) return;
    const variantLabel = getActiveVariant();
    setIsAdded(true); 
    setQuantity(1);
    await addToCart(product._id, 1, variantLabel);
  };

  const handleIncrement = async () => {
    const variantLabel = getActiveVariant();
    setQuantity(prev => prev + 1);
    await addToCart(product._id, 1, variantLabel);
  };

  const handleDecrement = async () => {
    const variantLabel = getActiveVariant();
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
      await addToCart(product._id, -1, variantLabel); 
    } else {
      setIsAdded(false);
      setQuantity(1);
      await addToCart(product._id, -1, variantLabel); 
    }
  };

  // Handle Share Functionality
  const handleShare = async () => {
    const shareData = {
      title: product?.name || 'Product',
      text: 'Check out this product!',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy link', err);
      }
    }
  };
  // --- LOGIC END ---

  const fontSerif = { fontFamily: '"Playfair Display", serif' };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="h-12 w-12 border border-gray-200 border-t-[#507A58] rounded-full animate-spin"></div>
    </div>
  );

  if (!product) return <div className="pt-32 text-center font-serif text-xl">Product not found.</div>;

  // --- Dynamic Data ---
  const images = product.images && product.images.length > 0 ? product.images : ["https://via.placeholder.com/600"];
  const activeVariant = product.variants?.[selectedVariantIndex] || {};
  const currentPrice = activeVariant.price || product.price || 0;
  const originalPrice = product.originalPrice || (currentPrice * 1.2).toFixed(0);

  // Default details if none provided
  const productDetails = product.details?.length > 0 ? product.details : [
    { heading: "Ingredients", content: "Natural oils, herbal extracts, glycerin, essential oils, and vitamin E." },
    { heading: "How to Use", content: "Lather well and apply to body. Rinse thoroughly with water." }
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 font-sans pb-20">
      
      {/* Navbar Spacer */}
      <div className="h-24 md:h-28"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center text-[10px] md:text-xs tracking-[0.2em] text-gray-500 mb-10 uppercase font-medium">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight size={10} className="mx-3 text-gray-400" />
          <span className="hover:text-black cursor-pointer">{product.category?.name || 'Shop'}</span>
          <ChevronRight size={10} className="mx-3 text-gray-400" />
          <span className="text-black">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

          {/* === LEFT: GALLERY === */}
          <div className="lg:col-span-7">
            <div className="flex flex-col-reverse lg:flex-row gap-6 sticky top-32">
              {/* Thumbnails */}
              <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible w-full lg:w-24 shrink-0 no-scrollbar justify-start">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onMouseEnter={() => setSelectedImageIndex(idx)}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-24 lg:w-full lg:h-32 flex-shrink-0 border transition-all duration-300 ${
                      selectedImageIndex === idx 
                        ? 'border-gray-900 opacity-100' 
                        : 'border-transparent opacity-60 hover:opacity-100 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt={`View ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div className="flex-1 bg-white relative aspect-[4/5] lg:aspect-auto lg:h-[700px] border border-gray-100 overflow-hidden group">
                 <img 
                   src={images[selectedImageIndex]} 
                   alt="Main View"
                   className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                 />
                 <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {/* Wishlist button removed */}
                    <button 
                      onClick={handleShare}
                      className="bg-white p-3 rounded-full shadow-md hover:bg-gray-50 text-gray-700"
                      title="Share Product"
                    >
                      <Share2 size={18} />
                    </button>
                 </div>
              </div>
            </div>
          </div>

          {/* === RIGHT: DETAILS === */}
          <div className="lg:col-span-5 flex flex-col">
            
            {/* 1. Header & Price */}
            <div className="mb-6 border-b border-gray-200 pb-6">
              <h2 className="text-sm tracking-widest text-[#507A58] font-bold uppercase mb-3">
                {product.subCategory?.name || "Premium Collection"}
              </h2>
              <h1 style={fontSerif} className="text-3xl md:text-4xl text-gray-900 leading-tight mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-4">
                  <span className="text-2xl font-medium tracking-wide">
                    ₹{currentPrice.toLocaleString()}
                  </span>
                  {originalPrice > currentPrice && (
                    <span className="text-lg text-gray-400 line-through font-light">
                      ₹{originalPrice}
                    </span>
                  )}
                </div>
                {/* Small star rating summary */}
                <div className="flex items-center gap-1">
                    <Star size={14} fill="#1f2937" className="text-gray-900" />
                    <span className="text-sm font-medium border-b border-gray-300">4.8</span>
                </div>
              </div>
            </div>

            {/* 2. Variants (Size) */}
            {product.variants?.length > 0 && (
              <div className="mb-8">
                <span className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Select Size</span>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedVariantIndex(idx);
                        setIsAdded(false);
                        setQuantity(1);
                      }}
                      className={`min-w-[4rem] px-4 py-3 text-sm transition-all duration-200 border ${
                        selectedVariantIndex === idx
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-900'
                      }`}
                    >
                      {v.label || v.unit}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. ACTION BUTTONS */}
            <div className="mb-8">
              {!isAdded ? (
                <button 
                  onClick={handleInitialAdd}
                  className="w-full bg-[#507A58] text-white h-14 hover:bg-[#3e6145] transition-all duration-300 flex items-center justify-center gap-3 shadow-sm hover:shadow-md uppercase tracking-wider text-sm font-bold"
                >
                  <ShoppingBag size={18} />
                  Add to Basket
                </button>
              ) : (
                <div className="flex items-center justify-between border border-[#507A58] h-14 px-4 bg-green-50/30 transition-all duration-300">
                  <button onClick={handleDecrement} className="p-2 hover:text-[#507A58] transition-colors">
                    <Minus size={18} />
                  </button>
                  <span className="font-medium text-lg text-[#507A58] w-12 text-center select-none">
                    {quantity}
                  </span>
                  <button onClick={handleIncrement} className="p-2 hover:text-[#507A58] transition-colors">
                    <Plus size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* 4. Trust Badges */}
            <div className="grid grid-cols-2 gap-4 mb-8 text-xs text-gray-500 tracking-wide uppercase">
                <div className="flex items-center gap-3 py-3 border-t border-b border-gray-100">
                    <Truck size={18} strokeWidth={1.5} /> 
                    <span>Free Shipping</span>
                </div>
                <div className="flex items-center gap-3 py-3 border-t border-b border-gray-100">
                    <ShieldCheck size={18} strokeWidth={1.5} /> 
                    <span>Secure Payment</span>
                </div>
            </div>

            {/* 5. DESCRIPTION (Moved Below Buttons) */}
            <div className="mb-10">
              <h3 className="font-bold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed font-light text-sm">
                {product.description || "Experience the essence of purity with our carefully crafted formula. Designed to rejuvenate and protect, leaving you feeling refreshed."}
              </p>
            </div>

            {/* 6. SPECIFICATIONS (Flat Layout - No Accordion) */}
            <div className="space-y-8 mb-12">
              {productDetails.map((detail, idx) => (
                <div key={idx}>
                   <h3 className="font-bold text-gray-900 mb-2">{detail.heading}</h3>
                   <div className="text-gray-600 text-sm leading-relaxed">
                     {detail.content}
                   </div>
                </div>
              ))}
            </div>

            {/* 7. REVIEWS & RATINGS (New Widget) */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Ratings & Reviews</h3>
              
              <div className="flex flex-col sm:flex-row gap-8">
                {/* Left: Big Score */}
                <div className="flex flex-col justify-center min-w-[120px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-5xl font-bold text-gray-900">4.8</span>
                    <Star size={28} fill="black" className="text-gray-900" />
                  </div>
                  <p className="text-sm text-gray-500">59 Ratings & <br/>7 Reviews</p>
                </div>

                {/* Right: Progress Bars */}
                <div className="flex-1 space-y-2">
                  {[
                    { stars: 5, count: 48, color: 'bg-green-600' },
                    { stars: 4, count: 9,  color: 'bg-green-600' },
                    { stars: 3, count: 1,  color: 'bg-green-500' },
                    { stars: 2, count: 1,  color: 'bg-orange-400' },
                    { stars: 1, count: 0,  color: 'bg-red-500' },
                  ].map((row) => {
                    const total = 59; // Hardcoded based on image
                    const percent = (row.count / total) * 100;
                    
                    return (
                      <div key={row.stars} className="flex items-center gap-3 text-sm">
                        <span className="w-3 font-medium text-gray-700">{row.stars}</span>
                        <Star size={12} fill="#4b5563" className="text-gray-600" />
                        
                        {/* Bar Track */}
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                           {/* Bar Fill */}
                           <div 
                             className={`h-full rounded-full ${row.color}`} 
                             style={{ width: `${percent}%` }}
                           ></div>
                        </div>
                        
                        <span className="w-6 text-right text-gray-400 text-xs">{row.count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;