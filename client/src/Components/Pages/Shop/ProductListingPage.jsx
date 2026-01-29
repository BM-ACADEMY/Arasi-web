import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import api from '@/services/api';
import ProductCard from './ProductCard';
import { Loader2 } from "lucide-react";

const ProductListingPage = () => {
  // Get route params (for categories) and query params (for search)
  const { categorySlug, subCategorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword");

  const [products, setProducts] = useState([]);
  const [pageTitle, setPageTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setProducts([]);

        // CASE 1: SEARCH MODE
        if (keyword) {
          setPageTitle(`Results for "${keyword}"`);
          const { data } = await api.get(`/products?keyword=${keyword}`);
          if (data.success) {
            setProducts(data.data);
          }
        } 
        // CASE 2: SUBCATEGORY MODE
        else if (subCategorySlug) {
          // 1. Get SubCategory ID from Slug
          const subRes = await api.get(`/subcategories/slug/${subCategorySlug}`);
          const subCategory = subRes.data.data;
          
          if (subCategory) {
            setPageTitle(subCategory.name);
            // 2. Get Products by ID
            const prodRes = await api.get(`/products?subCategory=${subCategory._id}`);
            if (prodRes.data.success) {
              setProducts(prodRes.data.data);
            }
          }
        }
        // CASE 3: FALLBACK (SHOW ALL)
        else {
             setPageTitle("All Products");
             const { data } = await api.get(`/products`);
             if (data.success) {
                setProducts(data.data);
             }
        }

      } catch (error) {
        console.error("Error loading products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [subCategorySlug, keyword]); // Re-run when these change

  if (loading) {
      return (
        <div className="min-h-screen pt-32 flex justify-center">
            <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      );
  }

  return (
    <section className="py-24 bg-gray-50 flex justify-center w-full min-h-screen">
      <div className="w-full max-w-[1400px] px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight font-serif capitalize">
              {pageTitle}
            </h2>
            <p className="text-gray-500 mt-2 font-serif">
              {keyword 
                ? `Found ${products.length} product(s)` 
                : `Home / ${categorySlug || 'Shop'} / ${subCategorySlug || ''}`
              }
            </p>
          </div>
          
          {/* Show "Back" link only if in category mode */}
          {!keyword && categorySlug && (
            <Link to={`/${categorySlug}`} className="hidden md:block text-sm font-semibold text-[#4183cf] hover:underline">
                &larr; Back to Categories
            </Link>
          )}
          {/* Show "View All" if in search mode */}
          {keyword && (
             <Link to="/shop" className="hidden md:block text-sm font-semibold text-[#4183cf] hover:underline">
                View All Products
            </Link>
          )}
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
             <h3 className="text-xl text-gray-400">No products found.</h3>
             <p className="text-gray-400 mt-2">Try checking your spelling or using different keywords.</p>
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