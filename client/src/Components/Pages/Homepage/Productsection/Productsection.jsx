// src/Components/Pages/Homepage/ProductSection.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api'; // Ensure you have your API setup
import ProductCard from '../../Shop/ProductCard'; // Import the card we created earlier

const ProductSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/products');

        // 1. Filter for active products
        // 2. Slice to get only the first 8 items
        const featuredProducts = data.data
          .filter(p => p.isActive)
          .slice(0, 8);

        setProducts(featuredProducts);
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return null; // Or a loading skeleton

  return (
    <section className="py-20 bg-[#fdf9f0] flex justify-center w-full">
      <div className="w-full max-w-screen-2xl px-6 md:px-12">

        {/* Header */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-medium text-gray-900 font-serif">
              Our Featured Products
            </h2>
            <p className="text-gray-500 mt-2 font-serif">
              Daily essentials for your routine.
            </p>
          </div>

          {/* Link to full shop */}
          <Link to="/shop" className="hidden font-serif md:block text-sm font-medium text-[#4183cf] hover:underline">
            View collection &rarr;
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            // Reusing the ProductCard ensures the 'Click -> Detail Page' works
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default ProductSection;
