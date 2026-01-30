import React, { useState, useEffect } from "react";
import api from "@/services/api"; // Adjust path to your api.js
import { Send, MessageSquare, AlertCircle, CheckCircle, History } from "lucide-react";
import toast from "react-hot-toast";

const RaiseComplaint = () => {
  const [activeTab, setActiveTab] = useState("raise"); // 'raise' or 'history'
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  
  // Form State
  const [formData, setFormData] = useState({
    type: "Complaint", // Default
    subject: "",
    description: "",
  });

  // Fetch History
  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/complaints/my");
      if (res.data.success) {
        setHistory(res.data.complaints);
      }
    } catch (error) {
      console.error("Error fetching history", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.description) return toast.error("Please fill all fields");

    setLoading(true);
    try {
      const res = await api.post("/complaints", formData);
      if (res.data.success) {
        toast.success("Submitted successfully!");
        setFormData({ type: "Complaint", subject: "", description: "" });
        setActiveTab("history"); // Switch to history to show the new item
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen bg-gray-50 mt-10 rounded-xl shadow-sm border border-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <MessageSquare className="w-8 h-8 text-indigo-600" />
          Help & Support
        </h1>
        <p className="text-gray-500 mt-2">Have a concern or a bright idea? Let us know.</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("raise")}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === "raise" ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Raise Ticket
          {activeTab === "raise" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-md"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === "history" ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          My History
          {activeTab === "history" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-md"></span>
          )}
        </button>
      </div>

      {/* --- FORM SECTION --- */}
      {activeTab === "raise" && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
            <div className="flex gap-4">
              {["Complaint", "Suggestion"].map((type) => (
                <label
                  key={type}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.type === type
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={formData.type === type}
                    onChange={handleChange}
                    className="hidden"
                  />
                  {type === "Complaint" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Brief summary of the issue..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              placeholder="Please describe your concern in detail..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Send className="w-5 h-5" /> Submit Ticket
              </>
            )}
          </button>
        </form>
      )}

      {/* --- HISTORY SECTION --- */}
      {activeTab === "history" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {history.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No tickets raised yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {history.map((item) => (
                <div key={item._id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                          item.type === "Complaint"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {item.type}
                      </span>
                      <h3 className="font-bold text-gray-800">{item.subject}</h3>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${
                        item.status === "Resolved"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                          : "bg-yellow-50 text-yellow-600 border-yellow-200"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                  <div className="text-xs text-gray-400">
                    Raised on: {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RaiseComplaint;