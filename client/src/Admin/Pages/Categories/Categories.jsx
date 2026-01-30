import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiX,
  FiImage,
  FiUploadCloud,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
} from "react-icons/fi";
import api from "@/services/api";
import toast from "react-hot-toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

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

  // ─── Search & Pagination Logic ────────────────────────────
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
      toast.error("Only image files are allowed");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File is too large. Maximum size is 5MB.");
      return;
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) return toast.error("Category name is required");
    if (!imageFile && !previewUrl) return toast.error("Category image is mandatory");

    const loadingToast = toast.loading(isEditing ? "Updating..." : "Creating...");

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      if (imageFile) formData.append("image", imageFile);

      if (isEditing) {
        await api.put(`/categories/${currentId}`, formData);
        toast.success("Category updated successfully", { id: loadingToast });
      } else {
        await api.post("/categories", formData);
        toast.success("Category created successfully", { id: loadingToast });
      }

      fetchCategories();
      resetForm();
    } catch (err) {
      const msg = err.response?.data?.message || "Operation failed";
      toast.error(msg, { id: loadingToast });
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const toastId = toast.loading("Deleting...");
    try {
      await api.delete(`/categories/${deleteId}`);
      toast.success("Category deleted", { id: toastId });
      fetchCategories();
    } catch (err) {
      toast.error("Could not delete category", { id: toastId });
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen  font-sans text-slate-800 pb-12">
      {/* ─── Header Section (Fixed) ────────────────────────── */}
      <header className="bg-white border-b border-slate-200  top-0 z-50 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">Categories</h1>
            <p className="text-sm text-slate-500 hidden sm:block truncate">Manage your product catalog structure</p>
          </div>

          <button
            onClick={openAddModal}
            className="shrink-0 group relative inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm sm:text-base font-semibold rounded-full shadow-md shadow-indigo-200 transition-all duration-200 active:scale-95"
          >
            <FiPlus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            <span className="whitespace-nowrap">New Category</span>
          </button>
        </div>
      </header>

      {/* ─── Main Content ────────────────────────────────── */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">

          {/* Toolbar */}
          <div className="px-6 py-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
               {filteredCategories.length} Total Records
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider w-24 text-center">Preview</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Details</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                   <tr><td colSpan={3} className="py-20 text-center text-slate-500 font-medium italic">Loading categories...</td></tr>
                ) : currentItems.length === 0 ? (
                  <tr><td colSpan={3} className="py-24 text-center">
                    <FiImage className="mx-auto text-slate-300 mb-2" size={40} />
                    <p className="text-slate-500">No categories match your criteria.</p>
                  </td></tr>
                ) : (
                  currentItems.map((cat, index) => (
                    <motion.tr key={cat._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="h-14 w-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm mx-auto">
                          {cat.image ? (
                            <img src={cat.image} alt={cat.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : <FiImage className="m-auto text-slate-300" />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{cat.name}</p>
                        <p className="text-xs font-mono text-slate-400 italic">/{cat.slug}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditModal(cat)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><FiEdit3 size={18} /></button>
                          <button onClick={() => { setDeleteId(cat._id); setIsDeleteModalOpen(true); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><FiTrash2 size={18} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filteredCategories.length > 0 && (
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-sm text-slate-500">Page {currentPage} of {totalPages}</span>
              <div className="flex items-center gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition shadow-sm"><FiChevronLeft size={18}/></button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition shadow-sm"><FiChevronRight size={18}/></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Add/Edit Modal ────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={resetForm} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl pointer-events-auto overflow-hidden">
                <div className="px-6 py-5 border-b flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-800">{isEditing ? "Edit Category" : "New Category"}</h2>
                  <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-full transition"><FiX size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Name *</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium" placeholder="e.g. Skin Care" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Image *</label>
                    <label className={`relative flex flex-col items-center justify-center w-full h-44 rounded-xl border-2 border-dashed cursor-pointer transition-all ${previewUrl ? 'border-indigo-300 bg-indigo-50/20' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                      {previewUrl ? (
                        <>
                          <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-lg" />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg text-white font-bold text-sm">Change Image</div>
                        </>
                      ) : (
                        <div className="text-center">
                          <FiUploadCloud className="mx-auto text-indigo-500 mb-2" size={24} />
                          <p className="text-xs font-semibold text-slate-600">Click to upload (Max 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={resetForm} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-all">Cancel</button>
                    <button type="submit" className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-200 transition-all">Save Category</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Delete Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteModalOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80]" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 pointer-events-auto text-center">
                <FiAlertCircle className="mx-auto text-red-500 mb-4" size={40} />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Permanently?</h3>
                <p className="text-slate-500 text-sm mb-6">This category will be removed forever. This action is irreversible.</p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setIsDeleteModalOpen(false)} className="py-2.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                  <button onClick={confirmDelete} className="py-2.5 font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-100">Delete</button>
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
