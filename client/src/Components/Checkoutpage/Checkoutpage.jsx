import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Loader2, ShieldCheck, MapPin } from "lucide-react";

const CheckoutPage = () => {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Address State
  const [address, setAddress] = useState({
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: ""
  });

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  // --- PAYMENT HANDLER ---
  const handlePayment = async (e) => {
    e.preventDefault();
    
    // Basic Validation
    if (!address.address || !address.phone || !address.pincode) {
      toast.error("Please fill all address fields");
      return;
    }

    setLoading(true);

    try {
      // 1. Create Order on Backend
      const { data: orderData } = await api.post("/orders/create-order");
      
      if (!orderData.success) {
        throw new Error("Order creation failed");
      }

      // 2. Options for Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Use your Public Key ID here
        amount: orderData.order.amount,
        currency: "INR",
        name: "Arasi Soaps",
        description: "Natural Handmade Soaps",
        order_id: orderData.order.id, // Razorpay Order ID from backend
        handler: async function (response) {
          // 3. Verify Payment on Backend
          try {
            const verifyRes = await api.post("/orders/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              shippingAddress: address
            });

            if (verifyRes.data.success) {
              toast.success("Order Placed Successfully!");
              await fetchCart(); // Refresh empty cart
              navigate("/orders"); // Navigate to Order History page (create this later)
            }
          } catch (error) {
            toast.error("Payment verification failed");
            console.error(error);
          }
        },
        prefill: {
          contact: address.phone,
        },
        theme: {
          color: "#4183cf",
        },
      };

      // 4. Open Razorpay Window
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
    <div className="min-h-screen pt-24 pb-12 bg-slate-50 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT: Shipping Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="text-[#4183cf]" />
            <h2 className="text-xl font-bold text-slate-800">Shipping Address</h2>
          </div>
          
          <form id="checkout-form" onSubmit={handlePayment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
              <input 
                name="address" required 
                value={address.address} onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="123 Main St, Apartment 4B"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <input 
                  name="city" required 
                  value={address.city} onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                <input 
                  name="state" required 
                  value={address.state} onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
                <input 
                  name="pincode" required type="number"
                  value={address.pincode} onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input 
                  name="phone" required type="tel"
                  value={address.phone} onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
            </div>
          </form>
        </div>

        {/* RIGHT: Order Summary */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Order Summary</h2>
          
          <div className="space-y-4 mb-6 max-h-60 overflow-y-auto custom-scrollbar">
            {cart.items.map((item) => (
              <div key={item._id} className="flex gap-4 items-center">
                <img 
                  src={item.product.images?.[0] || ""} 
                  alt={item.product.name} 
                  className="w-16 h-16 rounded-md object-cover bg-gray-50"
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
            type="submit" 
            form="checkout-form"
            disabled={loading}
            className="w-full mt-6 py-4 bg-[#4183cf] hover:bg-[#357abd] text-white rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
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