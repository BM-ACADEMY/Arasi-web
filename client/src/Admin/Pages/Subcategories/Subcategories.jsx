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
  FiFilter,
} from "react-icons/fi";
import api from "@/services/api";
import toast from "react-hot-toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const Subcategories = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]); // Parent Categories
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [name, setName] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // ─── Data Fetching ────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const [subRes, catRes] = await Promise.all([
        api.get("/subcategories"),
        api.get("/categories"),
      ]);
      setSubCategories(subRes.data.data || []);
      setCategories(catRes.data.data || []);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ─── Search & Pagination Logic ────────────────────────────
  const filteredData = useMemo(() => {
    return subCategories.filter((sub) => {
      const matchesSearch =
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.category?.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        filterCategory === "all" || sub.category?._id === filterCategory;

      return matchesSearch && matchesFilter;
    });
  }, [subCategories, searchQuery, filterCategory]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory]);

  // ─── Handlers ─────────────────────────────────────────────
  const openModal = (subCat = null) => {
    if (subCat) {
      setIsEditing(true);
      setCurrentId(subCat._id);
      setName(subCat.name);
      setParentCategoryId(subCat.category?._id || "");
      setPreviewUrl(subCat.image || "");
      setImageFile(null);
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setName("");
      setParentCategoryId("");
      setPreviewUrl("");
      setImageFile(null);
    }
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setName("");
    setParentCategoryId("");
    setImageFile(null);
    setPreviewUrl("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return toast.error("Only image files are allowed");
    if (file.size > MAX_FILE_SIZE) return toast.error("File is too large. Max 5MB.");

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name is required");
    if (!parentCategoryId) return toast.error("Parent category is required");

    // Logic: Limit check (Max 5 subcategories per parent)
    if (!isEditing) {
      const count = subCategories.filter((sub) => sub.category?._id === parentCategoryId).length;
      if (count >= 5) return toast.error("Limit reached: This category already has 5 subcategories.");
    }

    const loadingToast = toast.loading(isEditing ? "Updating..." : "Creating...");
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", parentCategoryId);
      if (imageFile) formData.append("image", imageFile);

      if (isEditing) {
        await api.put(`/subcategories/${currentId}`, formData);
        toast.success("Subcategory updated", { id: loadingToast });
      } else {
        await api.post("/subcategories", formData);
        toast.success("Subcategory created", { id: loadingToast });
      }
      fetchData();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed", { id: loadingToast });
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const toastId = toast.loading("Deleting...");
    try {
      await api.delete(`/subcategories/${deleteId}`);
      toast.success("Deleted successfully", { id: toastId });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed", { id: toastId });
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12">
      {/* ─── Header (Sticky) ───────────────────────────────── */}
      <header className="bg-white border-b border-slate-200  top-0 z-50 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">Subcategories</h1>
            <p className="text-sm text-slate-500 hidden sm:block truncate">Manage specific product types under main categories</p>
          </div>

          <button
            onClick={() => openModal()}
            className="shrink-0 group relative inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm sm:text-base font-semibold rounded-full shadow-md shadow-indigo-200 transition-all duration-200 active:scale-95"
          >
            <FiPlus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            <span className="whitespace-nowrap">Add Subcategory</span>
          </button>
        </div>
      </header>

      {/* ─── Main Content ──────────────────────────────────── */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">

          {/* Toolbar (Search & Filter) */}
          <div className="px-6 py-5 border-b border-slate-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 w-full sm:w-64 focus-within:ring-1 focus-within:ring-indigo-100 transition-all">
                <FiSearch />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search subcategories..."
                  className="bg-transparent border-none outline-none text-sm text-slate-700 w-full placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
               {filteredData.length} Total Records
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider w-24 text-center">Image</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Subcategory Info</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Parent Category</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={4} className="py-20 text-center text-slate-500">Loading data...</td></tr>
                ) : currentItems.length === 0 ? (
                  <tr><td colSpan={4} className="py-24 text-center">
                    <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                        <FiSearch className="text-slate-300" size={24} />
                    </div>
                    <p className="text-slate-500">No subcategories found matching your filters.</p>
                  </td></tr>
                ) : (
                  currentItems.map((sub, index) => (
                    <motion.tr key={sub._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm mx-auto">
                          {sub.image ? (
                            <img src={sub.image} alt={sub.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : <FiImage className="m-auto text-slate-300" />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{sub.name}</p>
                        <p className="text-xs font-mono text-slate-400">/{sub.slug}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {sub.category?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openModal(sub)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><FiEdit3 size={18} /></button>
                          <button onClick={() => { setDeleteId(sub._id); setIsDeleteModalOpen(true); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><FiTrash2 size={18} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filteredData.length > 0 && (
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
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]">

                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                  <h2 className="text-xl font-bold text-slate-800">{isEditing ? "Edit Subcategory" : "New Subcategory"}</h2>
                  <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-full transition"><FiX size={20} className="text-slate-500" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
                  {/* Parent Category Select */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Parent Category <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select
                        value={parentCategoryId}
                        onChange={(e) => setParentCategoryId(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none transition appearance-none font-medium text-slate-700"
                        required
                      >
                        <option value="">-- Select Parent --</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500">
                        <FiChevronLeft className="-rotate-90" />
                      </div>
                    </div>
                    {!isEditing && <p className="text-xs text-slate-500 mt-1 ml-1">Limit: Max 5 subcategories per parent.</p>}
                  </div>

                  {/* Name Input */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Subcategory Name <span className="text-red-500">*</span></label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none transition placeholder:text-slate-400 font-medium" placeholder="e.g. Lavender Soap" required />
                  </div>

                  {/* Image Dropzone */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Image</label>
                    <label className={`relative flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed cursor-pointer transition-all overflow-hidden ${previewUrl ? 'border-indigo-300 bg-indigo-50/20' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                      {previewUrl ? (
                        <>
                          <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                             <span className="bg-white/90 text-slate-800 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2"><FiUploadCloud/> Change</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <FiUploadCloud className="mx-auto text-indigo-400 mb-2" size={24} />
                          <p className="text-xs font-semibold text-slate-600">Click to upload (Max 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </form>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                  <button type="button" onClick={resetForm} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-all">Cancel</button>
                  <button onClick={handleSubmit} className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all">Save</button>
                </div>

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
                <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><FiAlertCircle size={28} /></div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Subcategory?</h3>
                <p className="text-slate-500 text-sm mb-6">This action cannot be undone. Products in this subcategory may lose their filtering.</p>
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

export default Subcategories;
