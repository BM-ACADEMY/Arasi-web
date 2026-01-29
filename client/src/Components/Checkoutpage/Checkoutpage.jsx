import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import api from "@/services/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Loader2,
  ShieldCheck,
  Plus,
  Trash2,
  ChevronLeft,
  Lock,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:5000";
  return `${baseUrl}/${imagePath}`;
};

const CheckoutPage = () => {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  const [newAddress, setNewAddress] = useState({
    address: "", city: "", state: "", pincode: "", phone: ""
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const { data } = await api.get("/address/get");
      if (data.success) {
        setSavedAddresses(data.addresses);
        if (data.addresses.length > 0 && !selectedAddressId) {
          const defaultAddr = data.addresses.find(a => a.isDefault) || data.addresses[0];
          setSelectedAddressId(defaultAddr._id);
        } else if (data.addresses.length === 0) {
          setShowAddressForm(true);
        }
      }
    } catch (error) {
      toast.error("Could not load saved addresses");
    }
  };

  const handleFormChange = (e) => setNewAddress({ ...newAddress, [e.target.name]: e.target.value });

  const handleSaveAddress = async (e) => {
    e.preventDefault();

    // --- STRIKT ADDRESS LIMIT CHECK (MAX 2) ---
    if (savedAddresses.length >= 2) {
      toast.error("You can only save up to 2 addresses. Please remove one to add a new one.");
      setShowAddressForm(false);
      return;
    }

    setIsSavingAddress(true);
    try {
      const { data } = await api.post("/address/add", newAddress);
      if (data.success) {
        toast.success("Address added to profile");
        setNewAddress({ address: "", city: "", state: "", pincode: "", phone: "" });
        await fetchAddresses();
        setSelectedAddressId(data.address._id);
        setShowAddressForm(false);
      }
    } catch (error) {
      toast.error("Failed to save address");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const confirmDelete = (e, id) => {
    e.stopPropagation();
    setAddressToDelete(id);
  };

  const handleDeleteAddress = async () => {
    try {
      const { data } = await api.delete(`/address/delete/${addressToDelete}`);
      if (data.success) {
        toast.success("Address removed");
        if (selectedAddressId === addressToDelete) setSelectedAddressId(null);
        fetchAddresses();
      }
    } catch (error) {
      toast.error("Failed to delete address");
    } finally {
      setAddressToDelete(null);
    }
  };

  const handlePayment = async () => {
    if (!selectedAddressId) return toast.error("Please select shipping destination");
    const deliveryAddress = savedAddresses.find(a => a._id === selectedAddressId);
    setLoading(true);

    try {
      const { data: orderData } = await api.post("/orders/create-order");
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: "INR",
        name: "Arasi Soaps",
        description: "Boutique Artisanal Soaps",
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            const verifyRes = await api.post("/orders/verify-payment", {
              ...response,
              shippingAddress: deliveryAddress
            });
            if (verifyRes.data.success) {
              toast.success("Order Placed Successfully!");
              await fetchCart();
              navigate("/orders");
            }
          } catch (e) { toast.error("Payment verification failed"); }
        },
        prefill: { contact: deliveryAddress.phone },
        theme: { color: "#111111" },
      };
      new window.Razorpay(options).open();
    } catch (e) { toast.error("Initialization failed"); } finally { setLoading(false); }
  };

  if (!cart || cart.items.length === 0) return null;

  return (
    <div className="min-h-screen bg-[#FDF9F0] pt-32 md:pt-46 pb-24">

      {/* Custom Delete Prompt */}
      <AnimatePresence>
        {addressToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAddressToDelete(null)} className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white p-8 max-w-sm w-full shadow-2xl rounded-sm text-center">
              <AlertCircle size={32} className="mx-auto mb-4 text-slate-300 stroke-[1px]" />
              <h3 className="text-lg font-serif mb-2">Remove Address?</h3>
              <p className="text-sm text-slate-500 mb-8 font-light">Permanently delete this destination from your profile.</p>
              <div className="flex gap-4">
                <button onClick={() => setAddressToDelete(null)} className="flex-1 py-3 text-[10px] uppercase tracking-widest border border-slate-200">Keep It</button>
                <button onClick={handleDeleteAddress} className="flex-1 py-3 text-[10px] uppercase tracking-widest bg-black text-white">Remove</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col items-left mb-16">
          <Link to="/cart" className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-black mb-6 transition-colors">
            <ChevronLeft size={14} /> Back to Bag
          </Link>
          <h1 className="text-4xl font-serif text-slate-900 tracking-tight">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-7 space-y-12">
            <section>
              <div className="flex items-center justify-between mb-8 pb-2 border-b border-slate-200">
                <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-900 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
                  Shipping Destination
                </h2>

                {/* --- ADD BUTTON LOGIC: ONLY SHOW IF COUNT < 2 --- */}
                {!showAddressForm && savedAddresses.length < 2 && (
                  <button onClick={() => setShowAddressForm(true)} className="text-[10px] uppercase tracking-widest text-slate-400 hover:text-black transition-colors flex items-center gap-1">
                    <Plus size={14} /> New Address
                  </button>
                )}

                {savedAddresses.length >= 2 && !showAddressForm && (
                   <span className="text-[9px] uppercase tracking-widest text-slate-300">Address limit reached</span>
                )}
              </div>

              <AnimatePresence mode="wait">
                {!showAddressForm ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4">
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr._id}
                        onClick={() => setSelectedAddressId(addr._id)}
                        className={`relative p-6 rounded-sm border transition-all duration-300 cursor-pointer group ${
                          selectedAddressId === addr._id ? "border-slate-900 bg-white shadow-md" : "border-slate-100 bg-[#F9F8F6] hover:border-slate-300"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-slate-900">{addr.address}</p>
                            <p className="text-xs text-slate-500 font-light">{addr.city}, {addr.state} — {addr.pincode}</p>
                            <p className="text-[10px] tracking-widest text-slate-400 pt-3 uppercase font-medium">Contact: {addr.phone}</p>
                          </div>
                          <div className="flex flex-col items-end gap-6">
                            {selectedAddressId === addr._id ? (
                              <motion.div layoutId="check" className="text-slate-900"><ShieldCheck size={20} strokeWidth={1.5} /></motion.div>
                            ) : <div className="w-5 h-5" />}
                            <button onClick={(e) => confirmDelete(e, addr._id)} className="text-slate-300 hover:text-red-400 transition-colors p-1">
                              <Trash2 size={16} strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSaveAddress} className="space-y-6 bg-white p-8 border border-slate-100 shadow-sm">
                    {/* Form Fields Same as Before */}
                    <div className="grid grid-cols-1 gap-6">
                      <div className="relative">
                        <label className="text-[9px] uppercase tracking-widest text-slate-400 absolute -top-2 left-0 bg-white px-1">Street Address</label>
                        <input name="address" required value={newAddress.address} onChange={handleFormChange} className="w-full border border-slate-200 p-3 text-xs tracking-widest outline-none focus:border-black transition-colors" placeholder="e.g. 123 Luxury Lane" />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <input name="city" placeholder="CITY" required value={newAddress.city} onChange={handleFormChange} className="w-full border border-slate-200 p-3 text-xs tracking-widest outline-none focus:border-black transition-colors" />
                        <input name="state" placeholder="STATE" required value={newAddress.state} onChange={handleFormChange} className="w-full border border-slate-200 p-3 text-xs tracking-widest outline-none focus:border-black transition-colors" />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <input name="pincode" placeholder="PINCODE" required type="number" value={newAddress.pincode} onChange={handleFormChange} className="w-full border border-slate-200 p-3 text-xs tracking-widest outline-none focus:border-black transition-colors" />
                        <input name="phone" placeholder="PHONE" required type="tel" value={newAddress.phone} onChange={handleFormChange} className="w-full border border-slate-200 p-3 text-xs tracking-widest outline-none focus:border-black transition-colors" />
                      </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                      {savedAddresses.length > 0 && (
                        <button type="button" onClick={() => setShowAddressForm(false)} className="flex-1 py-4 text-[10px] uppercase tracking-[0.2em] border border-slate-200">Cancel</button>
                      )}
                      <button type="submit" disabled={isSavingAddress} className="flex-1 py-4 bg-black text-white text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 disabled:opacity-50">
                        {isSavingAddress ? "Saving..." : "Confirm & Save"}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </section>


          </div>

          <aside className="lg:col-span-5">
            <div className="bg-white border border-slate-100 p-10 sticky top-32 shadow-sm rounded-sm">
              <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-slate-900 mb-10 border-b border-slate-50 pb-4">Review Bag</h2>
              <div className="space-y-6 mb-10 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex gap-4 items-center">
                    <div className="w-16 h-20 bg-slate-50 flex-shrink-0 overflow-hidden rounded-sm">
                      <img src={getImageUrl(item.product.images?.[0])} alt={item.product.name} className="w-full h-full object-cover mix-blend-multiply opacity-90" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider leading-tight">{item.product.name}</h4>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-light text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-8 border-t border-slate-100">
                <div className="flex justify-between text-xs text-slate-500 tracking-widest uppercase font-light">
                  <span>Subtotal</span>
                  <span>₹{cart.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 tracking-widest uppercase font-light">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-bold tracking-normal">Free</span>
                </div>
                <div className="flex justify-between items-baseline pt-6 border-t border-slate-50">
                  <span className="text-xs uppercase tracking-[0.3em] font-bold">Total</span>
                  <span className="text-3xl text-slate-900">₹{cart.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <button onClick={handlePayment} disabled={loading || showAddressForm || !selectedAddressId} className="w-full mt-10 py-5 bg-black text-white text-[11px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all hover:bg-slate-800 disabled:opacity-30">
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Lock size={14} />} Complete Purchase
              </button>
              <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 text-center mt-6">Secure Transaction via Razorpay</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
