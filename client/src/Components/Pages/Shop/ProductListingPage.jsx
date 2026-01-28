// src/Components/Pages/Shop/ProductListingPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/services/api';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';

const ProductListingPage = () => {
  const { categorySlug, subCategorySlug } = useParams();
  const [products, setProducts] = useState([]);
  const [subCategoryName, setSubCategoryName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Resolve SubCategory
        const subRes = await api.get(`/subcategories/slug/${subCategorySlug}`);
        const subCategory = subRes.data.data;
        setSubCategoryName(subCategory.name);

        // Fetch Products
        const prodRes = await api.get(`/products?subCategory=${subCategory._id}`);
        setProducts(prodRes.data.data);
      } catch (error) {
        console.error("Error loading products", error);
      } finally {
        setLoading(false);
      }
    };

    if (subCategorySlug) fetchProducts();
  }, [subCategorySlug]);

  if (loading) return <div className="pt-32 text-center">Loading Products...</div>;

  return (
    <section className="py-24 bg-gray-50 flex justify-center w-full min-h-screen">
      <div className="w-full max-w-[1400px] px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight font-serif capitalize">
              {subCategoryName}
            </h2>
            <p className="text-gray-500 mt-2 font-serif">
              Home / {categorySlug} / {subCategorySlug}
            </p>
          </div>
          <Link to={`/${categorySlug}`} className="hidden md:block text-sm font-semibold text-[#4183cf] hover:underline">
            &larr; Back to Categories
          </Link>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
           <div className="text-center py-20">
             <h3 className="text-xl text-gray-400">No products found in this category.</h3>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductListingPage;
