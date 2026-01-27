// src/Components/Pages/Shop/ProductListingPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/services/api';
import ProductCard from './ProductCard';

const ProductListingPage = () => {
  const { categorySlug, subCategorySlug } = useParams();
  const [products, setProducts] = useState([]);
  const [subCategoryName, setSubCategoryName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // 1. Resolve SubCategory Slug -> ID
        const subRes = await api.get(`/subcategories/slug/${subCategorySlug}`);
        const subCategory = subRes.data.data;
        setSubCategoryName(subCategory.name);

        // 2. Fetch Products by SubCategory ID
        // Note: Your controller allows filtering by ?subCategory=ID
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
    <div className="pt-28 pb-16 px-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-gray-900 capitalize">
          {subCategoryName}
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          Home / {categorySlug} / <span className="text-gray-900">{subCategorySlug}</span>
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <h3 className="text-xl text-gray-400">No products found in this category.</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductListingPage;