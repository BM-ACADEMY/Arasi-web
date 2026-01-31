import React, { useState, useEffect } from "react";
import { Save, Plus, Trash2, Truck, Percent, MapPin, Settings2, AlertCircle } from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { INDIAN_STATES } from "@/Data/Data";

const StoreSettings = () => {
  const [loading, setLoading] = useState(true);
  const [gstRate, setGstRate] = useState(0);
  const [defaultShipping, setDefaultShipping] = useState(0);
  const [shippingCharges, setShippingCharges] = useState([]);

  const [newState, setNewState] = useState("");
  const [newCharge, setNewCharge] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get("/settings");
      if (data.success) {
        setGstRate(data.settings.gstRate);
        setShippingCharges(data.settings.shippingCharges);
        setDefaultShipping(data.settings.defaultShippingCharge);
      }
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeneral = async () => {
    try {
      await api.put("/settings", { gstRate, defaultShippingCharge: defaultShipping });
      toast.success("General settings updated");
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const handleAddStateCharge = async (e) => {
    e.preventDefault();
    if (!newState || !newCharge) return toast.error("Select state and enter charge");

    // Check for duplicate state
    if (shippingCharges.some(s => s.state === newState)) {
        return toast.error("Rule for this state already exists. Delete it first to update.");
    }

    const updatedCharges = [...shippingCharges, { state: newState, charge: Number(newCharge) }];

    try {
      await api.put("/settings", { shippingCharges: updatedCharges });
      setShippingCharges(updatedCharges);
      setNewState("");
      setNewCharge("");
      toast.success("State charge added");
    } catch (error) {
      toast.error("Failed to add charge");
    }
  };

  const handleDeleteStateCharge = async (stateName) => {
    if(!window.confirm(`Remove shipping rule for ${stateName}?`)) return;

    const updatedCharges = shippingCharges.filter((s) => s.state !== stateName);
    try {
      await api.put("/settings", { shippingCharges: updatedCharges });
      setShippingCharges(updatedCharges);
      toast.success("State charge removed");
    } catch (error) {
      toast.error("Failed to remove charge");
    }
  };

  // Filter out states that already have a rule
  const availableStates = INDIAN_STATES.filter(
    state => !shippingCharges.some(charge => charge.state === state)
  );

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-gray-50/50 min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Store Configuration</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage taxes, global delivery fees, and state-specific exceptions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* --- LEFT COLUMN: General Settings --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Settings2 size={20} />
              </div>
              <h2 className="font-semibold text-gray-900">General Defaults</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* GST Input */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Percent size={16} className="text-gray-400" /> GST Percentage
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={gstRate}
                    onChange={(e) => setGstRate(e.target.value)}
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">%</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  This percentage is calculated on the subtotal of all orders automatically.
                </p>
              </div>

              <hr className="border-gray-100" />

              {/* Default Shipping Input */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Truck size={16} className="text-gray-400" /> Standard Delivery
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={defaultShipping}
                    onChange={(e) => setDefaultShipping(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Fallback shipping charge for locations without a specific rule.
                </p>
              </div>

              <button
                onClick={handleSaveGeneral}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3.5 rounded-xl font-medium hover:bg-black active:scale-[0.98] transition-all shadow-lg shadow-gray-200"
              >
                <Save size={18} /> Save Defaults
              </button>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: State Rules --- */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <MapPin size={20} />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Regional Exceptions</h2>
                  <p className="text-xs text-gray-500 hidden sm:block">Override shipping costs for specific states</p>
                </div>
              </div>
              <div className="text-xs font-medium bg-white px-3 py-1 border border-gray-200 rounded-full text-gray-600">
                {shippingCharges.length} Active Rules
              </div>
            </div>

            {/* Add Rule Form */}
            <div className="p-6 bg-white border-b border-gray-100">
              <form onSubmit={handleAddStateCharge} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <select
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="w-full h-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none text-sm text-gray-700 cursor-pointer"
                  >
                    <option value="">Select State / Region</option>
                    {availableStates.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>

                <div className="relative sm:w-32">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Charge"
                    value={newCharge}
                    onChange={(e) => setNewCharge(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!newState || !newCharge}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Plus size={18} /> <span className="hidden sm:inline">Add Rule</span>
                </button>
              </form>
            </div>

            {/* List Area */}
            <div className="flex-1 overflow-y-auto max-h-[500px]">
              {shippingCharges.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center px-6">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Truck className="text-gray-300" size={32} />
                  </div>
                  <h3 className="text-gray-900 font-medium">No Specific Rules Yet</h3>
                  <p className="text-gray-500 text-sm mt-1 max-w-xs">
                    All states currently use the default shipping charge of <b>₹{defaultShipping}</b>.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {shippingCharges.map((item, index) => (
                    <div
                      key={index}
                      className="group flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                          {item.state.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.state}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Shipping Override</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-bold text-gray-900">₹{item.charge}</p>
                          {item.charge === 0 && <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">FREE</span>}
                        </div>
                        <button
                          onClick={() => handleDeleteStateCharge(item.state)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Remove Rule"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Tip */}
            {shippingCharges.length > 0 && (
               <div className="p-4 bg-yellow-50/50 border-t border-yellow-100 flex gap-3 text-xs text-yellow-700">
                 <AlertCircle size={16} className="shrink-0" />
                 <p>States not listed here will use the "Standard Delivery" rate of ₹{defaultShipping}.</p>
               </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StoreSettings;
