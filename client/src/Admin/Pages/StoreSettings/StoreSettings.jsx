import React, { useState, useEffect } from "react";
import {
  Save,
  Plus,
  Trash2,
  Settings,
  MapPin,
  X,
  AlertCircle,
  Truck,
  Percent,
  ChevronRight
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { INDIAN_STATES } from "@/Data/Data";

const StoreSettings = () => {
  const [loading, setLoading] = useState(true);
  const [gstRate, setGstRate] = useState(0);
  const [defaultShipping, setDefaultShipping] = useState(0);
  const [shippingCharges, setShippingCharges] = useState([]);
  const [selectedState, setSelectedState] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get("/settings");
      if (data.success) {
        setGstRate(data.settings.gstRate || 0);
        setDefaultShipping(data.settings.defaultShippingCharge || 0);

        // Ensure tiers array exists to prevent crashes
        const safeCharges = (data.settings.shippingCharges || []).map(rule => ({
           ...rule,
           tiers: rule.tiers || []
        }));
        setShippingCharges(safeCharges);
      }
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      await api.put("/settings", {
        gstRate,
        defaultShippingCharge: defaultShipping,
        shippingCharges
      });
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  // --- LOGIC HANDLERS ---

  const addStateBlock = () => {
    if (!selectedState) return toast.error("Please select a state first");
    if (shippingCharges.some(s => s.state === selectedState)) return toast.error("Rule already exists for this state");

    setShippingCharges([
        { state: selectedState, tiers: [{ limit: 1, unit: 'kg', price: 0 }] }, // Add to top
        ...shippingCharges
    ]);
    setSelectedState("");
    toast.success(`Added rule for ${selectedState}`);
  };

  const removeStateBlock = (index) => {
    const updated = [...shippingCharges];
    updated.splice(index, 1);
    setShippingCharges(updated);
  };

  const addTier = (stateIndex) => {
    const updated = [...shippingCharges];
    if(!updated[stateIndex].tiers) updated[stateIndex].tiers = [];
    updated[stateIndex].tiers.push({ limit: "", unit: "kg", price: "" });
    setShippingCharges(updated);
  };

  const removeTier = (stateIndex, tierIndex) => {
    const updated = [...shippingCharges];
    if(updated[stateIndex].tiers) {
        updated[stateIndex].tiers.splice(tierIndex, 1);
        setShippingCharges(updated);
    }
  };

  const updateTier = (stateIndex, tierIndex, field, value) => {
    const updated = [...shippingCharges];
    if(updated[stateIndex].tiers && updated[stateIndex].tiers[tierIndex]) {
        updated[stateIndex].tiers[tierIndex][field] = value;
        setShippingCharges(updated);
    }
  };

  const availableStates = INDIAN_STATES.filter(s => !shippingCharges.some(existing => existing.state === s));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3 animate-pulse">
        <div className="w-10 h-10 bg-indigo-200 rounded-full"></div>
        <p className="text-slate-500 font-medium">Loading Configuration...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* --- Header --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Shipping & Taxes</h1>
            <p className="text-slate-500 mt-1">Configure your store's tax rates and regional shipping logic.</p>
          </div>
          <button
            onClick={handleSaveAll}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0"
          >
            <Save size={20}/>
            Save Changes
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* --- LEFT COLUMN: Global Settings --- */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-50 bg-slate-50/50">
                <h2 className="flex items-center gap-2 font-bold text-slate-800">
                  <Settings size={18} className="text-indigo-500"/>
                  Global Defaults
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {/* GST Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                    GST Rate
                    <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Applied on total</span>
                  </label>
                  <div className="relative group">
                    <Percent size={16} className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors"/>
                    <input
                      type="number"
                      value={gstRate}
                      onChange={e => setGstRate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none font-medium text-slate-700"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Default Shipping Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                    Standard Shipping
                    <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Fallback</span>
                  </label>
                  <div className="relative group">
                    <span className="absolute left-3 top-3.5 text-slate-400 font-serif group-focus-within:text-indigo-500 transition-colors">₹</span>
                    <input
                      type="number"
                      value={defaultShipping}
                      onChange={e => setDefaultShipping(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none font-medium text-slate-700"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This amount is charged if the customer's state doesn't have a specific rule below.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: State Rules --- */}
          <div className="lg:col-span-2 space-y-6">

            {/* Add New Rule Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl shadow-slate-200">
              <h2 className="flex items-center gap-2 font-bold text-lg mb-4">
                <MapPin size={20} className="text-indigo-400"/>
                Add Regional Rule
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <select
                    value={selectedState}
                    onChange={e => setSelectedState(e.target.value)}
                    className="w-full appearance-none bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="" className="bg-slate-800 text-slate-400">Select a State...</option>
                    {availableStates.map(s => (
                      <option key={s} value={s} className="bg-slate-800 text-white">{s}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-3.5 pointer-events-none text-white/50">
                    <ChevronRight size={16} className="rotate-90"/>
                  </div>
                </div>
                <button
                  onClick={addStateBlock}
                  disabled={!selectedState}
                  className="bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18}/> Add Rule
                </button>
              </div>
            </div>

            {/* Rules List */}
            <div className="space-y-4">
              {shippingCharges.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center">
                  <div className="bg-slate-50 p-4 rounded-full mb-4">
                    <Truck size={32} className="text-slate-300"/>
                  </div>
                  <h3 className="text-slate-900 font-semibold text-lg">No State Rules Configured</h3>
                  <p className="text-slate-500 max-w-sm mt-1">
                    Customers will be charged the <b>Standard Shipping</b> rate ({defaultShipping}₹) unless you add specific state rules here.
                  </p>
                </div>
              ) : (
                shippingCharges.map((rule, sIndex) => (
                  <div key={sIndex} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 group">

                    {/* Card Header */}
                    <div className="px-6 py-4 flex justify-between items-center bg-slate-50/50 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                          {rule.state.charAt(0)}
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">{rule.state}</h3>
                      </div>
                      <button
                        onClick={() => removeStateBlock(sIndex)}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Delete Rule"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>

                    {/* Tiers Content */}
                    <div className="p-6">
                      {(!rule.tiers || rule.tiers.length === 0) ? (
                         <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <p className="text-sm text-slate-500">No price tiers defined yet.</p>
                            <button onClick={() => addTier(sIndex)} className="mt-2 text-indigo-600 text-sm font-semibold hover:underline">Add First Tier</button>
                         </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Grid Header */}
                          <div className="hidden sm:grid grid-cols-12 gap-4 px-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <div className="col-span-4">Weight Limit</div>
                            <div className="col-span-3">Unit</div>
                            <div className="col-span-4">Shipping Cost</div>
                            <div className="col-span-1"></div>
                          </div>

                          {rule.tiers.map((tier, tIndex) => (
                            <div key={tIndex} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-slate-50 p-3 sm:p-0 sm:bg-transparent rounded-xl">

                              {/* Mobile Label */}
                              <span className="sm:hidden text-xs font-bold text-slate-500 uppercase">Up to Weight:</span>

                              <div className="col-span-4">
                                <input
                                  type="number"
                                  value={tier.limit}
                                  onChange={e => updateTier(sIndex, tIndex, 'limit', e.target.value)}
                                  className="w-full bg-slate-50 sm:bg-white border border-slate-200 sm:border-slate-200 focus:border-indigo-500 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 outline-none transition-colors"
                                  placeholder="e.g. 1"
                                />
                              </div>

                              <div className="col-span-3">
                                <select
                                  value={tier.unit}
                                  onChange={e => updateTier(sIndex, tIndex, 'unit', e.target.value)}
                                  className="w-full bg-slate-50 sm:bg-white border border-slate-200 focus:border-indigo-500 px-2 py-2 rounded-lg text-sm text-slate-700 outline-none cursor-pointer"
                                >
                                  <option value="kg">kg</option>
                                  <option value="g">g</option>
                                  <option value="l">L</option>
                                  <option value="ml">ml</option>
                                </select>
                              </div>

                              {/* Mobile Label */}
                              <span className="sm:hidden text-xs font-bold text-slate-500 uppercase mt-2">Cost:</span>

                              <div className="col-span-4 relative">
                                <span className="absolute left-3 top-2 text-slate-400 text-sm">₹</span>
                                <input
                                  type="number"
                                  value={tier.price}
                                  onChange={e => updateTier(sIndex, tIndex, 'price', e.target.value)}
                                  className="w-full bg-slate-50 sm:bg-white border border-slate-200 focus:border-indigo-500 pl-7 pr-3 py-2 rounded-lg text-sm font-medium text-slate-700 outline-none transition-colors"
                                  placeholder="0"
                                />
                              </div>

                              <div className="col-span-1 flex justify-end">
                                <button
                                  onClick={() => removeTier(sIndex, tIndex)}
                                  className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                                >
                                  <X size={16}/>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Tier Button */}
                      <button
                        onClick={() => addTier(sIndex)}
                        className="mt-4 w-full py-2 flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-dashed border-indigo-200 transition-colors"
                      >
                        <Plus size={16}/> Add Price Tier
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StoreSettings;
