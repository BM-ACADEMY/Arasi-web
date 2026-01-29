import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiImage,
  FiUpload,
  FiAlertTriangle,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import api from "@/services/api";
import toast from "react-hot-toast";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals & form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // ─── Data Fetching ────────────────────────────────────────
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/categories");
      setCategories(res.data.data || []);
    } catch (err) {
      toast.error("Could not load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ─── Pagination Logic ─────────────────────────────────────
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = categories.slice(startIndex, startIndex + itemsPerPage);

  // ─── Form Handlers ────────────────────────────────────────
  const openAddModal = () => {

    if (categories.length >= 10) {
      toast.error("Limit reached: You can only create up to 10 categories.");
      return; 
    }
    setIsEditing(false);
    setCurrentId(null);
    setName("");
    setImageFile(null);
    setPreviewUrl("");
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setIsEditing(true);
    setCurrentId(cat._id);
    setName(cat.name);
    setPreviewUrl(cat.image || "");
    setImageFile(null);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setName("");
    setImageFile(null);
    setPreviewUrl("");
    setIsModalOpen(false);
    setIsEditing(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Category name is required");

    const loadingToast = toast.loading(isEditing ? "Updating..." : "Creating...");

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      if (imageFile) formData.append("image", imageFile);

      if (isEditing) {
        await api.put(`/categories/${currentId}`, formData);
        toast.success("Category updated", { id: loadingToast });
      } else {
        await api.post("/categories", formData);
        toast.success("Category created", { id: loadingToast });
      }

      fetchCategories();
      resetForm();
    } catch (err) {
      const msg = err.response?.data?.message || "Operation failed";
      toast.error(msg, { id: loadingToast });
    }
  };

  // ─── Delete ───────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteId) return;

    const toastId = toast.loading("Deleting...");

    try {
      await api.delete(`/categories/${deleteId}`);
      toast.success("Category deleted", { id: toastId });

      // Smart page adjustment
      if (currentItems.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      }
      fetchCategories();
    } catch (err) {
      const msg = err.response?.data?.message || "Could not delete category";
      toast.error(msg, { id: toastId });
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/40 pb-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Categories</h1>
            <p className="mt-1 text-gray-600">Organize your products efficiently</p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-all duration-200 active:scale-[0.98]"
          >
            <FiPlus size={18} />
            Add Category
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow border border-gray-100/80 overflow-hidden">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-gray-500">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-600"></div>
                      <p className="mt-3">Loading categories...</p>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <FiImage className="text-gray-400" size={28} />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">No categories yet</h3>
                      <p className="mt-1 text-gray-500">Create your first category to get started.</p>
                      <button
                        onClick={openAddModal}
                        className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium"
                      >
                        <FiPlus size={16} /> Add Category
                      </button>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((cat) => (
                    <motion.tr
                      key={cat._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group hover:bg-indigo-50/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
                          {cat.image ? (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <FiImage className="text-gray-300" size={20} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{cat.name}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm font-mono">{cat.slug}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Edit"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteId(cat._id);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination & Rows selector */}
          {!loading && categories.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-gray-600">Rows per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {[5, 10, 15, 25, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-gray-600 whitespace-nowrap">
                  {startIndex + 1}–{Math.min(startIndex + itemsPerPage, categories.length)} of {categories.length}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border disabled:opacity-40 hover:bg-white transition"
                  >
                    <FiChevronLeft size={18} />
                  </button>

                  <span className="px-3 py-1.5 font-medium text-gray-800">
                    {currentPage}
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border disabled:opacity-40 hover:bg-white transition"
                  >
                    <FiChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Add/Edit Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto overflow-hidden">
                <div className="px-6 py-5 border-b flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {isEditing ? "Edit Category" : "New Category"}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                  >
                    <FiX size={22} className="text-gray-600" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                      placeholder="e.g. Organic Skincare"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Category Image
                    </label>

                    <div className="flex items-start gap-4">
                      <div className="shrink-0 relative group">
                        <div className="h-24 w-24 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden flex items-center justify-center">
                          {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                          ) : (
                            <FiUpload className="text-gray-400" size={28} />
                          )}
                        </div>

                        {previewUrl && (
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition"
                          >
                            <FiX size={14} />
                          </button>
                        )}
                      </div>

                      <div className="flex-1">
                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition">
                          <FiUpload size={16} />
                          {previewUrl ? "Change image" : "Upload image"}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                        <p className="mt-2 text-xs text-gray-500">
                          PNG, JPG, WebP • max 2MB recommended
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 py-2.5 px-5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition active:scale-[0.98]"
                    >
                      {isEditing ? "Save Changes" : "Create Category"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-100 flex items-center justify-center">
                  <FiAlertTriangle className="text-red-600" size={28} />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Category?</h3>
                <p className="text-gray-600 mb-8">
                  This action cannot be undone. Products in this category may become uncategorized.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 py-2.5 px-5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Categories;