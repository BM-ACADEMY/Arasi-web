import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { Upload, Save, Loader2, Layout } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminBanner = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    tagline: '',
    heading: '',
    description: '',
    image: null
  });

  // Fetch existing banner
  useEffect(() => {
    fetchBanner();
  }, []);

  const fetchBanner = async () => {
    try {
      const { data } = await api.get('/banner');
      if (data.banner) {
        setFormData({
          tagline: data.banner.tagline,
          heading: data.banner.heading,
          description: data.banner.description,
          image: null // Don't set file object from URL
        });
        // Construct Image URL
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:5000";
        setPreview(`${baseUrl}/${data.banner.image}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFetching(false);
    }
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
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      const res = await api.post('/banner', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success("Banner Updated Successfully!");
      }
    } catch (error) {
      toast.error("Failed to update banner");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Layout size={24} /> Homepage Banner
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Left: Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Tagline */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Tagline (Small Text)</label>
              <input
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="e.g. 100% Natural & Organic"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Heading */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Main Heading</label>
              <input
                name="heading"
                value={formData.heading}
                onChange={handleChange}
                placeholder="e.g. Experience Nature's Touch"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Short paragraph describing your brand..."
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Banner Image</label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500">Click to upload image</p>
                </div>
                <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
              Update Banner
            </button>
          </form>
        </div>

        {/* Right: Live Preview */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Preview</h3>

           <div className="relative w-full h-[400px] rounded-2xl overflow-hidden bg-slate-900 flex items-center">
              {/* Background Image */}
              {preview ? (
                <img src={preview} alt="Banner Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
              ) : (
                <div className="absolute inset-0 bg-slate-800 flex items-center justify-center text-slate-600">No Image</div>
              )}

              {/* Overlay Content */}
              <div className="relative z-10 px-8 text-center w-full">
                <span className="inline-block py-1 px-3 border border-white/30 rounded-full text-xs font-medium text-white backdrop-blur-sm mb-4">
                  {formData.tagline || "Your Tagline Here"}
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  {formData.heading || "Your Heading Here"}
                </h2>
                <p className="text-slate-200 max-w-lg mx-auto text-sm md:text-base">
                  {formData.description || "Your description will appear here..."}
                </p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default AdminBanner;
