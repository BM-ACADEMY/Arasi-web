import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus, FiEdit3, FiTrash2, FiX, FiImage, FiAlertCircle,
  FiChevronLeft, FiChevronRight, FiSearch, FiSave, FiLayers, FiPackage, FiList, FiUploadCloud
} from "react-icons/fi";
import api from "@/services/api";
import toast from "react-hot-toast";

const Product = () => {
  // --- Data State ---
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubs, setFilteredSubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  // --- Modal States ---
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // --- Action State ---
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // --- Form State ---
  const initialFormState = {
    name: "",
    description: "",
    category: "",
    subCategory: "",
    brand: "",
    variants: [{ label: "", quantity: "", unit: "piece", price: "", originalPrice: "", stock: "" }],
    details: [{ heading: "", content: "" }]
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- Image State ---
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  // ==========================
  // 1. DATA FETCHING
  // ==========================
  const fetchProducts = async (keyword = "") => {
    try {
      setLoading(true);
      const res = await api.get(`/products?keyword=${keyword}`);
      setProducts(res.data.data);
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [catRes, subRes] = await Promise.all([
        api.get("/categories"),
        api.get("/subcategories")
      ]);
      setCategories(catRes.data.data);
      setSubCategories(subRes.data.data);
    } catch (err) {
      console.error("Failed to load dropdowns");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchDropdowns();
  }, []);

  // ==========================
  // 2. SEARCH & PAGINATION
  // ==========================
  const handleSearch = (e) => {
    setSearch(e.target.value);
    // Debouncing could be added here, currently instant update
  };

  // Trigger search on enter or button could be added, currently filtered client side or needs useEffect
  useEffect(() => {
     // Optional: if you want live search, call fetchProducts(search) here with debounce
     // For now keeping manual trigger logic or simple client filter if dataset small
     fetchProducts(search);
     setCurrentPage(1);
  }, [search]);


  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // ==========================
  // 3. FORM HANDLERS
  // ==========================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === "category") {
        setFilteredSubs(subCategories.filter(sub => sub.category?._id === value));
        newData.subCategory = "";
      }
      return newData;
    });
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index][field] = value;
    setFormData({ ...formData, variants: updatedVariants });
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { label: "", quantity: "", unit: "piece", price: "", originalPrice: "", stock: "" }]
    });
  };

  const removeVariant = (index) => {
    const updatedVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({ ...formData, variants: updatedVariants });
  };

  const handleDetailChange = (index, field, value) => {
    const updatedDetails = [...formData.details];
    updatedDetails[index][field] = value;
    setFormData({ ...formData, details: updatedDetails });
  };

  const addDetail = () => {
    setFormData({
      ...formData,
      details: [...formData.details, { heading: "", content: "" }]
    });
  };

  const removeDetail = (index) => {
    const updatedDetails = formData.details.filter((_, i) => i !== index);
    setFormData({ ...formData, details: updatedDetails });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFilesWithPreviews = files.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setNewImages(prev => [...prev, ...newFilesWithPreviews]);
    }
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      return updated.filter((_, i) => i !== index);
    });
  };

  // ==========================
  // 4. ACTION HANDLERS
  // ==========================
  const openDrawer = (product = null) => {
    if (product) {
      setIsEditing(true);
      setCurrentId(product._id);
      setFormData({
        name: product.name,
        description: product.description || "",
        category: product.category?._id || "",
        subCategory: product.subCategory?._id || "",
        brand: product.brand || "",
        variants: product.variants?.length ? product.variants : [{ label: "", quantity: "", unit: "piece", price: "", originalPrice: "", stock: "" }],
        details: product.details?.length ? product.details : [{ heading: "", content: "" }]
      });

      if (product.category?._id) {
        setFilteredSubs(subCategories.filter(sub => sub.category?._id === product.category._id));
      }
      setExistingImages(product.images || []);
      setNewImages([]);
    } else {
      if (products.length >= 25) {
        toast.error("Limit reached: You can only create up to 25 products.");
        return;
      }
      setIsEditing(false);
      setCurrentId(null);
      setFormData(initialFormState);
      setFilteredSubs([]);
      setExistingImages([]);
      setNewImages([]);
    }
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Saving Product...");

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("subCategory", formData.subCategory);
    data.append("brand", formData.brand);
    data.append("variants", JSON.stringify(formData.variants));
    data.append("details", JSON.stringify(formData.details));

    newImages.forEach((imgObj) => {
      data.append("images", imgObj.file);
    });

    data.append("existingImages", JSON.stringify(existingImages));

    try {
      if (isEditing) {
        await api.put(`/products/${currentId}`, data);
        toast.success("Product updated!", { id: loadingToast });
      } else {
        await api.post("/products", data);
        toast.success("Product created!", { id: loadingToast });
      }
      fetchProducts();
      closeDrawer();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save", { id: loadingToast });
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const loadingToast = toast.loading("Removing product...");
    try {
      await api.delete(`/products/${deleteId}`);
      toast.success("Deleted successfully", { id: loadingToast });
      fetchProducts();
      setIsDeleteModalOpen(false);
    } catch (err) {
      toast.error("Delete failed", { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12">
      {/* ─── Header (Sticky) ───────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 top-0 z-50 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">Inventory</h1>
            <p className="text-sm text-slate-500 hidden sm:block truncate">Manage catalog, prices, and stock</p>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden sm:flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-2 rounded-full border border-slate-200 w-64 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <FiSearch />
                <input
                  value={search}
                  onChange={handleSearch}
                  placeholder="Search products..."
                  className="bg-transparent border-none outline-none text-sm text-slate-700 w-full placeholder:text-slate-400"
                />
             </div>

             <button
              onClick={() => openDrawer()}
              className="shrink-0 group relative inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm sm:text-base font-semibold rounded-full shadow-md shadow-indigo-200 transition-all duration-200 active:scale-95"
            >
              <FiPlus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              <span className="whitespace-nowrap">New Product</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Main Content ──────────────────────────────────── */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">

          {/* Table Header Row (Custom toolbar if needed, otherwise direct table) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500">
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider pl-8">Product</th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider">Category</th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider">Pricing</th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-right pr-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="5" className="px-6 py-20 text-center text-slate-400 font-medium animate-pulse">Loading inventory...</td></tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-24 text-center">
                       <div className="mx-auto w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                          <FiPackage className="text-slate-300" size={32} />
                       </div>
                       <p className="text-slate-500 font-medium">No products found.</p>
                    </td>
                  </tr>
                ) : (
                  currentProducts.map((prod) => (
                    <tr key={prod._id} className="group hover:bg-slate-50/80 transition-colors duration-200">
                      <td className="px-6 py-4 pl-8">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                             {prod.images?.[0] ? <img src={prod.images[0]} alt="" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="flex items-center justify-center h-full text-slate-300"><FiImage size={24} /></div>}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-800 truncate max-w-[200px]">{prod.name}</div>
                            <div className="text-xs text-slate-400 truncate max-w-[200px]">{prod.description || "No description"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {prod.category?.name || "N/A"}
                        </span>
                        {prod.subCategory && <div className="text-xs text-slate-400 mt-1 pl-1">↳ {prod.subCategory.name}</div>}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        {prod.brand || "—"}
                      </td>
                      <td className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-700">
                            {prod.variants?.length > 0 ? `₹${Math.min(...prod.variants.map(v => v.price))} - ₹${Math.max(...prod.variants.map(v => v.price))}` : "No Price"}
                          </div>
                          <div className="text-xs text-slate-400">{prod.variants?.length || 0} variants</div>
                      </td>
                      <td className="px-6 py-4 pr-8 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openDrawer(prod)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Edit"><FiEdit3 size={18} /></button>
                          <button onClick={() => { setDeleteId(prod._id); setIsDeleteModalOpen(true); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete"><FiTrash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && products.length > 0 && (
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-sm text-slate-500">Page {currentPage} of {totalPages}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition shadow-sm text-slate-600"><FiChevronLeft size={18} /></button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i + 1} onClick={() => paginate(i + 1)} className={`w-8 h-8 rounded-lg text-sm font-medium transition flex items-center justify-center ${currentPage === i + 1 ? "bg-indigo-600 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"}`}>{i + 1}</button>
                  ))}
                </div>
                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition shadow-sm text-slate-600"><FiChevronRight size={18} /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Drawer (Side Modal) ───────────────────────────── */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeDrawer} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]" />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full md:w-[650px] bg-white shadow-2xl z-[70] flex flex-col"
            >

              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{isEditing ? "Edit Product" : "Create Product"}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Fill in the details to add to inventory.</p>
                </div>
                <button onClick={closeDrawer} className="p-2 hover:bg-slate-100 rounded-full transition"><FiX size={24} className="text-slate-400" /></button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                <form id="productForm" onSubmit={handleSubmit} className="space-y-8 pb-20">

                  {/* Section: Basic Info */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-5">
                    <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-3">
                      <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600"><FiLayers size={18} /></div>
                      Basic Information
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Product Name <span className="text-red-500">*</span></label>
                        <input name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition font-medium" placeholder="e.g. Organic Almond Oil" required />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                          <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition appearance-none" required>
                            <option value="">Select...</option>
                            {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                          </select>
                        </div>
                        {formData.category && (
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Subcategory</label>
                            <select name="subCategory" value={formData.subCategory} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition appearance-none">
                              <option value="">Select...</option>
                              {filteredSubs.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
                            </select>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Brand</label>
                        <input name="brand" value={formData.brand} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition" placeholder="e.g. Nature's Best" />
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1.5">Description</label>
                          <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition resize-none" placeholder="Enter product details..." />
                      </div>
                    </div>
                  </div>

                  {/* Section: Variants */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2 text-slate-800 font-bold">
                        <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600"><FiPackage size={18} /></div>
                        Variants & Pricing
                      </div>
                      <button type="button" onClick={addVariant} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-full font-bold shadow-sm hover:bg-indigo-700 transition">+ Add Variant</button>
                    </div>

                    <div className="space-y-4">
                      {formData.variants.map((variant, index) => (
                        <div key={index} className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative group transition hover:border-indigo-200">
                           <div className="grid grid-cols-12 gap-3 mb-3">
                             <div className="col-span-4">
                               <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Label</label>
                               <input placeholder="e.g. 500ml" value={variant.label} onChange={(e) => handleVariantChange(index, 'label', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                             </div>
                             <div className="col-span-4">
                               <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Unit</label>
                               <input list={`u-${index}`} placeholder="piece" value={variant.unit} onChange={(e) => handleVariantChange(index, 'unit', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                               <datalist id={`u-${index}`}><option value="piece"/><option value="kg"/><option value="liter"/><option value="gram"/></datalist>
                             </div>
                             <div className="col-span-4">
                               <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Stock</label>
                               <input type="number" placeholder="0" value={variant.stock} onChange={(e) => handleVariantChange(index, 'stock', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                             </div>
                           </div>
                           <div className="grid grid-cols-2 gap-3">
                             <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">MRP (₹)</label>
                                <input type="number" placeholder="0.00" value={variant.originalPrice} onChange={(e) => handleVariantChange(index, 'originalPrice', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                             </div>
                             <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Selling Price (₹)</label>
                                <input type="number" placeholder="0.00" value={variant.price} onChange={(e) => handleVariantChange(index, 'price', e.target.value)} className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm font-bold text-indigo-700 focus:border-indigo-500 outline-none" />
                             </div>
                           </div>
                           {formData.variants.length > 1 && (
                             <button type="button" onClick={() => removeVariant(index)} className="absolute -top-2 -right-2 bg-white text-red-500 border border-slate-200 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:border-red-200 transition">
                               <FiX size={14} />
                             </button>
                           )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section: Images */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-3 mb-4">
                        <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600"><FiImage size={18} /></div>
                        Media Gallery
                      </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {/* Existing Server Images */}
                      {existingImages.map((url, i) => (
                        <div key={`ex-${i}`} className="aspect-square rounded-xl border border-slate-200 overflow-hidden relative shadow-sm group">
                          <img src={url} alt="" className="h-full w-full object-cover" />
                          <button type="button" onClick={() => removeExistingImage(i)} className="absolute top-1 right-1 bg-white/90 text-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50 transition shadow-sm backdrop-blur-sm"><FiTrash2 size={14} /></button>
                        </div>
                      ))}

                      {/* New Uploads */}
                      {newImages.map((imgObj, i) => (
                        <div key={`new-${i}`} className="aspect-square rounded-xl border-2 border-indigo-100 overflow-hidden relative shadow-sm group">
                          <img src={imgObj.preview} alt="" className="h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition" />
                          <button type="button" onClick={() => removeNewImage(i)} className="absolute top-1 right-1 bg-white/90 text-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50 transition shadow-sm"><FiX size={14} /></button>
                          <span className="absolute bottom-1 right-1 left-1 py-0.5 rounded text-[9px] font-bold bg-indigo-500 text-white text-center shadow-sm">NEW</span>
                        </div>
                      ))}

                      {/* Upload Button */}
                      <label className="aspect-square rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition group">
                        <div className="bg-white p-2 rounded-full shadow-sm mb-1 group-hover:scale-110 transition-transform"><FiUploadCloud className="text-indigo-500" size={20} /></div>
                        <span className="text-[10px] font-bold text-indigo-400">Add Image</span>
                        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                    </div>
                  </div>

                  {/* Section: Details */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2 text-slate-800 font-bold">
                           <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600"><FiList size={18} /></div>
                           Specifications
                        </div>
                        <button type="button" onClick={addDetail} className="text-xs text-indigo-600 font-bold hover:underline">+ Add Row</button>
                    </div>
                    <div className="space-y-3">
                        {formData.details.map((det, idx) => (
                          <div key={idx} className="flex gap-2 items-center group">
                            <input placeholder="Title (e.g. Color)" value={det.heading} onChange={(e) => handleDetailChange(idx, 'heading', e.target.value)} className="w-1/3 px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 font-medium focus:border-indigo-500 outline-none" />
                            <input placeholder="Value (e.g. Red)" value={det.content} onChange={(e) => handleDetailChange(idx, 'content', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:border-indigo-500 outline-none" />
                            <button type="button" onClick={() => removeDetail(idx)} className="text-slate-300 hover:text-red-500 transition"><FiTrash2 size={16}/></button>
                          </div>
                        ))}
                    </div>
                  </div>

                </form>
              </div>

              {/* Drawer Footer */}
              <div className="p-5 border-t border-slate-100 bg-white flex gap-3 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <button onClick={closeDrawer} className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition">Cancel</button>
                <button onClick={handleSubmit} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition transform active:scale-[0.98]"><FiSave size={18} /> <span>Save Product</span></button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Delete Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteModalOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80]" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none">
               <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 pointer-events-auto text-center">
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse"><FiAlertCircle size={32} /></div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Product?</h3>
                  <p className="text-slate-500 text-sm mb-6 leading-relaxed">This action cannot be undone. This product will be removed from your inventory permanently.</p>
                  <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setIsDeleteModalOpen(false)} className="py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
                      <button onClick={confirmDelete} className="py-2.5 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-100 transition">Delete</button>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Product;
