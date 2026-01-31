import React, { useState, useEffect } from "react";
import { Plus, Mail, Shield, Trash2, X, Edit2, Loader2 } from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const { data } = await api.get("/auth/admins");
      if (data.success) {
        setAdmins(data.admins);
      }
    } catch (error) {
      toast.error("Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---

  const openAddModal = () => {
    setFormData({ name: "", email: "", password: "" });
    setIsEditing(false);
    setCurrentAdminId(null);
    setShowModal(true);
  };

  const openEditModal = (admin) => {
    setFormData({ name: admin.name, email: admin.email, password: "" }); // Password empty by default
    setIsEditing(true);
    setCurrentAdminId(admin._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    // CONFIRMATION DIALOG
    if (!window.confirm("Are you sure you want to remove this admin? This action cannot be undone.")) return;

    try {
      await api.delete(`/auth/admin/${id}`);
      toast.success("Admin removed");
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditing) {
        // Update Existing Admin
        await api.put(`/auth/admin/${currentAdminId}`, formData);
        toast.success("Admin updated successfully");
      } else {
        // Create New Admin
        await api.post("/auth/create-admin", formData);
        toast.success("New Admin Added");
      }
      setShowModal(false);
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage admin access and permissions</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <Plus size={18} /> Add New Admin
        </button>
      </div>

      {/* Admin List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">All Administrators</h3>
          <span className="text-xs text-gray-500 bg-white px-2 py-1 border rounded-md">
            Total: {admins.length}
          </span>
        </div>

        {loading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {admins.map((admin) => (
              <div key={admin._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    {admin.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{admin.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Mail size={12}/> {admin.email}</span>
                      <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">
                        <Shield size={10} /> {admin.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(admin)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(admin._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal (Add / Edit) */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-xl shadow-2xl p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  {isEditing ? "Edit Admin" : "Add New Admin"}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20}/></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    placeholder="admin@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isEditing ? "New Password (Optional)" : "Password"}
                  </label>
                  <input
                    type="password"
                    required={!isEditing} // Required only when creating
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    placeholder={isEditing ? "Leave blank to keep current" : "••••••••"}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                  {isSubmitting ? "Processing..." : (isEditing ? "Update Admin" : "Create Admin")}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admins;
