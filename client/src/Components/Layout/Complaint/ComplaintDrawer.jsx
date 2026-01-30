import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MessageSquare,
  Send,
  Plus,
  ChevronLeft,
  Loader2,
  Check,
  CheckCheck,
  HeadphonesIcon,
  Search
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { io } from "socket.io-client";

// Initialize Socket outside
const socket = io(import.meta.env.VITE_SERVER_URL);

const ComplaintDrawer = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [view, setView] = useState("list");
  const [complaints, setComplaints] = useState([]);
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [loading, setLoading] = useState(false);

  // Create Form State
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  // Chat State
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // --- LOGIC SECTION (Keep exactly as is) ---
  useEffect(() => {
    if (isOpen && user) {
      fetchComplaints();
      setView("list");
    }
  }, [isOpen, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, view]);

  useEffect(() => {
    const handleNewMessage = ({ complaintId, message }) => {
      if (activeComplaint && activeComplaint._id === complaintId) {
        setMessages((prev) => [...prev, message]);
        if (message.sender === "Admin") {
          api.put(`/complaints/${complaintId}/seen`);
        }
      } else {
        fetchComplaints();
      }
    };

    const handleMessagesRead = ({ complaintId, reader }) => {
      if (activeComplaint && activeComplaint._id === complaintId && reader === "Admin") {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.sender === "User" ? { ...msg, seen: true } : msg
          )
        );
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messagesRead", handleMessagesRead);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messagesRead", handleMessagesRead);
    };
  }, [activeComplaint]);

  const fetchComplaints = async () => {
    try {
      if (complaints.length === 0) setLoading(true);
      const { data } = await api.get("/complaints/my");
      if (data.success) setComplaints(data.complaints);
    } catch (error) {
      console.error("Error fetching complaints", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.post("/complaints", { subject, description });
      if (data.success) {
        toast.success("Ticket Created Successfully");
        setSubject("");
        setDescription("");
        await fetchComplaints();
        setView("list");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create complaint");
    } finally {
      setLoading(false);
    }
  };

  const openChat = async (complaintId) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/complaints/${complaintId}`);
      if (data.success) {
        setActiveComplaint(data.complaint);
        setMessages(data.complaint.messages || []);
        setView("chat");
        await api.put(`/complaints/${complaintId}/seen`);
        fetchComplaints();
      }
    } catch (error) {
      toast.error("Failed to load chat");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !activeComplaint) return;
    try {
      const { data } = await api.post(`/complaints/${activeComplaint._id}/message`, {
        message: message.trim(),
      });
      if (data.success) {
        setMessages([...messages, data.data]);
        setMessage("");
      }
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const hasUnreadMessages = (complaint) => {
    if (!complaint.messages || complaint.messages.length === 0) return false;
    const lastMsg = complaint.messages[complaint.messages.length - 1];
    return lastMsg.sender === "Admin" && !lastMsg.seen;
  };

  // --- UI HELPERS ---

  const getStatusBadge = (status) => {
    const styles = {
      Pending: "bg-amber-50 text-amber-600 border-amber-100",
      "In Progress": "bg-blue-50 text-blue-600 border-blue-100",
      Resolved: "bg-emerald-50 text-emerald-600 border-emerald-100",
    };
    const defaultStyle = "bg-gray-50 text-gray-600 border-gray-100";
    
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || defaultStyle}`}>
        {status}
      </span>
    );
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // --- RENDER ---
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-[2px] z-[60] transition-all"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: "0%", opacity: 1 }}
            exit={{ x: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col font-sans border-l border-gray-100"
          >
            {/* 1. GLASS HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100/50 bg-white/80 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-3">
                {view !== "list" ? (
                  <button
                    onClick={() => { setView("list"); fetchComplaints(); }}
                    className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                  >
                    <ChevronLeft size={22} />
                  </button>
                ) : (
                  <div className="p-2 bg-indigo-50 rounded-full text-indigo-600">
                    <HeadphonesIcon size={20} />
                  </div>
                )}
                
                <div>
                  <h2 className="font-bold text-lg text-gray-900 leading-tight">
                    {view === "list" ? "Help Center" : view === "create" ? "New Ticket" : "Support Chat"}
                  </h2>
                  <p className="text-xs text-gray-500 font-medium">
                     {view === "list" ? "We're here to help" : view === "create" ? "Describe your issue" : "Live assistance"}
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* 2. CONTENT AREA */}
            <div className="flex-1 overflow-y-auto bg-slate-50 relative scrollbar-hide">
              
              {/* --- VIEW: LIST --- */}
              {view === "list" && (
                <div className="p-5 space-y-6">
                  {/* Create Button */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setView("create")}
                    className="w-full py-4 bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all"
                  >
                    <Plus size={20} /> 
                    <span>Open New Ticket</span>
                  </motion.button>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Recent Tickets</h3>
                    
                    {loading && complaints.length === 0 ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
                      </div>
                    ) : complaints.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <MessageSquare size={24} className="text-gray-300" />
                        </div>
                        <p className="text-sm font-medium">No active tickets</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {complaints.map((item) => (
                          <motion.div
                            layoutId={item._id}
                            key={item._id}
                            onClick={() => openChat(item._id)}
                            className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 cursor-pointer transition-all relative overflow-hidden"
                          >
                            {/* Unread Indicator */}
                            {hasUnreadMessages(item) && (
                              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full m-4 ring-2 ring-white z-10" />
                            )}
                            
                            <div className="flex justify-between items-start mb-3">
                              {getStatusBadge(item.status)}
                              <span className="text-[10px] font-medium text-gray-400">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <h3 className="font-semibold text-gray-800 text-sm mb-1 group-hover:text-indigo-600 transition-colors">
                              {item.subject}
                            </h3>
                            <p className="text-xs text-gray-500 line-clamp-1 leading-relaxed">
                              {item.description}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* --- VIEW: CREATE --- */}
              {view === "create" && (
                <div className="p-6">
                  <form onSubmit={handleCreateComplaint} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Subject</label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                        placeholder="Briefly summarize the issue"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        rows={6}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none shadow-sm"
                        placeholder="Please provide details..."
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="animate-spin w-4 h-4" /> Creating...
                        </div>
                      ) : (
                        "Submit Ticket"
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* --- VIEW: CHAT --- */}
              {view === "chat" && activeComplaint && (
                <div className="flex flex-col h-full bg-slate-50">
                  {/* Chat Info Banner */}
                  <div className="px-6 py-3 bg-white border-b border-gray-100 shadow-sm z-10 flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-semibold uppercase">Ticket ID: #{activeComplaint._id.slice(-6)}</span>
                        <h3 className="font-bold text-gray-800 text-sm">{activeComplaint.subject}</h3>
                     </div>
                     {getStatusBadge(activeComplaint.status)}
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {/* Intro Date */}
                    <div className="flex justify-center">
                        <span className="text-[10px] bg-gray-200/50 text-gray-500 px-3 py-1 rounded-full font-medium">
                            {new Date(activeComplaint.createdAt).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                        </span>
                    </div>

                    {messages.map((msg, idx) => {
                      const isAdmin = msg.sender === "Admin";
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={idx}
                          className={`flex w-full ${isAdmin ? "justify-start" : "justify-end"}`}
                        >
                          <div className={`flex flex-col ${isAdmin ? "items-start" : "items-end"} max-w-[85%]`}>
                            <div
                              className={`p-3.5 sm:p-4 text-sm leading-relaxed shadow-sm relative ${
                                isAdmin
                                  ? "bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-none"
                                  : "bg-indigo-600 text-white rounded-2xl rounded-tr-none"
                              }`}
                            >
                              <p>{msg.message}</p>
                            </div>
                            
                            {/* Meta Data */}
                            <div className="flex items-center gap-1.5 mt-1.5 px-1">
                              <span className="text-[10px] font-medium text-gray-400">
                                {formatTime(msg.createdAt)}
                              </span>
                              {!isAdmin && (
                                <span className={msg.seen ? "text-indigo-600" : "text-gray-300"}>
                                  {msg.seen ? <CheckCheck size={14} /> : <Check size={14} />}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 pb-safe">
                    {activeComplaint.status === "Resolved" ? (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                        <p className="text-xs font-semibold text-gray-500 flex items-center justify-center gap-2">
                            <CheckCheck className="text-green-500" size={14} />
                            This ticket has been marked as Resolved
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                        <div className="flex-1 bg-gray-100 rounded-2xl p-1 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-white transition-all border border-transparent focus-within:border-indigo-100">
                            <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-transparent p-3 text-sm outline-none text-gray-800 placeholder:text-gray-400"
                            placeholder="Type your message..."
                            />
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            type="submit"
                            disabled={!message.trim()}
                            className="p-3.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all"
                        >
                          <Send size={18} />
                        </motion.button>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ComplaintDrawer;