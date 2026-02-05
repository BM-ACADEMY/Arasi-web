import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import api from "@/services/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Loader2,
  Plus,
  Trash2,
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  Truck,
  Receipt,
  MapPin,
  Scale
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { INDIAN_STATES } from "@/Data/Data";

// --- UPDATED HELPER: Robust Image URL Logic ---
const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;

  // 1. Get the API URL from environment, or default to empty
  const apiVar = import.meta.env.VITE_API_URL || "";

  // 2. Remove "/api" from the end if present (and any trailing slashes)
  const baseUrl = apiVar.replace(/\/api\/?$/, "").replace(/\/$/, "");

  // 3. Ensure imagePath doesn't start with a slash to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;

  // 4. Combine
  return `${baseUrl}/${cleanPath}`;
};

// --- HELPER: Weight Conversion (Must match Backend Logic) ---
const getWeightInKg = (weight, unit) => {
  const w = parseFloat(weight) || 0;
  switch (unit?.toLowerCase()) {
    case 'g':
    case 'ml':
      return w / 1000;
    case 'kg':
    case 'l':
      return w;
    default:
      return w; // Default to KG if unit is missing
  }
};

const CheckoutPage = () => {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();

  // Data State
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [storeSettings, setStoreSettings] = useState({
    gstRate: 0,
    shippingCharges: [],
    defaultShippingCharge: 0
  });

  // UI State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  // Address Form State
  const [newAddress, setNewAddress] = useState({
    address: "", city: "", state: "", pincode: "", phone: ""
  });

  // Costs State (Now fetched from backend for accuracy)
  const [costs, setCosts] = useState({
    subtotal: 0,
    gst: 0,
    shipping: 0,
    totalWeight: 0,
    total: 0
  });

  // Initial Fetch
  useEffect(() => {
    fetchAddresses();
    fetchSettings();
  }, []);

  // Fetch Costs from Backend when Address Changes
  useEffect(() => {
    if (selectedAddressId && cart?.items?.length > 0) {
      const fetchBackendCosts = async () => {
        const selectedAddress = savedAddresses.find(a => a._id === selectedAddressId);
        if (!selectedAddress) return;

        try {
          const { data } = await api.post("/orders/calculate-costs", {
            shippingState: selectedAddress.state
          });
          if (data.success) {
            setCosts(data.costs);
          } else {
            toast.error("Failed to calculate costs from server. Using local estimate.");
            setCosts(calculateLocalCosts());
          }
        } catch (error) {
          toast.error("Error fetching costs. Using local estimate.");
          setCosts(calculateLocalCosts());
        }
      };

      fetchBackendCosts();
    } else {
      // Reset costs if no address or empty cart
      setCosts({
        subtotal: cart?.totalAmount || 0,
        gst: 0,
        shipping: 0,
        totalWeight: 0,
        total: cart?.totalAmount || 0
      });
    }
  }, [selectedAddressId, cart, savedAddresses, storeSettings]);

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

  const fetchSettings = async () => {
    try {
      const { data } = await api.get("/settings");
      if (data.success) {
        setStoreSettings(data.settings);
      }
    } catch (error) {
      console.error("Failed to load store settings", error);
    }
  };

  // Local Fallback Calculation (In case backend fails)
  const calculateLocalCosts = () => {
    const subtotal = cart?.totalAmount || 0;
    const gstAmount = Math.round((subtotal * storeSettings.gstRate) / 100);

    // 1. Calculate Total Cart Weight
    let totalWeightKg = 0;

    if (cart && cart.items) {
      cart.items.forEach((item, index) => {
        const product = item.product;

        // --- ID MATCHING LOGIC ---
        const itemVariantId = typeof item.variant === 'object' ? item.variant?._id : item.variant;
        const itemVariantIdString = itemVariantId ? String(itemVariantId) : null;

        // Try to find the specific variant
        let variantObj = product.variants?.find(v => String(v._id) === itemVariantIdString);

        // --- BACKEND PARITY FIX: Fallback to first variant if specific one not found ---
        if (!variantObj && product.variants && product.variants.length > 0) {
          console.warn(`Item ${index}: Variant ID ${itemVariantIdString} not found. Falling back to first variant.`);
          variantObj = product.variants[0];
        }

        // --- DETERMINE WEIGHT ---
        let weight = 0;
        let unit = 'kg';

        if (variantObj && variantObj.weight) {
          weight = variantObj.weight;
          unit = variantObj.weightUnit;
        } else if (product.weight) {
          weight = product.weight;
          unit = product.weightUnit;
        }

        const itemTotalWeight = getWeightInKg(weight, unit) * item.quantity;
        totalWeightKg += itemTotalWeight;

        // DEBUG LOG: Remove this after fixing
        console.log(`Item: ${product.name} | Variant Found: ${!!variantObj} | Weight: ${weight}${unit} | Item Total KG: ${itemTotalWeight}`);
      });
    }

    console.log("Total Cart Weight (KG):", totalWeightKg);

    // 2. Calculate Shipping
    let shippingCost = storeSettings.defaultShippingCharge || 0;
    const currentAddress = savedAddresses.find(a => a._id === selectedAddressId);

    if (currentAddress && storeSettings.shippingCharges) {
      const userState = currentAddress.state?.toLowerCase().trim();
      console.log("User State:", userState); // DEBUG

      const stateRule = storeSettings.shippingCharges.find(
        s => s.state?.toLowerCase().trim() === userState
      );

      if (stateRule) {
        console.log("State Rule Found:", stateRule); // DEBUG

        if (stateRule.tiers && stateRule.tiers.length > 0) {
          const sortedTiers = [...stateRule.tiers].sort((a, b) => a.limit - b.limit);

          // Find tier
          const matchingTier = sortedTiers.find(tier => totalWeightKg <= tier.limit);

          if (matchingTier) {
            shippingCost = matchingTier.price;
            console.log("Matched Tier:", matchingTier); // DEBUG
          } else {
            // Exceeds max tier -> Highest price
            shippingCost = sortedTiers[sortedTiers.length - 1].price;
            console.log("Exceeds max tier, using highest:", shippingCost); // DEBUG
          }
        } else if (stateRule.charge !== undefined) {
          shippingCost = stateRule.charge;
        }
      } else {
        console.log("No State Rule found for:", userState);
      }
    }

    return {
      subtotal,
      gst: gstAmount,
      shipping: shippingCost,
      totalWeight: totalWeightKg,
      total: subtotal + gstAmount + shippingCost
    };
  };

  // --- HANDLERS ---
  const handleFormChange = (e) => setNewAddress({ ...newAddress, [e.target.name]: e.target.value });

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (savedAddresses.length >= 3) {
      toast.error("Address limit reached. Please remove one first.");
      return;
    }
    setIsSavingAddress(true);
    try {
      const { data } = await api.post("/address/add", newAddress);
      if (data.success) {
        toast.success("Address saved");
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
    if (!selectedAddressId) return toast.error("Please select a shipping address");

    const deliveryAddress = savedAddresses.find(a => a._id === selectedAddressId);
    setLoading(true);

    try {
      // Create Order on Backend (Final Calculation Check)
      const { data: orderData } = await api.post("/orders/create-order", {
        shippingState: deliveryAddress.state
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: "INR",
        name: "Arasi Soaps",
        description: "Order Payment",
        order_id: orderData.order.id,
        prefill: {
          contact: deliveryAddress.phone,
        },
        theme: { color: "#1c1917" },
        handler: async function (response) {
          const verifyPaymentPromise = api.post("/orders/verify-payment", {
            ...response,
            shippingAddress: deliveryAddress
          });

          toast.promise(verifyPaymentPromise, {
            loading: 'Verifying payment...',
            success: 'Order confirmed successfully!',
            error: 'Verification failed',
          });

          try {
            const verifyRes = await verifyPaymentPromise;
            if (verifyRes.data.success) {
              await fetchCart();
              setTimeout(() => navigate("/orders"), 1500);
            }
          } catch (e) {
            console.error(e);
          }
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      razorpay.on('payment.failed', function (response) {
        toast.error("Payment Failed");
        setLoading(false);
      });

    } catch (e) {
      toast.error(e.response?.data?.message || "Could not initialize payment");
      setLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h2 className="text-2xl font-serif text-stone-900 mb-4">Your bag is empty</h2>
      <Link to="/shop" className="text-sm border-b border-black pb-1 hover:text-stone-600">Continue Shopping</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pt-24 md:pt-32 pb-20 font-sans selection:bg-stone-200">

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {addressToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setAddressToDelete(null)}
              className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              className="relative bg-white p-8 max-w-sm w-full shadow-2xl rounded-sm border border-stone-100"
            >
              <h3 className="text-lg font-serif mb-2 text-stone-900">Remove Address?</h3>
              <p className="text-sm text-stone-500 mb-6 font-light">This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setAddressToDelete(null)} className="flex-1 py-3 text-xs uppercase tracking-widest border border-stone-200 hover:border-black transition-colors">Keep</button>
                <button onClick={handleDeleteAddress} className="flex-1 py-3 text-xs uppercase tracking-widest bg-black text-white hover:bg-stone-800 transition-colors">Remove</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col gap-6 pt-5 mb-16">
          <Link to="/cart" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-stone-400 hover:text-black transition-colors w-fit">
            <ArrowLeft size={14} /> Back to Bag
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif text-stone-900 tracking-tight">Checkout.</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

          {/* --- LEFT COLUMN: Address Management --- */}
          <div className="lg:col-span-7">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest text-stone-900 border-b-2 border-black pb-1">
                01. Shipping Details
              </h2>
              {!showAddressForm && savedAddresses.length < 3 && (
                <button onClick={() => setShowAddressForm(true)} className="group flex items-center gap-2 text-[10px] uppercase tracking-widest font-medium hover:text-stone-600 transition-colors">
                  <span className="w-5 h-5 rounded-full border border-stone-300 flex items-center justify-center group-hover:border-stone-600"><Plus size={10} /></span>
                  Add New
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {!showAddressForm ? (
                // LIST SAVED ADDRESSES
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                      className={`group relative p-6 cursor-pointer transition-all duration-300 border ${
                        selectedAddressId === addr._id
                        ? "border-black bg-stone-50"
                        : "border-stone-200 bg-white hover:border-stone-400"
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${selectedAddressId === addr._id ? "border-black" : "border-stone-300"}`}>
                          {selectedAddressId === addr._id && <div className="w-2 h-2 rounded-full bg-black" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                             <div>
                                <p className="text-sm font-medium text-stone-900 leading-relaxed uppercase tracking-wide">{addr.address}</p>
                                <p className="text-sm text-stone-500 font-light mt-1">{addr.city}, {addr.state} <span className="text-stone-300">|</span> {addr.pincode}</p>
                                <p className="text-xs text-stone-400 mt-3 font-mono flex items-center gap-2"><MapPin size={10}/> {addr.phone}</p>
                             </div>
                             <button
                               onClick={(e) => { e.stopPropagation(); setAddressToDelete(addr._id); }}
                               className="text-stone-300 hover:text-red-500 transition-colors p-2"
                             >
                               <Trash2 size={16} strokeWidth={1.5} />
                             </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {savedAddresses.length === 0 && (
                    <div className="py-10 text-center border border-dashed border-stone-300 bg-stone-50/50">
                      <p className="text-xs text-stone-400 uppercase tracking-widest">No stored addresses</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                // ADD NEW ADDRESS FORM
                <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white" onSubmit={handleSaveAddress}>
                  <div className="grid grid-cols-1 gap-8 mb-8">
                    <div className="group">
                      <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-2">Street Address</label>
                      <input
                        name="address"
                        required
                        value={newAddress.address}
                        onChange={handleFormChange}
                        className="w-full border-b border-stone-200 py-2 text-sm text-stone-900 focus:border-black outline-none bg-transparent transition-colors placeholder:text-stone-300"
                        placeholder="House No, Street, Landmark"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-2">State</label>
                        <select
                          name="state"
                          required
                          value={newAddress.state}
                          onChange={handleFormChange}
                          className="w-full border-b border-stone-200 py-2 text-sm text-stone-900 focus:border-black outline-none bg-transparent transition-colors"
                        >
                          <option value="">Select State</option>
                          {INDIAN_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-2">City</label>
                        <input
                          name="city"
                          required
                          value={newAddress.city}
                          onChange={handleFormChange}
                          className="w-full border-b border-stone-200 py-2 text-sm text-stone-900 focus:border-black outline-none bg-transparent transition-colors"
                          placeholder="Enter City"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-2">Pincode</label>
                        <input name="pincode" type="number" required value={newAddress.pincode} onChange={handleFormChange} className="w-full border-b border-stone-200 py-2 text-sm text-stone-900 focus:border-black outline-none bg-transparent transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-2">Phone</label>
                        <input name="phone" type="tel" required value={newAddress.phone} onChange={handleFormChange} className="w-full border-b border-stone-200 py-2 text-sm text-stone-900 focus:border-black outline-none bg-transparent transition-colors" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setShowAddressForm(false)} className="px-8 py-4 text-[10px] uppercase tracking-widest border border-stone-200 hover:border-black transition-colors">Cancel</button>
                    <button type="submit" disabled={isSavingAddress} className="flex-1 bg-black text-white text-[10px] uppercase tracking-widest hover:bg-stone-800 disabled:opacity-50 transition-colors">{isSavingAddress ? "Saving..." : "Save Address"}</button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* --- RIGHT COLUMN: Order Summary --- */}
          <aside className="lg:col-span-5 relative">
            <div className="sticky top-32">
              <div className="bg-[#FAFAFA] p-8 border border-stone-100">
                <h3 className="font-serif text-lg text-stone-900 mb-6 flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="text-xs font-sans text-stone-400 font-normal tracking-wide">{cart.items.length} ITEM(S)</span>
                </h3>

                {/* Cart Items List */}
                <div className="space-y-6 mb-8 max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.items.map((item) => {
                    // ── Added Variant Display Logic (Same as CartPage) ──
                    let sizeDisplay = "Standard";
                    if (item.variant) {
                       if (typeof item.variant === 'string' && item.variant.length > 10) {
                         const matchedVariant = item.product.variants?.find(
                           v => v._id?.toString() === item.variant
                         );
                         if (matchedVariant) {
                           if (matchedVariant.label) {
                             sizeDisplay = matchedVariant.label;
                             if (matchedVariant.unit) sizeDisplay += ` ${matchedVariant.unit}`;
                           } else if (matchedVariant.weight && matchedVariant.weightUnit) {
                             sizeDisplay = `${matchedVariant.weight}${matchedVariant.weightUnit}`;
                           } else if (matchedVariant.unit) {
                             sizeDisplay = matchedVariant.unit;
                           }
                         }
                       } else {
                         sizeDisplay = item.variant;
                       }
                    }

                    return (
                      <div key={item._id} className="flex gap-4 py-2">
                        <div className="w-14 h-16 bg-white border border-stone-100 flex-shrink-0 overflow-hidden">
                          <img src={getImageUrl(item.product.images?.[0])} alt={item.product.name} className="w-full h-full object-cover opacity-90" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide truncate">{item.product.name}</h4>
                          <p className="text-[10px] text-stone-500 mt-1 flex flex-col sm:flex-row sm:gap-3">
                            <span>Size: {sizeDisplay}</span>
                            <span className="hidden sm:inline text-stone-300">|</span>
                            <span>Qty: {item.quantity}</span>
                          </p>
                        </div>
                        <div className="text-sm font-medium text-stone-900">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-stone-200 pt-6 space-y-3">
                  <div className="flex justify-between text-xs text-stone-500 tracking-wide uppercase">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900">₹{costs.subtotal.toLocaleString()}</span>
                  </div>

                  {/* GST Display */}
                  <div className="flex justify-between text-xs text-stone-500 tracking-wide uppercase">
                    <span className="flex items-center gap-1"><Receipt size={12}/> GST ({storeSettings.gstRate}%)</span>
                    <span className="font-medium text-gray-900">+ ₹{costs.gst.toLocaleString()}</span>
                  </div>

                  {/* Shipping Display */}
                  <div className="flex justify-between text-xs text-stone-500 tracking-wide uppercase">
                    <span className="flex items-center gap-1"><Truck size={12}/> Delivery Charges</span>
                    <span className="font-medium text-gray-900">
                      {costs.shipping === 0 ? (
                        <span className="text-green-600 font-bold">Free</span>
                      ) : (
                        `+ ₹${costs.shipping.toLocaleString()}`
                      )}
                    </span>
                  </div>

                  {/* Final Total */}
                  <div className="flex justify-between items-baseline pt-4 mt-2 border-t border-stone-200">
                    <span className="text-sm font-bold uppercase tracking-widest text-stone-900">Total Paid</span>
                    <span className="text-2xl text-stone-900">₹{costs.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment Button */}
                <button
                  onClick={handlePayment}
                  disabled={loading || showAddressForm || !selectedAddressId}
                  className="w-full mt-8 bg-stone-900 text-white py-5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <CreditCard size={16} />}
                  {loading ? "Processing..." : "Pay Securely"}
                </button>

                <div className="mt-6 flex flex-col items-center gap-2 text-stone-400">
                   <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest">
                      <ShieldCheck size={12} /> Secure Checkout
                   </div>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;