import React, { useState, useEffect } from "react";
// Added Loader2 for the animation
import { Plus, Trash2, Edit2, Share2, Save, X, Loader2 } from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

const SocialMedia = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  // New state to track button submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    platform: "Instagram",
    url: "",
  });

  const platforms = ["Instagram", "Facebook", "Twitter", "Youtube"];

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const { data } = await api.get("/social-media");
      if (data.success) setLinks(data.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch links");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Start loading animation
    try {
      if (isEditing) {
        await api.put(`/social-media/${currentId}`, formData);
        toast.success("Link updated successfully");
      } else {
        await api.post("/social-media", formData);
        toast.success("Link added successfully");
      }
      resetForm();
      fetchLinks();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false); // Stop loading animation
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this link?")) {
      try {
        await api.delete(`/social-media/${id}`);
        toast.success("Link removed");
        fetchLinks();
      } catch (error) {
        toast.error("Failed to delete link");
      }
    }
  };

  const handleEdit = (link) => {
    setIsEditing(true);
    setCurrentId(link._id);
    setFormData({ platform: link.platform, url: link.url });
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ platform: "Instagram", url: "" });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Share2 className="text-blue-600" /> Social Media Links
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">
              {isEditing ? "Edit Link" : "Add New Link"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={isEditing || isSubmitting}
                >
                  {platforms.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting} // Disable button while loading
                  className="flex-1 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      {/* Spinning Loader Animation */}
                      <Loader2 size={18} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      {isEditing ? <Save size={18} /> : <Plus size={18} />}
                      <span>{isEditing ? "Update" : "Add Link"}</span>
                    </>
                  )}
                </button>
                
                {isEditing && !isSubmitting && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-100 text-gray-600 py-2 px-4 rounded-md hover:bg-gray-200"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100 font-medium text-gray-700">
              Active Links
            </div>
            
            {loading ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
                 <Loader2 size={24} className="animate-spin text-blue-600" />
                 Loading links...
              </div>
            ) : links.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No social links added yet.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {links.map((link) => (
                  <div key={link._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                        {link.platform[0]}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{link.platform}</h4>
                        <a href={link.url} target="_blank" rel="noreferrer" className="text-sm text-gray-500 hover:text-blue-600 truncate max-w-xs block">
                          {link.url}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(link)}
                        disabled={isSubmitting}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all disabled:opacity-30"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(link._id)}
                        disabled={isSubmitting}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all disabled:opacity-30"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SocialMedia;