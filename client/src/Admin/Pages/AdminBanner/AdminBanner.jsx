import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { Plus, Edit, Trash2, X, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminBanner = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    tagline: '',
    heading: '',
    description: '',
    image: null
  });
  const [preview, setPreview] = useState(null);

  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '');

  // --- Fetch Banners ---
  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data } = await api.get('/banner');
      if (data.success) {
        setBanners(data.banners);
      }
    } catch (error) {
      console.error("Error fetching banners", error);
    }
  };

  // --- Handlers ---
  const handleOpenModal = (banner = null) => {
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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPreview(null);
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

  // --- Submit (Create or Update) ---
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
      let res;
      if (editMode) {
        // Update
        res = await api.put(`/banner/${currentId}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Create
        res = await api.post('/banner', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data.success) {
        toast.success(editMode ? "Banner Updated!" : "Banner Created!");
        fetchBanners(); // Refresh list
        handleCloseModal();
      }
    } catch (error) {
      console.error(error);
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  // --- Delete ---
  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this banner?")) return;

    try {
      await api.delete(`/banner/${id}`);
      toast.success("Banner deleted");
      fetchBanners();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Banner Management</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition"
        >
          <Plus size={20} /> Add Banner
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-700 font-semibold text-sm">
            <tr>
              <th className="p-4 border-b">Image</th>
              <th className="p-4 border-b">Heading</th>
              <th className="p-4 border-b">Tagline</th>
              <th className="p-4 border-b text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {banners.length > 0 ? (
              banners.map((banner) => (
                <tr key={banner._id} className="hover:bg-slate-50 border-b last:border-0">
                  <td className="p-4">
                    <img 
                      src={`${baseUrl}/${banner.image}`} 
                      alt="Banner" 
                      className="w-24 h-16 object-cover rounded-md border"
                    />
                  </td>
                  <td className="p-4 font-medium text-slate-800">{banner.heading}</td>
                  <td className="p-4 text-slate-500">{banner.tagline}</td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => handleOpenModal(banner)}
                      className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-full transition"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(banner._id)}
                      className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-full transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-8 text-center text-slate-500">
                  No banners found. Click "Add Banner" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-xl font-bold text-slate-800">
                {editMode ? "Edit Banner" : "Add New Banner"}
              </h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Tagline */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tagline</label>
                <input
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  placeholder="e.g. Special Offer"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              {/* Heading */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Heading</label>
                <input
                  name="heading"
                  value={formData.heading}
                  onChange={handleChange}
                  placeholder="e.g. Summer Collection"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Banner Image</label>
                <div className="flex gap-4 items-start">
                  {/* Preview Box */}
                  <div className="w-24 h-24 bg-slate-100 rounded-lg border flex items-center justify-center overflow-hidden shrink-0">
                    {preview ? (
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-slate-400" />
                    )}
                  </div>
                  
                  {/* File Input */}
                  <div className="flex-1">
                    <input 
                      type="file" 
                      onChange={handleImageChange} 
                      accept="image/*"
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-slate-400 mt-2">Recommended size: 1920x600px. WebP, PNG or JPG.</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex justify-center items-center gap-2 mt-4"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                {editMode ? "Update Banner" : "Create Banner"}
              </button>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanner;