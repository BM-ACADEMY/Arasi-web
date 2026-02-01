import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, MessageSquare, Send, Plus, ChevronLeft, Loader2,
  Check, CheckCheck, HeadphonesIcon, MoreVertical,
  Paperclip, Smile, ArrowLeft
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { io } from "socket.io-client";

// Initialize Socket outside
const socket = io(import.meta.env.VITE_SERVER_URL);

const ComplaintDrawer = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [view, setView] = useState("list"); // list, create, chat
  const [complaints, setComplaints] = useState([]);
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [loading, setLoading] = useState(false);

  // Create Form State
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  // Chat State
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // --- LOGIC SECTION ---
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
        setMessages((prev) => {
          const exists = prev.some(m => m.createdAt === message.createdAt && m.message === message.message);
          if (exists) return prev;
          return [...prev, message];
        });

        // If message is from Admin, mark seen
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

    // NEW: Handle Real-time deletion by Admin
    const handleComplaintDeleted = (deletedId) => {
        setComplaints(prev => prev.filter(c => c._id !== deletedId));
        // If the user is currently viewing the deleted ticket, close it
        if (activeComplaint && activeComplaint._id === deletedId) {
            setActiveComplaint(null);
            setView("list");
            toast.error("This ticket was closed and deleted by support");
        }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messagesRead", handleMessagesRead);
    socket.on("complaintDeleted", handleComplaintDeleted);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messagesRead", handleMessagesRead);
      socket.off("complaintDeleted", handleComplaintDeleted);
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
    if (!message.trim() || !activeComplaint || isSending) return;

    try {
      setIsSending(true);
      const { data } = await api.post(`/complaints/${activeComplaint._id}/message`, {
        message: message.trim(),
      });
      if (data.success) {
        setMessage("");
      }
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
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
      Pending: "text-amber-600 bg-amber-50 border-amber-100",
      "In Progress": "text-blue-600 bg-blue-50 border-blue-100",
      Resolved: "text-emerald-600 bg-emerald-50 border-emerald-100",
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${styles[status] || "text-gray-600 bg-gray-50"}`}>
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
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60] transition-all"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: "circOut", duration: 0.3 }}
            className="fixed top-0 right-0 h-[100dvh] w-full max-w-md bg-[#f0f2f5] shadow-2xl z-[70] flex flex-col font-sans"
          >

            {/* --- HEADER --- */}
            <div className={`flex items-center justify-between px-4 py-3 shadow-md z-20 transition-colors ${view === 'chat' ? 'bg-[#008069] text-white' : 'bg-white text-gray-800 border-b border-gray-100'}`}>
              <div className="flex items-center gap-3">
                {view !== "list" ? (
                  <button
                    onClick={() => { setView("list"); fetchComplaints(); }}
                    className={`p-1.5 rounded-full transition-colors ${view === 'chat' ? 'hover:bg-white/10' : 'hover:bg-gray-100 text-gray-600'}`}
                  >
                    <ArrowLeft size={22} />
                  </button>
                ) : (
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full">
                    <HeadphonesIcon size={20} />
                  </div>
                )}

                <div className="flex flex-col">
                  <h2 className={`font-bold text-base leading-tight ${view === 'chat' ? 'text-white' : 'text-gray-900'}`}>
                    {view === "list" ? "Support Center" : view === "create" ? "New Ticket" : "Support Agent"}
                  </h2>
                  {view === "chat" && activeComplaint && (
                    <span className="text-[10px] text-green-100 opacity-90">
                      Ticket #{activeComplaint._id.slice(-6).toUpperCase()}
                    </span>
                  )}
                  {view === "list" && (
                    <p className="text-[10px] text-gray-500 font-medium">We're here to help</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className={`p-2 rounded-full transition-all ${view === 'chat' ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className={`flex-1 overflow-y-auto relative ${view === 'chat' ? 'bg-[#efeae2]' : 'bg-[#f0f2f5]'}`}
                style={view === 'chat' ? { backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundBlendMode: "overlay" } : {}}
            >

              {/* --- VIEW: LIST --- */}
              {view === "list" && (
                <div className="p-4 space-y-4">
                  {/* Create Button */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setView("create")}
                    className="w-full py-3.5 bg-[#008069] text-white rounded-lg font-semibold shadow-sm flex items-center justify-center gap-2 hover:bg-[#006a57] transition-all"
                  >
                    <Plus size={20} />
                    <span>Open New Ticket</span>
                  </motion.button>

                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">My Tickets</h3>

                    {loading && complaints.length === 0 ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin text-[#008069] w-8 h-8" />
                      </div>
                    ) : complaints.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <MessageSquare size={24} className="text-gray-300" />
                        </div>
                        <p className="text-sm font-medium">No active tickets</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {complaints.map((item) => (
                          <motion.div
                            layoutId={item._id}
                            key={item._id}
                            onClick={() => openChat(item._id)}
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-all relative overflow-hidden active:scale-[0.99]"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-gray-800 text-sm line-clamp-1 pr-8">
                                {item.subject}
                              </h3>
                              {hasUnreadMessages(item) && (
                                <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-[#25D366] rounded-full ring-2 ring-white animate-pulse" />
                              )}
                            </div>

                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                              {item.description}
                            </p>

                            <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                               {getStatusBadge(item.status)}
                               <span className="text-[10px] text-gray-400 font-medium">
                                 {new Date(item.createdAt).toLocaleDateString()}
                               </span>
                            </div>
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
                  <form onSubmit={handleCreateComplaint} className="space-y-5 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Subject</label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#008069] focus:ring-1 focus:ring-[#008069] transition-all"
                        placeholder="E.g. Payment Issue"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Description</label>
                      <textarea
                        rows={6}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#008069] focus:ring-1 focus:ring-[#008069] transition-all resize-none"
                        placeholder="Please describe your issue in detail..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-[#008069] text-white font-bold rounded-lg hover:bg-[#006a57] active:scale-95 transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="animate-spin w-4 h-4" /> Processing...
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
                <div className="flex flex-col h-full">

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {/* System Bubble */}
                    <div className="flex justify-center mb-4">
                        <span className="text-[10px] bg-[#e1f3fb] text-gray-600 px-3 py-1 rounded-lg shadow-sm text-center max-w-[85%] border border-blue-100">
                            <b>Topic:</b> {activeComplaint.subject}
                        </span>
                    </div>

                    {messages.map((msg, idx) => {
                      const isAdmin = msg.sender === "Admin";
                      // User is "Me" (Green), Admin is "Other" (White)
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={idx}
                          className={`flex w-full ${!isAdmin ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`relative max-w-[80%] px-4 py-2 text-sm shadow-sm rounded-lg ${
                            !isAdmin
                              ? "bg-[#d9fdd3] text-gray-900 rounded-tr-none"
                              : "bg-white text-gray-900 rounded-tl-none"
                          }`}>
                            {/* Tail */}
                            <div className={`absolute top-0 w-0 h-0 border-[8px] border-transparent ${
                                !isAdmin
                                  ? "right-[-8px] border-t-[#d9fdd3] border-l-[#d9fdd3]"
                                  : "left-[-8px] border-t-white border-r-white"
                            }`}></div>

                            <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>

                            <div className="flex items-center gap-1 mt-1 justify-end select-none">
                              <span className="text-[10px] text-gray-500">
                                {formatTime(msg.createdAt)}
                              </span>

                              {!isAdmin && (
                                <span className={msg.seen ? "text-[#53bdeb]" : "text-gray-400"}>
                                  {msg.seen ? (
                                    <CheckCheck size={14} />
                                  ) : (
                                    <Check size={14} />
                                  )}
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
                  <div className="p-3 bg-[#f0f2f5] z-20">
                    {activeComplaint.status === "Resolved" ? (
                      <div className="bg-gray-200 rounded-lg p-3 text-center">
                        <p className="text-xs font-semibold text-gray-500 flex items-center justify-center gap-2">
                            <CheckCheck className="text-gray-500" size={14} />
                            Ticket Closed
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                        <div className="flex-1 bg-white rounded-2xl p-1 shadow-sm border border-white focus-within:border-[#008069] transition-all">
                            <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={isSending}
                            className="w-full bg-transparent px-4 py-3 text-sm outline-none text-gray-800 placeholder:text-gray-400"
                            placeholder="Type a message"
                            />
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            type="submit"
                            disabled={!message.trim() || isSending}
                            className="p-3.5 bg-[#008069] text-white rounded-full shadow-md hover:bg-[#006a57] disabled:opacity-50 disabled:shadow-none transition-all flex-shrink-0 flex items-center justify-center"
                        >
                          {isSending ? <Loader2 className="animate-spin w-[18px] h-[18px]" /> : <Send size={18} className="ml-0.5" />}
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
