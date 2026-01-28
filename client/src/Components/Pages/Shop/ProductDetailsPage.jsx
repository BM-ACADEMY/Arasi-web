// src/Components/Pages/Shop/ProductDetailsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/services/api';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, ChevronRight, Minus, Plus, Truck, ShieldCheck } from 'lucide-react';

const ProductDetailsPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

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

  if (loading) return <div className="pt-32 text-center">Loading...</div>;
  if (!product) return <div className="pt-32 text-center">Product not found.</div>;

  const currentPrice = product.variants?.[0]?.price || 0;
  const originalPrice = product.originalPrice || (currentPrice * 1.2).toFixed(0);

  // FIX: Use images directly
  const mainImage = product.images?.[selectedImage] || "https://via.placeholder.com/600";

  return (
    <div className="min-h-screen bg-white pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-6">

        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-8 font-medium">
          <Link to="/" className="hover:text-black">Home</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="capitalize">{product.category?.name || 'Shop'}</span>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-black line-clamp-1">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* LEFT: Image Gallery */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="aspect-square bg-gray-50 rounded-[2.5rem] overflow-hidden relative"
            >
               <img
                 src={mainImage}
                 alt={product.name}
                 className="w-full h-full object-cover mix-blend-multiply"
               />
            </motion.div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 flex-shrink-0 rounded-2xl bg-gray-50 border-2 transition-all overflow-hidden ${
                      selectedImage === idx ? 'border-[#4183cf]' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover mix-blend-multiply"
                      alt="thumbnail"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Info */}
          <div className="flex flex-col">
            <h1 className="text-4xl md:text-5xl font-serif font-medium text-gray-900 leading-tight mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => <Star key={s} size={16} className="fill-yellow-400 text-yellow-400" />)}
              </div>
              <span className="text-sm text-gray-500 underline decoration-gray-300 underline-offset-4">
                12 Reviews
              </span>
            </div>

            <p className="text-gray-500 leading-relaxed mb-8">
              {product.description || "Experience premium quality with this carefully crafted product. Designed for daily use and exceptional performance."}
            </p>

            {/* Price Block */}
            <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-2xl w-fit">
              <span className="text-3xl font-bold text-gray-900">₹{currentPrice}</span>
              <span className="text-lg text-gray-400 line-through">₹{originalPrice}</span>
              <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-md">
                SAVE 20%
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10 border-b border-gray-100 pb-10">
              <div className="flex items-center justify-between bg-white border border-gray-200 rounded-full w-full sm:w-40 px-4 py-3">
                <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="text-gray-400 hover:text-black">
                  <Minus size={18} />
                </button>
                <span className="font-bold text-lg">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="text-gray-400 hover:text-black">
                  <Plus size={18} />
                </button>
              </div>

              <button className="flex-1 bg-[#4183cf] text-white rounded-full font-bold text-lg hover:bg-[#326bb3] transition-colors py-3 px-8 shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
                <ShoppingCart size={20} />
                Add to Cart
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <div className="p-2 bg-blue-50 text-[#4183cf] rounded-full">
                  <Truck size={18} />
                </div>
                Free Shipping
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <div className="p-2 bg-green-50 text-green-600 rounded-full">
                  <ShieldCheck size={18} />
                </div>
                Secure Checkout
              </div>
            </div>

            {/* Details Accordion / Tabs */}
            <div className="border-t border-gray-100 pt-6">
               {product.details && product.details.map((detail, idx) => (
                 <div key={idx} className="mb-4">
                   <h4 className="font-bold text-gray-900 mb-2">{detail.heading}</h4>
                   <p className="text-sm text-gray-600">{detail.content}</p>
                 </div>
               ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
