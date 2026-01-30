import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import {
  Plus, Edit2, Trash2, X, Save, Loader2,
  Image as ImageIcon, UploadCloud, LayoutTemplate,
  MoreHorizontal, Type, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// --- COMPONENT: IMAGE UPLOADER ---
const ImageUploader = ({ preview, onImageChange }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700">Banner Image</label>
      <div className="relative group">
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-indigo-500 transition-all">

          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-80 group-hover:opacity-60 transition-opacity"
            />
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                <UploadCloud className="w-6 h-6 text-indigo-500" />
              </div>
              <p className="mb-1 text-sm text-gray-500"><span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-gray-400">1920x600px (Max 5MB)</p>
            </div>
          )}

          {/* Hidden Input */}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={onImageChange}
          />

          {/* Overlay on hover when image exists */}
          {preview && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <span className="bg-black/70 text-white text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-2">
                <Edit2 size={12} /> Change Image
              </span>
            </div>
          )}
        </label>
      </div>
    </div>
  );
};

// --- COMPONENT: BANNER CARD ---
const BannerCard = ({ banner, onEdit, onDelete, baseUrl }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
  >
    {/* Image Area */}
    <div className="relative aspect-[21/9] bg-gray-100 overflow-hidden">
      <img
        src={`${baseUrl}/${banner.image}`}
        alt={banner.heading}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      {/* Overlay Gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

      {/* Absolute Actions */}
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(banner)}
          className="p-2 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow-sm backdrop-blur-sm transition-all hover:text-indigo-600"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={() => onDelete(banner._id)}
          className="p-2 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow-sm backdrop-blur-sm transition-all hover:text-red-600"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>

    {/* Content Area */}
    <div className="p-5">
      <div className="mb-2">
        <span className="inline-block px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold tracking-wide uppercase">
          {banner.tagline || "No Tagline"}
        </span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{banner.heading}</h3>
      <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
        {banner.description}
      </p>
    </div>
  </motion.div>
);

// --- MAIN PAGE ---
const AdminBanner = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    tagline: '', heading: '', description: '', image: null
  });
  const [preview, setPreview] = useState(null);

  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:5000";

  // --- Fetch Banners ---
  const fetchBanners = async () => {
    try {
      const { data } = await api.get('/banner');
      if (data.success) setBanners(data.banners);
    } catch (error) {
      console.error("Error fetching banners", error);
      toast.error("Could not load banners");
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  // --- Handlers ---
  const handleOpenDrawer = (banner = null) => {
    if (banner) {
      setEditMode(true);
      setCurrentId(banner._id);
      setFormData({
        tagline: banner.tagline,
        heading: banner.heading,
        description: banner.description,
        image: null
      });
      setPreview(`${baseUrl}/${banner.image}`);
    } else {
      setEditMode(false);
      setCurrentId(null);
      setFormData({ tagline: '', heading: '', description: '', image: null });
      setPreview(null);
    }
    setIsDrawerOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('tagline', formData.tagline);
    data.append('heading', formData.heading);
    data.append('description', formData.description);
    if (formData.image) data.append('image', formData.image);

    try {
      const endpoint = editMode ? `/banner/${currentId}` : '/banner';
      const method = editMode ? api.put : api.post;

      const res = await method(endpoint, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success(editMode ? "Banner Updated!" : "Banner Created!");
        fetchBanners();
        setIsDrawerOpen(false);
      }
    } catch (error) {
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this banner? This action cannot be undone.")) return;
    try {
      await api.delete(`/banner/${id}`);
      toast.success("Banner deleted");
      setBanners(prev => prev.filter(b => b._id !== id));
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 pb-20 font-sans">
      <div className="max-w-8xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Store Banners</h1>
            <p className="text-gray-500 text-sm mt-1">Manage the hero slides displayed on your homepage.</p>
          </div>
          <button
            onClick={() => handleOpenDrawer()}
            className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-gray-200 transition-all active:scale-95"
          >
            <Plus size={18} /> Add New Banner
          </button>
        </div>

        {/* Empty State or Grid */}
        {banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white border border-dashed border-gray-300 rounded-2xl">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <LayoutTemplate className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No banners yet</h3>
            <p className="text-gray-500 text-sm mt-1 mb-6">Create your first banner to showcase offers.</p>
            <button onClick={() => handleOpenDrawer()} className="text-indigo-600 font-semibold hover:underline">
              Create Banner
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner) => (
              <BannerCard
                key={banner._id}
                banner={banner}
                onEdit={handleOpenDrawer}
                onDelete={handleDelete}
                baseUrl={baseUrl}
              />
            ))}
          </div>
        )}
      </div>

      {/* DRAWER FORM */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-900">
                  {editMode ? "Edit Banner" : "New Banner"}
                </h2>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Form */}
              <div className="flex-1 overflow-y-auto p-6">
                <form id="bannerForm" onSubmit={handleSubmit} className="space-y-6">

                  <ImageUploader preview={preview} onImageChange={handleImageChange} />

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                        <Type size={16} className="text-gray-400" /> Tagline
                      </label>
                      <input
                        name="tagline"
                        value={formData.tagline}
                        onChange={handleChange}
                        placeholder="e.g. SUMMER SALE"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                        <LayoutTemplate size={16} className="text-gray-400" /> Heading
                      </label>
                      <input
                        name="heading"
                        value={formData.heading}
                        onChange={handleChange}
                        placeholder="e.g. Up to 50% Off"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                        <FileText size={16} className="text-gray-400" /> Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Write a catchy description..."
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm resize-none"
                        required
                      />
                    </div>
                  </div>
                </form>
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <button
                  form="bannerForm"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2 shadow-lg shadow-gray-200"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                  {editMode ? "Update Changes" : "Create Banner"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBanner;
