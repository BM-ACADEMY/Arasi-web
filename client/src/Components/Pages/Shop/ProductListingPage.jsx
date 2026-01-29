import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import api from '@/services/api';
import ProductCard from './ProductCard';
import { Loader2, ChevronRight } from "lucide-react";

const ProductListingPage = () => {
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

        if (keyword) {
          setPageTitle(`Results for "${keyword}"`);
          const { data } = await api.get(`/products?keyword=${keyword}`);
          if (data.success) setProducts(data.data);
        } 
        else if (subCategorySlug) {
          const subRes = await api.get(`/subcategories/slug/${subCategorySlug}`);
          const subCategory = subRes.data.data;
          
          if (subCategory) {
            setPageTitle(subCategory.name);
            const prodRes = await api.get(`/products?subCategory=${subCategory._id}`);
            if (prodRes.data.success) setProducts(prodRes.data.data);
          }
        }
        else {
          setPageTitle("All Products");
          const { data } = await api.get(`/products`);
          if (data.success) setProducts(data.data);
        }
      } catch (error) {
        console.error("Error loading products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [subCategorySlug, keyword]);

  if (loading) {
    return (
      <div className="min-h-screen pt-40 flex justify-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    /* REMOVED flex justify-center to keep content left-aligned */
    <section className="pt-27  md:pt-45 pb-24 bg-gray-50 w-full min-h-screen">
      <div className="w-full max-w-[1400px] px-6 mx-auto">

        {/* Header & Breadcrumbs - Changed items-end to items-start */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-4 border-b border-gray-200 pb-8">
          <div className="text-left"> {/* Added text-left for safety */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4 font-medium">
              <Link to="/" className="hover:text-[#4183cf] transition-colors">Home</Link>
              <ChevronRight size={14} />
              {keyword ? (
                <span className="text-gray-900">Search Results</span>
              ) : (
                <>
                  <Link 
                    to={categorySlug ? `/${categorySlug}` : "/shop"} 
                    className="hover:text-[#4183cf] transition-colors capitalize"
                  >
                    {categorySlug || 'Shop'}
                  </Link>
                  {subCategorySlug && (
                    <>
                      <ChevronRight size={14} />
                      <span className="text-gray-900 capitalize">{subCategorySlug.replace(/-/g, ' ')}</span>
                    </>
                  )}
                </>
              )}
            </nav>

            <h2 className="text-4xl font-bold text-gray-900 tracking-tight font-serif capitalize">
              {pageTitle}
            </h2>
            <p className="text-gray-500 mt-2">
              Showing {products.length} product(s)
            </p>
          </div>
          
          {/* Action Links */}
          <div className="mt-4 md:mt-0">
            {keyword ? (
              <Link to="/shop" className="text-sm font-semibold text-[#4183cf] hover:underline">
                View All Products
              </Link>
            ) : categorySlug ? (
              <Link to="/" className="text-sm font-semibold text-[#4183cf] hover:underline">
                &larr; Back to Home
              </Link>
            ) : null}
          </div>
        </div>

        {/* Product Grid - grid items naturally align left */}
        {products.length === 0 ? (
          <div className="text-left py-20 px-10 bg-white rounded-xl border border-dashed border-gray-300">
            <h3 className="text-xl text-gray-400 font-serif">No products found.</h3>
            <p className="text-gray-400 mt-2">Try checking your spelling or using different keywords.</p>
            <Link to="/shop" className="mt-6 inline-block bg-[#4183cf] text-white px-6 py-2 rounded-lg">
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
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