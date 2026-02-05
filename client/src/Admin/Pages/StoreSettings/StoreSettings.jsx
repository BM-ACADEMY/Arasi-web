import React, { useState, useEffect } from "react";
import { Save, Plus, Trash2, Settings2, MapPin, X, AlertCircle } from "lucide-react";
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
        
        // --- CRITICAL FIX: Add default empty array for tiers to prevent crash ---
        const safeCharges = (data.settings.shippingCharges || []).map(rule => ({
           ...rule,
           tiers: rule.tiers || [] 
        }));
        setShippingCharges(safeCharges);
        // -----------------------------------------------------------------------
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
      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  // --- LOGIC HANDLERS ---

  const addStateBlock = () => {
    if (!selectedState) return toast.error("Select a state first");
    if (shippingCharges.some(s => s.state === selectedState)) return toast.error("Rule exists for this state");

    setShippingCharges([
        ...shippingCharges, 
        // Initialize with one empty tier
        { state: selectedState, tiers: [{ limit: 1, unit: 'kg', price: 0 }] }
    ]);
    setSelectedState("");
  };

  const removeStateBlock = (index) => {
    const updated = [...shippingCharges];
    updated.splice(index, 1);
    setShippingCharges(updated);
  };

  const addTier = (stateIndex) => {
    const updated = [...shippingCharges];
    // Ensure array exists
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

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center">Loading...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-gray-50/50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Store Configuration</h1>
        <button onClick={handleSaveAll} className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition">
            <Save size={18}/> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: General Settings */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="flex items-center gap-2 font-bold text-gray-800 mb-4 pb-2 border-b"><Settings2 size={20}/> Global Defaults</h2>
            
            <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-600 mb-1">GST Rate (%)</label>
                <input type="number" value={gstRate} onChange={e => setGstRate(e.target.value)} className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-100" />
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Standard Shipping (₹)</label>
                <input type="number" value={defaultShipping} onChange={e => setDefaultShipping(e.target.value)} className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-100" />
                <p className="text-xs text-gray-400 mt-2">Applied if no state rule matches.</p>
            </div>
          </div>
        </div>

        {/* RIGHT: State Rules */}
        <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="flex items-center gap-2 font-bold text-gray-800 mb-6"><MapPin size={20}/> Weight-Based Shipping Rules</h2>
                
                {/* Add New State */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8 bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <select value={selectedState} onChange={e => setSelectedState(e.target.value)} className="flex-1 p-2.5 rounded-lg border border-blue-200 outline-none">
                        <option value="">Select State to Configure</option>
                        {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={addStateBlock} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
                        <Plus size={18}/> Add Rule
                    </button>
                </div>

                {/* State List */}
                <div className="space-y-6">
                    {shippingCharges.map((rule, sIndex) => (
                        <div key={sIndex} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b border-gray-200">
                                <h3 className="font-bold text-gray-800">{rule.state}</h3>
                                <button onClick={() => removeStateBlock(sIndex)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"><Trash2 size={16}/></button>
                            </div>
                            
                            <div className="p-4 bg-white">
                                {(!rule.tiers || rule.tiers.length === 0) && (
                                    <p className="text-sm text-gray-400 mb-2 italic">No price tiers defined yet.</p>
                                )}
                                
                                {rule.tiers && rule.tiers.length > 0 && (
                                    <div className="grid grid-cols-12 gap-2 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        <div className="col-span-4">Max Weight</div>
                                        <div className="col-span-3">Unit</div>
                                        <div className="col-span-4">Price (₹)</div>
                                        <div className="col-span-1"></div>
                                    </div>
                                )}

                                {/* Safe Map logic */}
                                {(rule.tiers || []).map((tier, tIndex) => (
                                    <div key={tIndex} className="grid grid-cols-12 gap-2 mb-3 items-center">
                                        <div className="col-span-4">
                                            <input type="number" value={tier.limit} onChange={e => updateTier(sIndex, tIndex, 'limit', e.target.value)} className="w-full border p-2 rounded text-sm" placeholder="e.g. 1"/>
                                        </div>
                                        <div className="col-span-3">
                                            <select value={tier.unit} onChange={e => updateTier(sIndex, tIndex, 'unit', e.target.value)} className="w-full border p-2 rounded text-sm bg-white">
                                                <option value="kg">kg</option>
                                                <option value="g">g</option>
                                                <option value="ml">ml</option>
                                                <option value="l">l</option>
                                            </select>
                                        </div>
                                        <div className="col-span-4 relative">
                                            <span className="absolute left-2 top-2 text-gray-400 text-sm">₹</span>
                                            <input type="number" value={tier.price} onChange={e => updateTier(sIndex, tIndex, 'price', e.target.value)} className="w-full border p-2 pl-5 rounded text-sm" placeholder="50"/>
                                        </div>
                                        <div className="col-span-1 text-right">
                                            <button onClick={() => removeTier(sIndex, tIndex)} className="text-gray-400 hover:text-red-500 transition"><X size={16}/></button>
                                        </div>
                                    </div>
                                ))}

                                <button onClick={() => addTier(sIndex)} className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition">
                                    <Plus size={12}/> Add Price Tier
                                </button>
                            </div>
                        </div>
                    ))}
                    {shippingCharges.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                            <AlertCircle className="text-gray-300 mb-2" size={32}/>
                            <p className="text-gray-500 text-sm">No specific state rules added yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StoreSettings;