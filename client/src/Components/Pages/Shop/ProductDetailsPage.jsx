import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import toast from 'react-hot-toast';
import ProductCard from './ProductCard'; // <--- IMPORT THIS
import {
  Star, ShoppingBag, ChevronRight, Minus, Plus,
  Truck, ShieldCheck, Share2, ChevronDown, ChevronUp
} from 'lucide-react';

const ProductDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]); // <--- NEW STATE
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Interaction State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Cart State
  const [isAdded, setIsAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Inject Font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  // Fetch Product Data & Related Products
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true); // Reset loading on slug change
        const { data } = await api.get(`/products/slug/${slug}`);
        
        if (data.success) {
          const currentProduct = data.data;
          setProduct(currentProduct);
          
          // Reset interaction states when product changes
          setSelectedImageIndex(0);
          setSelectedVariantIndex(0);
          setQuantity(1);
          setIsAdded(false);

          // Fetch associated data
          fetchReviews(currentProduct._id);
          fetchRelatedProducts(currentProduct);
        }
      } catch (error) {
        console.error("Error fetching product", error);
        toast.error("Product not found");
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProduct();
  }, [slug]);

  // --- NEW FUNCTION: Fetch Related Products ---
  const fetchRelatedProducts = async (currentProduct) => {
    try {
      // 1. Determine filter criteria (Prefer SubCategory, fallback to Category)
      // Note: currentProduct.subCategory is an object populated with { _id, name }
      let query = "";
      if (currentProduct.subCategory?._id) {
        query = `subCategory=${currentProduct.subCategory._id}`;
      } else if (currentProduct.category?._id) {
        query = `category=${currentProduct.category._id}`;
      }

      if (!query) return;

      const { data } = await api.get(`/products?${query}`);

      if (data.success) {
        // 2. Filter out the current product itself & limit to 4 items
        const filtered = data.data
          .filter(p => p._id !== currentProduct._id)
          .slice(0, 4);
        
        setRelatedProducts(filtered);
      }
    } catch (error) {
      console.error("Failed to fetch related products", error);
    }
  };
  // ---------------------------------------------

  const fetchReviews = async (productId) => {
    try {
      const { data } = await api.get(`/reviews/${productId}`);
      if (data.success) setReviews(data.data);
    } catch (error) {
      console.error("Error fetching reviews", error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to write a review");
      navigate("/login");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setSubmittingReview(true);
    try {
      const { data } = await api.post("/reviews", {
        productId: product._id,
        rating,
        comment
      });

      if (data.success) {
        toast.success("Review submitted!");
        setComment("");
        setRating(5);
        fetchReviews(product._id);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

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

  const handleShare = async () => {
    const shareData = {
      title: product?.name || 'Product',
      text: 'Check out this product!',
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.log('Share canceled', err); }
    } else {
      try { await navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); } catch (err) { }
    }
  };

  const getInitials = (name) => {
    if (!name) return "VB";
    const parts = name.split(" ");
    return parts.length > 1
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = [
      'bg-emerald-100 text-emerald-700',
      'bg-blue-100 text-blue-700',
      'bg-rose-100 text-rose-700',
      'bg-amber-100 text-amber-700',
      'bg-indigo-100 text-indigo-700',
      'bg-purple-100 text-purple-700',
      'bg-teal-100 text-teal-700'
    ];
    if (!name) return colors[0];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };
  // --- LOGIC END ---

  const fontSerif = { fontFamily: '"Playfair Display", serif' };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="h-12 w-12 border border-gray-200 border-t-[#507A58] rounded-full animate-spin"></div>
    </div>
  );

  if (!product) return <div className="pt-32 text-center font-serif text-xl">Product not found.</div>;

  const images = product.images && product.images.length > 0 ? product.images : ["https://via.placeholder.com/600"];
  const activeVariant = product.variants?.[selectedVariantIndex] || {};
  const currentPrice = Number(activeVariant.price) || Number(product.price) || 0;
  const originalPrice = Number(activeVariant.originalPrice) || Number(product.originalPrice) || 0;

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : 0;

  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      starCounts[r.rating] = (starCounts[r.rating] || 0) + 1;
    }
  });

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 font-sans pb-20">
      <div className="h-24 md:h-28"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-[10px] md:text-xs tracking-[0.2em] text-gray-500 mb-10 uppercase font-medium">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight size={10} className="mx-3 text-gray-400" />
          <span className="hover:text-black cursor-pointer">{product.category?.name || 'Shop'}</span>
          <ChevronRight size={10} className="mx-3 text-gray-400" />
          <span className="text-black line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

          {/* Left: Gallery */}
          <div className="lg:col-span-7">
            <div className="flex flex-col-reverse lg:flex-row gap-6 sticky top-32">
              
              {/* Thumbnails */}
              <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto w-full lg:w-24 shrink-0 no-scrollbar justify-start lg:max-h-[550px] pb-2 lg:pb-0 pr-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onMouseEnter={() => setSelectedImageIndex(idx)}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-24 lg:w-full lg:h-32 flex-shrink-0 border transition-all duration-300 rounded-sm overflow-hidden ${
                      selectedImageIndex === idx
                        ? 'border-gray-900 ring-1 ring-gray-900 opacity-100'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`View ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div className="flex-1 bg-white relative aspect-[4/5] lg:aspect-auto lg:h-[700px] border border-gray-100 overflow-hidden group rounded-sm shadow-sm">
                <img src={images[selectedImageIndex]} alt="Main View" className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105" />
                {originalPrice > currentPrice && (
                  <div className="absolute top-4 left-4 bg-[#e11d48] text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest shadow-sm">
                    -{Math.round(((originalPrice - currentPrice) / originalPrice) * 100)}%
                  </div>
                )}
                <button onClick={handleShare} className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-sm hover:bg-white text-gray-700 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0" title="Share">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="mb-6 border-b border-gray-200 pb-6">
              <h2 className="text-xs tracking-widest text-[#507A58] font-bold uppercase mb-3">
                {product.subCategory?.name || "Premium Collection"}
              </h2>
              <h1 style={fontSerif} className="text-3xl md:text-4xl text-gray-900 leading-tight mb-4">
                {product.name}
              </h1>

              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-medium tracking-wide">
                    ₹{currentPrice.toLocaleString()}
                  </span>
                  {originalPrice > currentPrice && (
                    <span className="text-lg text-gray-400 line-through font-light">
                      ₹{originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full">
                  <Star size={14} fill="#fbbf24" className="text-yellow-400" />
                  <span className="text-sm font-semibold text-gray-800">
                    {totalReviews > 0 ? averageRating : "4.8"}
                  </span>
                  <span className="text-xs text-gray-400 border-l border-gray-300 pl-1.5 ml-1">
                    {totalReviews} Reviews
                  </span>
                </div>
              </div>
            </div>

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div className="mb-8">
                <span className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Select Variant</span>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((v, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setSelectedVariantIndex(idx); setIsAdded(false); setQuantity(1); }}
                      className={`min-w-[4rem] px-5 py-2.5 text-sm font-medium transition-all duration-200 border rounded-sm ${
                        selectedVariantIndex === idx
                          ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {v.label || v.unit}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cart Buttons */}
            <div className="mb-8">
              {!isAdded ? (
                <button onClick={handleInitialAdd} className="w-full bg-[#507A58] text-white h-14 hover:bg-[#3e6145] transition-all duration-300 flex items-center justify-center gap-3 shadow-sm hover:shadow-lg uppercase tracking-wider text-sm font-bold rounded-sm">
                  <ShoppingBag size={18} /> Add to Basket
                </button>
              ) : (
                <div className="flex items-center justify-between border border-[#507A58] h-14 px-4 bg-green-50 rounded-sm">
                  <button onClick={handleDecrement} className="p-2 text-[#507A58] hover:bg-white hover:shadow-sm rounded transition-all"><Minus size={18} /></button>
                  <span className="font-bold text-lg text-[#507A58] w-12 text-center">{quantity}</span>
                  <button onClick={handleIncrement} className="p-2 text-[#507A58] hover:bg-white hover:shadow-sm rounded transition-all"><Plus size={18} /></button>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 mb-8 text-xs text-gray-500 tracking-wide uppercase">
              <div className="flex items-center gap-3 py-3 border-t border-b border-gray-100"><Truck size={18} /> <span>Free Shipping</span></div>
              <div className="flex items-center gap-3 py-3 border-t border-b border-gray-100"><ShieldCheck size={18} /> <span>Secure Checkout</span></div>
            </div>

            <div className="mb-10 text-gray-600 leading-relaxed font-light text-sm">
              <h3 className="font-bold text-gray-900 mb-2 uppercase tracking-wider text-xs">Description</h3>
              <p>{product.description}</p>
            </div>

            {/* REVIEWS SECTION */}
            <div className="border-t border-gray-200 pt-10" id="reviews">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-gray-900">Customer Reviews</h3>
                <span className="text-sm text-gray-500">({totalReviews})</span>
              </div>

              {/* Review Summary Bars */}
              <div className="flex flex-col sm:flex-row gap-8 mb-15">
                <div className="flex flex-col justify-center min-w-[120px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-5xl font-bold text-gray-900">{totalReviews > 0 ? averageRating : "0"}</span>
                    <Star size={28} fill="black" className="text-gray-900" />
                  </div>
                  <p className="text-sm text-gray-500">{totalReviews} Ratings & <br />{totalReviews} Reviews</p>
                </div>

                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = starCounts[star];
                    const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-3 text-sm">
                        <span className="w-3 font-medium text-gray-700">{star}</span>
                        <Star size={12} fill="#4b5563" className="text-gray-600" />
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-green-700" style={{ width: `${percent}%` }}></div>
                        </div>
                        <span className="w-6 text-right text-gray-400 text-xs">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Write Review Form */}
              <form onSubmit={handleSubmitReview} className="mb-10 bg-gray-50 p-5 rounded-lg border border-dashed border-gray-300">
                <h4 className="font-bold text-sm mb-3">Add Your Review</h4>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button type="button" key={star} onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                        <Star size={22} fill={star <= rating ? "#1f2937" : "none"} className={star <= rating ? "text-gray-900" : "text-gray-300"} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    className="w-full p-3 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-gray-900 focus:outline-none min-h-[80px]"
                    placeholder="What did you think about this product?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  ></textarea>
                  <button type="submit" disabled={submittingReview} className="self-end bg-gray-900 text-white px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-gray-700 transition-colors">
                    {submittingReview ? "Posting..." : "Post Review"}
                  </button>
                </div>
              </form>

              {/* Reviews List */}
              <div className="relative">
                <div className="space-y-6">
                  {visibleReviews.length > 0 ? (
                    visibleReviews.map((review) => (
                      <div key={review._id} className="pb-6 border-b border-gray-100 last:border-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold tracking-widest shadow-sm ${getAvatarColor(review.user?.name)}`}>
                              {getInitials(review.user?.name)}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-gray-900">{review.user?.name || "Verified Buyer"}</p>
                              <div className="flex gap-0.5 mt-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} size={10} fill={star <= review.rating ? "#1f2937" : "none"} className={star <= review.rating ? "text-gray-900" : "text-gray-300"} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed pl-[52px]">
                          {review.comment}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400 italic text-sm">No reviews yet.</div>
                  )}
                </div>

                {!showAllReviews && reviews.length > 3 && (
                  <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#fafafa] via-[#fafafa]/80 to-transparent pointer-events-none"></div>
                )}
              </div>

              {reviews.length > 3 && (
                <div className="mt-4 text-end relative z-10">
                  <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="inline-flex items-center gap-2 text-sm font-bold pb-1 hover:text-gray-600 transition-colors"
                  >
                    {showAllReviews ? (
                      <>Show Less <ChevronUp size={16} /></>
                    ) : (
                      <>See More Reviews <ChevronDown size={16} /></>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- SECTION: RELATED PRODUCTS --- */}
        {relatedProducts.length > 0 && (
          <div className="mt-32 pt-16 border-t border-gray-200">
            
             <div className="space-y-1 mb-10">
              <h2 className="text-3xl md:text-4xl font-medium text-gray-900 font-serif tracking-tight">
                Similar <span className="text-[#d5242c]">Products</span>
              </h2>
              <div className="flex items-center gap-2">
                <div className="h-[2px] w-6 bg-red-600"></div>
                <p className="text-gray-500 text-sm font-medium tracking-wide uppercase">
                  Daily essentials for your routine
                </p>
              </div>
            </div>


            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetailsPage;