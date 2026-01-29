import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiPlus, FiEdit2, FiTrash2, FiX, FiImage, FiAlertTriangle, 
  FiChevronLeft, FiChevronRight 
} from "react-icons/fi";
import api from "@/services/api";
import toast from "react-hot-toast";

const Subcategories = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]); // Parent Categories for Dropdown
  const [loading, setLoading] = useState(false);
  
  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // --- Modal States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // --- Form & Action State ---
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  
  // Form Fields
  const [name, setName] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState(""); // Selected Parent ID
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // --- Fetch Data ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const [subRes, catRes] = await Promise.all([
        api.get("/subcategories"),
        api.get("/categories")
      ]);
      setSubCategories(subRes.data.data);
      setCategories(catRes.data.data);
    } catch (err) {
      console.error("Failed to fetch data");
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = subCategories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(subCategories.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- Handlers: Add/Edit ---
  const openModal = (subCat = null) => {
    if (subCat) {
      setIsEditing(true);
      setCurrentId(subCat._id);
      setName(subCat.name);
      setParentCategoryId(subCat.category?._id || ""); // Set Parent ID
      setPreviewUrl(subCat.image);
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

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
  };

  // --- Handlers: Delete ---
  const openDeleteModal = (id) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteId(null);
    setIsDeleteModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const loadingToast = toast.loading("Deleting...");
    try {
      await api.delete(`/subcategories/${deleteId}`);
      toast.success("Subcategory deleted", { id: loadingToast });
      
      if (currentItems.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
      fetchData();
      closeDeleteModal();
    } catch (err) {
      // --- UPDATED ERROR HANDLING ---
      // This will show: "Cannot delete: This subcategory is used in products."
      const errorMessage = err.response?.data?.message || "Delete failed";
      toast.error(errorMessage, { id: loadingToast });
      closeDeleteModal();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!parentCategoryId) {
      toast.error("Please select a parent category");
      return;
    }

    // 1. Prepare Data (Do this first, but don't show toast yet)
    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", parentCategoryId);
    if (imageFile) formData.append("image", imageFile);

    // 2. Check Limit (Max 5 per Category)
    // We check this BEFORE starting the loading toast
    if (!isEditing) {
      const count = subCategories.filter(
        (sub) => sub.category?._id === parentCategoryId
      ).length;

      if (count >= 5) {
        toast.error("Limit reached: This category already has 5 subcategories.");
        return; // Return here. Since toast.loading hasn't run yet, no stuck toast!
      }
    }

    // 3. Start Loading Toast (Only if validation passes)
    const loadingToast = toast.loading("Saving...");

    try {
      if (isEditing) {
        await api.put(`/subcategories/${currentId}`, formData);
        toast.success("Subcategory updated!", { id: loadingToast });
      } else {
        await api.post("/subcategories", formData);
        toast.success("Subcategory created!", { id: loadingToast });
      }
      fetchData();
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed", { id: loadingToast });
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Subcategories</h1>
          <p className="text-sm text-gray-500">Manage subcategories (e.g. Lavender Soap under Soaps)</p>
        </div>
        <button
          onClick={() => openModal()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-md"
        >
          <FiPlus size={20} />
          <span>Add Subcategory</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Subcategory Name</th>
                <th className="px-6 py-4">Parent Category</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : subCategories.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No subcategories found.</td></tr>
              ) : (
                currentItems.map((sub) => (
                  <tr key={sub._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                        {sub.image ? (
                          <img src={sub.image} alt={sub.name} className="h-full w-full object-cover" />
                        ) : (
                          <FiImage className="text-gray-400" size={20} />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-800">{sub.name}</td>
                    <td className="px-6 py-3">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium border border-blue-100">
                        {sub.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500 text-sm">{sub.slug}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => openModal(sub)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"><FiEdit2 size={18} /></button>
                        <button onClick={() => openDeleteModal(sub._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition"><FiTrash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && subCategories.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{indexOfFirstItem + 1}</span> to <span className="font-medium text-gray-900">{Math.min(indexOfLastItem, subCategories.length)}</span> of <span className="font-medium text-gray-900">{subCategories.length}</span> results
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition"><FiChevronLeft size={18} /></button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i + 1} onClick={() => paginate(i + 1)} className={`px-3 py-1 rounded-lg text-sm font-medium transition ${currentPage === i + 1 ? "bg-blue-600 text-white shadow-sm" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}>{i + 1}</button>
                ))}
              </div>
              <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition"><FiChevronRight size={18} /></button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} transition={{ duration: 0.2 }} className="relative bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">{isEditing ? "Edit Subcategory" : "Add New Subcategory"}</h2>
                <button onClick={closeModal} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition"><FiX size={20} className="text-gray-600" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Parent Category</label>
                  <select value={parentCategoryId} onChange={(e) => setParentCategoryId(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white" required>
                    <option value="">-- Select Category --</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Subcategory Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="e.g. Lavender Soap" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Subcategory Image</label>
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-lg bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center overflow-hidden shrink-0">
                      {previewUrl ? <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" /> : <span className="text-xs text-gray-400">No Image</span>}
                    </div>
                    <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                      Choose File
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition shadow-sm">{isEditing ? "Save Changes" : "Create Subcategory"}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeDeleteModal} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"><FiAlertTriangle size={32} /></div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Delete Subcategory?</h2>
              <p className="text-gray-500 mb-6">Are you sure? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={closeDeleteModal} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Subcategories;