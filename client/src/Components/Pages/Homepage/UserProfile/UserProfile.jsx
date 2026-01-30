import React, { useEffect, useState } from "react";
import api from "@/services/api"; // Adjust path to your api service
import { User, Mail, Phone, MapPin, Calendar, Shield, Package, Edit2, Save, X } from "lucide-react";
import toast from "react-hot-toast";

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/profile");
      if (res.data.success) {
        setProfile(res.data.user);
        setEditName(res.data.user.name);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Could not load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim()) return toast.error("Name cannot be empty");
    
    setUpdating(true);
    try {
      const res = await api.put("/auth/profile", { name: editName });
      if (res.data.success) {
        toast.success("Profile updated successfully!");
        setProfile({ ...profile, name: editName });
        setIsEditing(false);
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!profile) return <div className="p-8 text-center text-red-500 pt-24">Profile not found.</div>;

  return (
    // Added 'pt-24' to fix the "hiding top" issue
    <div className="bg-gray-50 pt-36 min-h-screen pt-24 pb-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>

          <div className="relative z-10 w-28 h-28 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 border-4 border-white shadow-md">
            <span className="text-5xl font-bold">{profile.name?.charAt(0).toUpperCase()}</span>
          </div>

          <div className="text-center md:text-left flex-1 relative z-10">
            <div className="flex items-center justify-center md:justify-start gap-3">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-2xl font-bold text-gray-800 border-b-2 border-indigo-500 focus:outline-none bg-transparent px-1 py-0.5"
                    autoFocus
                  />
                  <button 
                    onClick={handleUpdateProfile}
                    disabled={updating}
                    className="p-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                  >
                    <Save size={18} />
                  </button>
                  <button 
                    onClick={() => { setIsEditing(false); setEditName(profile.name); }}
                    className="p-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-gray-800">{profile.name}</h1>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                </>
              )}
            </div>

            <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2 mt-2 font-medium">
              <Mail className="w-4 h-4" /> {profile.email}
            </p>

            <div className="mt-5 flex flex-wrap gap-3 justify-center md:justify-start">
               <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-100 flex items-center gap-1">
                 <Shield className="w-3 h-3" /> {profile.role}
               </span>
               <span className="px-3 py-1 rounded-full bg-gray-50 text-gray-600 text-xs font-medium border border-gray-200 flex items-center gap-1">
                 <Calendar className="w-3 h-3" /> Joined: {new Date(profile.createdAt || profile.joinedAt).toLocaleDateString()}
               </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Account Details */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-3">
                <User className="w-5 h-5 text-indigo-600" /> Account Details
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Full Name</label>
                  <p className="font-medium text-gray-800 mt-1">{profile.name}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Email Address</label>
                  <div className="flex items-center justify-between mt-1 group">
                     <p className="font-medium text-gray-800">{profile.email}</p>
                     <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition">ReadOnly</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Account Status</label>
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1 text-green-700 font-bold text-sm bg-green-50 px-2 py-1 rounded border border-green-100">
                      Verified Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Address Book */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-full">
              <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-600" /> Saved Addresses
                </h2>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {profile.addresses?.length || 0} Saved
                </span>
              </div>
              
              {(!profile.addresses || profile.addresses.length === 0) ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 font-medium">No address history found.</p>
                  <p className="text-xs text-gray-400 mt-1">Your shipping details will be saved here after your first order.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.addresses.map((addr, index) => (
                    <div key={index} className="p-4 rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-md transition bg-gray-50/50 hover:bg-white relative group">
                      <div className="flex items-start justify-between mb-3">
                         <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white rounded-full border border-gray-200 text-gray-500">
                               <MapPin size={14} />
                            </div>
                            <span className="text-xs font-bold text-gray-500 uppercase">Address #{index + 1}</span>
                         </div>
                         {index === 0 && (
                           <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">LATEST</span>
                         )}
                      </div>
                      
                      <p className="font-semibold text-gray-800 line-clamp-2 min-h-[3rem]">
                        {addr.address}
                      </p>
                      
                      <div className="mt-3 text-sm text-gray-600 space-y-1">
                        <p>{addr.city}, {addr.state}</p>
                        <p className="font-mono text-xs text-gray-500">PIN: {addr.pincode}</p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-sm">
                         <Phone size={14} className="text-gray-400" />
                         <span className="font-medium text-gray-700">{addr.phone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserProfile;