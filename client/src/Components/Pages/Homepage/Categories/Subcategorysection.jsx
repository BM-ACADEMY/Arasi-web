// src/Components/Pages/Shop/SubCategoryPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/services/api';
import { motion } from 'framer-motion';

const SubCategoryPage = () => {
  const { categorySlug } = useParams();
  const [subCategories, setSubCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Get Category Details by Slug to get the ID
        const catRes = await api.get(`/categories/slug/${categorySlug}`);
        const category = catRes.data.data;
        setCategoryName(category.name);

        // 2. Get SubCategories using the Category ID
        // Note: Your controller allows filtering by ?category=ID
        const subRes = await api.get(`/subcategories?category=${category._id}`);
        setSubCategories(subRes.data.data);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug) fetchData();
  }, [categorySlug]);

  if (loading) return <div className="pt-32 text-center">Loading...</div>;

  return (
    <div className="pt-28 pb-16 px-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-serif text-gray-900 mb-8">{categoryName} Collection</h1>
      
      {subCategories.length === 0 ? (
        <p>No subcategories found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {subCategories.map((sub) => (
            // Link structure: /categorySlug/subCategorySlug
            <Link to={`/${categorySlug}/${sub.slug}`} key={sub._id}>
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-gray-50 rounded-xl p-4 text-center cursor-pointer hover:shadow-lg transition-all"
              >
                <div className="h-40 w-full mb-4 overflow-hidden rounded-lg bg-white">
                  <img 
                    src={sub.image || "https://via.placeholder.com/150"} 
                    alt={sub.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-medium text-lg text-gray-800">{sub.name}</h3>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubCategoryPage;