import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiPlus, FiEdit3, FiTrash2, FiX, FiImage, FiAlertOctagon, 
  FiChevronLeft, FiChevronRight, FiSearch, FiFilter, FiSave, FiLayers 
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
  const [itemsPerPage] = useState(6); // Increased slightly for grid view potential

  // --- Modal States ---
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Renamed for clarity
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
    variants: [{ label: "", quantity: "", unit: "piece", price: "", stock: "" }],
    details: [{ heading: "", content: "" }]
  };
  const [formData, setFormData] = useState(initialFormState);
  const [imageFiles, setImageFiles] = useState([]); 
  const [previewUrls, setPreviewUrls] = useState([]); 

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
    e.preventDefault();
    fetchProducts(search);
    setCurrentPage(1);
  };

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
      variants: [...formData.variants, { label: "", quantity: "", unit: "piece", price: "", stock: "" }] 
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
      setImageFiles(prev => [...prev, ...files]);
      const newUrls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newUrls]);
    }
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
        variants: product.variants?.length ? product.variants : [{ label: "", quantity: "", unit: "piece", price: "", stock: "" }],
        details: product.details?.length ? product.details : [{ heading: "", content: "" }]
      });

      if (product.category?._id) {
        setFilteredSubs(subCategories.filter(sub => sub.category?._id === product.category._id));
      }

      setPreviewUrls(product.images || []);
      setImageFiles([]); 
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setFormData(initialFormState);
      setFilteredSubs([]);
      setPreviewUrls([]);
      setImageFiles([]);
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
    imageFiles.forEach((file) => data.append("images", file));

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

  // ==========================
  // 5. RENDER
  // ==========================
  return (
    <div className="min-h-screen bg-slate-50/50 p-6 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Inventory</h1>
            <p className="text-slate-500 mt-1">Manage your catalog, prices, and stock levels.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Search inventory..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onSubmit={handleSearch}
                className="pl-10 pr-4 py-2.5 w-full md:w-64 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              />
              <FiSearch className="absolute left-3 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            
            <button
              onClick={() => openDrawer()}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-indigo-200 transition-all active:scale-95"
            >
              <FiPlus size={18} />
              <span>New Product</span>
            </button>
          </div>
        </div>

        {/* --- MAIN CONTENT CARD --- */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="px-6 py-5 pl-8">Product</th>
                  <th className="px-6 py-5">Category</th>
                  <th className="px-6 py-5">Brand</th>
                  <th className="px-6 py-5">Variants</th>
                  <th className="px-6 py-5 text-right pr-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                   <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 animate-pulse">Loading inventory data...</td></tr>
                ) : products.length === 0 ? (
                   <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">No products found. Add your first item!</td></tr>
                ) : (
                  currentProducts.map((prod) => (
                    <tr key={prod._id} className="group hover:bg-slate-50/80 transition-colors duration-200">
                      <td className="px-6 py-4 pl-8">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 relative">
                             {prod.images?.[0] ? (
                               <img src={prod.images[0]} alt="" className="h-full w-full object-cover" />
                             ) : (
                               <div className="flex items-center justify-center h-full text-slate-300"><FiImage size={20} /></div>
                             )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{prod.name}</div>
                            <div className="text-xs text-slate-400 line-clamp-1 max-w-[200px]">{prod.description || "No description"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {prod.category?.name || "N/A"}
                          </span>
                          {prod.subCategory && <span className="text-xs text-slate-400 ml-1">↳ {prod.subCategory.name}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        {prod.brand || "—"}
                      </td>
                      <td className="px-6 py-4">
                         <div className="text-sm font-semibold text-slate-700">
                           {prod.variants?.length > 0 ? (
                             <span>
                               ₹{Math.min(...prod.variants.map(v => v.price))} 
                               <span className="text-slate-400 font-normal mx-1">-</span> 
                               ₹{Math.max(...prod.variants.map(v => v.price))}
                             </span>
                           ) : <span className="text-slate-400 italic">No Price</span>}
                         </div>
                         <div className="text-xs text-slate-400 mt-0.5">{prod.variants?.length || 0} options available</div>
                      </td>
                      <td className="px-6 py-4 pr-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openDrawer(prod)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Edit">
                            <FiEdit3 size={18} />
                          </button>
                          <button onClick={() => { setDeleteId(prod._id); setIsDeleteModalOpen(true); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Pagination */}
          {!loading && products.length > 0 && (
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Page <span className="font-semibold text-slate-700">{currentPage}</span> of <span className="font-semibold text-slate-700">{totalPages}</span>
              </span>
              <div className="flex gap-2">
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition shadow-sm">
                  <FiChevronLeft size={18} />
                </button>
                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition shadow-sm">
                  <FiChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================= */}
      {/* DRAWER: ADD / EDIT      */}
      {/* ======================= */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={closeDrawer}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
            />
            
            {/* Slide-over Panel */}
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{isEditing ? "Edit Product" : "Create Product"}</h2>
                  <p className="text-sm text-slate-500">Fill in the details below.</p>
                </div>
                <button onClick={closeDrawer} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
                  <FiX size={24} />
                </button>
              </div>

              {/* Drawer Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
                <form id="productForm" onSubmit={handleSubmit} className="space-y-8">
                  
                  {/* Section 1: Basic Info */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 space-y-4">
                    <div className="flex items-center gap-2 mb-2 text-slate-800 font-semibold border-b border-slate-100 pb-2">
                      <FiLayers className="text-indigo-500" /> Basic Information
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Product Name</label>
                        <input name="name" type="text" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition" placeholder="e.g. Premium Wireless Headphones" required />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Category</label>
                        <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none bg-white" required>
                          <option value="">Select...</option>
                          {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Brand</label>
                        <input name="brand" type="text" value={formData.brand} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none" placeholder="e.g. Sony" />
                      </div>
                      {formData.category && (
                        <div className="col-span-2 animate-in fade-in slide-in-from-top-2">
                           <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Subcategory</label>
                           <select name="subCategory" value={formData.subCategory} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none bg-white">
                            <option value="">Select Subcategory...</option>
                            {filteredSubs.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
                          </select>
                        </div>
                      )}
                      <div className="col-span-2">
                         <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Description</label>
                         <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none" placeholder="Product details..."></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Variants */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2 text-slate-800 font-semibold">
                        <FiFilter className="text-indigo-500" /> Variants & Pricing
                      </div>
                      <button type="button" onClick={addVariant} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-100 font-medium transition">+ Add Variant</button>
                    </div>
                    
                    <div className="space-y-3">
                      {formData.variants.map((variant, index) => (
                        <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200/60 relative group">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="col-span-2 md:col-span-1">
                               <label className="text-[10px] uppercase font-bold text-slate-400">Label</label>
                               <input type="text" placeholder="e.g. XL" value={variant.label} onChange={(e) => handleVariantChange(index, 'label', e.target.value)} className="w-full p-1.5 border border-slate-200 rounded text-sm bg-white" />
                            </div>
                            <div>
                               <label className="text-[10px] uppercase font-bold text-slate-400">Unit</label>
                               <input list={`units-${index}`} placeholder="pc" value={variant.unit} onChange={(e) => handleVariantChange(index, 'unit', e.target.value)} className="w-full p-1.5 border border-slate-200 rounded text-sm bg-white" />
                               <datalist id={`units-${index}`}><option value="piece"/><option value="kg"/><option value="ltr"/></datalist>
                            </div>
                            <div>
                               <label className="text-[10px] uppercase font-bold text-slate-400">Price</label>
                               <input type="number" placeholder="0.00" value={variant.price} onChange={(e) => handleVariantChange(index, 'price', e.target.value)} className="w-full p-1.5 border border-slate-200 rounded text-sm bg-white" />
                            </div>
                             <div>
                               <label className="text-[10px] uppercase font-bold text-slate-400">Stock</label>
                               <input type="number" placeholder="0" value={variant.stock} onChange={(e) => handleVariantChange(index, 'stock', e.target.value)} className="w-full p-1.5 border border-slate-200 rounded text-sm bg-white" />
                            </div>
                          </div>
                          {formData.variants.length > 1 && (
                            <button type="button" onClick={() => removeVariant(index)} className="absolute -top-2 -right-2 bg-white text-red-500 shadow-sm border border-slate-200 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
                              <FiX size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 3: Images */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                     <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold border-b border-slate-100 pb-2">
                      <FiImage className="text-indigo-500" /> Media
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {previewUrls.map((url, i) => (
                        <div key={i} className="h-20 w-20 rounded-lg border border-slate-200 overflow-hidden relative shadow-sm">
                          <img src={url} alt="" className="h-full w-full object-cover" />
                        </div>
                      ))}
                      <label className="h-20 w-20 rounded-lg border-2 border-dashed border-indigo-200 bg-indigo-50/50 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition text-indigo-400">
                        <FiPlus size={24} />
                        <span className="text-[10px] font-medium mt-1">Upload</span>
                        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                    </div>
                  </div>

                  {/* Section 4: Extra Details */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                       <span className="text-slate-800 font-semibold text-sm">Additional Specifications</span>
                       <button type="button" onClick={addDetail} className="text-xs text-indigo-600 font-medium hover:underline">+ Add Field</button>
                    </div>
                    <div className="space-y-2">
                       {formData.details.map((det, idx) => (
                         <div key={idx} className="flex gap-2">
                           <input type="text" placeholder="Title (e.g. Color)" value={det.heading} onChange={(e) => handleDetailChange(idx, 'heading', e.target.value)} className="w-1/3 p-2 border border-slate-200 rounded text-xs bg-slate-50" />
                           <input type="text" placeholder="Value (e.g. Red)" value={det.content} onChange={(e) => handleDetailChange(idx, 'content', e.target.value)} className="w-full p-2 border border-slate-200 rounded text-xs" />
                           <button type="button" onClick={() => removeDetail(idx)} className="text-slate-400 hover:text-red-500"><FiTrash2 size={14}/></button>
                         </div>
                       ))}
                    </div>
                  </div>

                </form>
              </div>

              {/* Drawer Footer (Sticky) */}
              <div className="p-5 border-t border-slate-100 bg-white flex gap-3">
                <button onClick={closeDrawer} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition">Cancel</button>
                <button 
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition flex items-center justify-center gap-2"
                >
                  <FiSave size={18} />
                  <span>{isEditing ? "Save Changes" : "Create Product"}</span>
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ======================= */}
      {/* DELETE ALERT MODAL      */}
      {/* ======================= */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <FiAlertOctagon className="text-red-600 text-3xl" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Delete this product?</h3>
                <p className="text-sm text-slate-500 mb-6">This action cannot be undone. The product and all its variants will be permanently removed.</p>
                <div className="grid grid-cols-2 gap-3">
                   <button onClick={() => setIsDeleteModalOpen(false)} className="py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition">Cancel</button>
                   <button onClick={confirmDelete} className="py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 shadow-lg shadow-red-200 transition">Delete</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Product;