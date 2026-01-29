import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Loader2, ShieldCheck, MapPin, Plus, CheckCircle, Trash2 } from "lucide-react";

// Helper to construct image URL
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

  // Address Management State
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // New Address Form State
  const [newAddress, setNewAddress] = useState({
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: ""
  });

  // --- 1. Fetch Addresses on Load ---
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const { data } = await api.get("/address/get");
      if (data.success) {
        setSavedAddresses(data.addresses);

        // Logic: Auto-select primary or first address
        if (data.addresses.length > 0) {
          // If previously selected, keep it, otherwise pick default/first
          if (!selectedAddressId) {
            const defaultAddr = data.addresses.find(a => a.isDefault) || data.addresses[0];
            setSelectedAddressId(defaultAddr._id);
          }
          setShowAddressForm(false);
        } else {
          setShowAddressForm(true); // No addresses, force form
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Could not load saved addresses");
    }
  };

  const handleFormChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  // --- 2. Save New Address (Backend Integration) ---
  const handleSaveAddress = async (e) => {
    e.preventDefault();

    if (!newAddress.address || !newAddress.phone || !newAddress.pincode) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSavingAddress(true);
    try {
      const { data } = await api.post("/address/add", newAddress);
      if (data.success) {
        toast.success("Address Saved!");
        setNewAddress({ address: "", city: "", state: "", pincode: "", phone: "" });
        await fetchAddresses(); // Refresh list
        // The fetchAddresses logic will handle auto-selecting if needed,
        // but let's force select the new one:
        setSelectedAddressId(data.address._id);
        setShowAddressForm(false);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save address");
    } finally {
      setIsSavingAddress(false);
    }
  };

  // --- 3. Delete Address (Optional Utility) ---
  const handleDeleteAddress = async (id, e) => {
    e.stopPropagation(); // Prevent selecting the card when clicking delete
    if(!window.confirm("Delete this address?")) return;

    try {
      await api.delete(`/address/delete/${id}`);
      toast.success("Address deleted");
      fetchAddresses();
      if(selectedAddressId === id) setSelectedAddressId(null);
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  // --- PAYMENT HANDLER ---
  const handlePayment = async () => {
    // Basic Validation
    if (!selectedAddressId && !showAddressForm) {
      toast.error("Please select a shipping address");
      return;
    }

    // If form is open, force them to save first
    if (showAddressForm) {
      toast.error("Please save your address first");
      return;
    }

    // Get the actual address object from the ID
    const deliveryAddress = savedAddresses.find(a => a._id === selectedAddressId);
    if (!deliveryAddress) {
      toast.error("Invalid address selected");
      return;
    }

    setLoading(true);

    try {
      // 1. Create Order on Backend
      const { data: orderData } = await api.post("/orders/create-order");

      if (!orderData.success) throw new Error("Order creation failed");

      // 2. Options for Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: "INR",
        name: "Arasi Soaps",
        description: "Natural Handmade Soaps",
        order_id: orderData.order.id,
        handler: async function (response) {
          // 3. Verify Payment
          try {
            const verifyRes = await api.post("/orders/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              // Send the selected address details
              shippingAddress: {
                address: deliveryAddress.address,
                city: deliveryAddress.city,
                state: deliveryAddress.state,
                pincode: deliveryAddress.pincode,
                phone: deliveryAddress.phone
              }
            });

            if (verifyRes.data.success) {
              toast.success("Order Placed Successfully!");
              await fetchCart();
              navigate("/orders");
            }
          } catch (error) {
            toast.error("Payment verification failed");
            console.error(error);
          }
        },
        prefill: {
          contact: deliveryAddress.phone,
        },
        theme: {
          color: "#4183cf",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();

    } catch (error) {
      console.error(error);
      toast.error("Something went wrong initializing payment");
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return <div className="pt-24 text-center">Your cart is empty.</div>;
  }

  return (
    <div className="min-h-screen md:pt-52 pt-24 pb-12 bg-slate-50 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT: Shipping Address Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <MapPin className="text-[#4183cf]" />
              <h2 className="text-xl font-bold text-slate-800">Shipping Address</h2>
            </div>

            {/* Show Add Button only if form is closed AND limit of 2 is not reached */}
            {!showAddressForm && savedAddresses.length < 2 && (
              <button
                onClick={() => { setShowAddressForm(true); setSelectedAddressId(null); }}
                className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Plus size={16} /> Add New
              </button>
            )}
          </div>

          {/* LIST SAVED ADDRESSES */}
          {!showAddressForm && (
            <div className="space-y-4 mb-6">
              {savedAddresses.map((addr) => (
                <div
                  key={addr._id}
                  onClick={() => setSelectedAddressId(addr._id)}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedAddressId === addr._id
                      ? "border-blue-500 bg-blue-50/30"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                       selectedAddressId === addr._id ? "border-blue-500" : "border-gray-300"
                    }`}>
                      {selectedAddressId === addr._id && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{addr.address}</p>
                      <p className="text-sm text-slate-500 mt-1">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-sm text-slate-600 mt-2 font-medium">Phone: {addr.phone}</p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteAddress(addr._id, e)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {savedAddresses.length === 0 && (
                <div className="text-center py-8 text-gray-400">No saved addresses found.</div>
              )}
            </div>
          )}

          {/* ADD ADDRESS FORM */}
          {showAddressForm && (
            <form onSubmit={handleSaveAddress} className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-4">
              <h3 className="font-bold text-slate-700 mb-2">Add New Address</h3>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Street Address</label>
                <input
                  name="address" required
                  value={newAddress.address} onChange={handleFormChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="House No, Street, Area"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">City</label>
                  <input
                    name="city" required
                    value={newAddress.city} onChange={handleFormChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">State</label>
                  <input
                    name="state" required
                    value={newAddress.state} onChange={handleFormChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Pincode</label>
                  <input
                    name="pincode" required type="number"
                    value={newAddress.pincode} onChange={handleFormChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Phone</label>
                  <input
                    name="phone" required type="tel"
                    value={newAddress.phone} onChange={handleFormChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                {savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="flex-1 py-2.5 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors text-sm flex justify-center items-center gap-2"
                >
                  {isSavingAddress ? <Loader2 className="animate-spin h-4 w-4" /> : "Save & Use"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* RIGHT: Order Summary */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Order Summary</h2>

          <div className="space-y-4 mb-6 max-h-60 overflow-y-auto custom-scrollbar">
            {cart.items.map((item) => (
              <div key={item._id} className="flex gap-4 items-center">
                <img
                  src={getImageUrl(item.product.images?.[0])}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-md object-cover bg-gray-50"
                  onError={(e) => {e.target.src = "https://via.placeholder.com/150"}}
                />
                <div>
                  <h4 className="font-semibold text-sm text-slate-800">{item.product.name}</h4>
                  <p className="text-xs text-slate-500">
                    Qty: {item.quantity} {item.variant && `| Size: ${item.variant}`}
                  </p>
                </div>
                <div className="ml-auto font-bold text-slate-700">₹{item.price * item.quantity}</div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2 text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{cart.totalAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-slate-900 pt-2">
              <span>Total</span>
              <span>₹{cart.totalAmount}</span>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading || showAddressForm || !selectedAddressId}
            className="w-full mt-6 py-4 bg-[#4183cf] hover:bg-[#357abd] text-white rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />}
            Pay ₹{cart.totalAmount} Securely
          </button>

          <p className="text-xs text-center text-slate-400 mt-4 flex items-center justify-center gap-1">
            <ShieldCheck size={12}/> Secured by Razorpay
          </p>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
