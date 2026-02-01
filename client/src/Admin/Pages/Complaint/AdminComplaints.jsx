import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, CheckCircle, Clock, MessageSquare, Send, X, User,
  Check, CheckCheck, ChevronRight, Bell, Loader2, MoreVertical,
  ArrowLeft, Paperclip, Smile, Trash2
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// Initialize Socket
const socket = io(import.meta.env.VITE_SERVER_URL);

const AdminComplaints = () => {
  // --- STATE MANAGEMENT ---
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [hasNewNotification, setHasNewNotification] = useState(false);

  // Chat State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [isSending, setIsSending] = useState(false); // Lock for send button
  const [showStatusMenu, setShowStatusMenu] = useState(false); // Mobile status menu toggle
  const messagesEndRef = useRef(null);

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    fetchComplaints();
  }, []);

  // --- SOCKET LISTENERS ---
  useEffect(() => {
    const handleNewComplaint = (data) => {
      toast.success(`New Ticket: ${data.userName}`, { icon: '🔔' });
      setHasNewNotification(true);
      fetchComplaints();
    };

    const handleNewMessage = ({ complaintId, message }) => {
      // If chat is open for this ticket, append message
      if (selectedComplaint && selectedComplaint._id === complaintId) {
        setMessages((prev) => {
          // Prevent duplicates
          const exists = prev.some(m => m.createdAt === message.createdAt && m.message === message.message);
          if (exists) return prev;
          return [...prev, message];
        });

        // Mark user message as seen immediately if we are looking at it
        if (message.sender === "User") {
          api.put(`/complaints/${complaintId}/seen`);
        }
      } else {
        // If chat not open, just refresh list and show notification dot
        fetchComplaints();
        setHasNewNotification(true);
      }
    };

    const handleMessagesRead = ({ complaintId, reader }) => {
      if (selectedComplaint && selectedComplaint._id === complaintId && reader === "User") {
        setMessages(prev => prev.map(msg =>
          msg.sender === "Admin" ? { ...msg, seen: true } : msg
        ));
      }
    };

    // NEW: Handle Real-time Deletion
    const handleComplaintDeleted = (deletedId) => {
      setComplaints(prev => prev.filter(c => c._id !== deletedId));
      if (selectedComplaint && selectedComplaint._id === deletedId) {
        setSelectedComplaint(null);
        toast.error("Ticket deleted");
      }
    };

    socket.on("newComplaint", handleNewComplaint);
    socket.on("newMessage", handleNewMessage);
    socket.on("messagesRead", handleMessagesRead);
    socket.on("complaintDeleted", handleComplaintDeleted);

    return () => {
      socket.off("newComplaint");
      socket.off("newMessage");
      socket.off("messagesRead");
      socket.off("complaintDeleted");
    };
  }, [selectedComplaint]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (selectedComplaint) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedComplaint]);

  // --- API HANDLERS ---
  const fetchComplaints = async () => {
    try {
      if (complaints.length === 0) setLoading(true);
      const { data } = await api.get("/complaints/admin/all");
      if (data.success) setComplaints(data.complaints);
    } catch (error) {
      console.error("Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  const openComplaintDrawer = async (id) => {
    try {
      const ticket = complaints.find(c => c._id === id);
      if(ticket) setSelectedComplaint(ticket);

      const { data } = await api.get(`/complaints/${id}`);
      if (data.success) {
        setSelectedComplaint(data.complaint);
        setMessages(data.complaint.messages || []);
        await api.put(`/complaints/${id}/seen`);
        fetchComplaints();
      }
    } catch (error) {
      toast.error("Failed to load details");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !selectedComplaint || isSending) return;

    try {
      setIsSending(true);
      const { data } = await api.post(`/complaints/${selectedComplaint._id}/message`, { message: reply.trim() });
      if (data.success) {
        setReply("");
        if (selectedComplaint.status === "Pending") {
          handleStatusUpdate(selectedComplaint._id, "In Progress");
        }
      }
    } catch (error) {
      toast.error("Failed to send");
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const { data } = await api.put(`/complaints/admin/${id}`, { status: newStatus });
      if (data.success) {
        toast.success(`Ticket marked as ${newStatus}`);
        setComplaints(prev => prev.map(c => c._id === id ? { ...c, status: newStatus } : c));
        if (selectedComplaint && selectedComplaint._id === id) {
          setSelectedComplaint(prev => ({ ...prev, status: newStatus }));
        }
        setShowStatusMenu(false);
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteComplaint = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ticket? All conversations will be permanently lost.")) {
      return;
    }

    try {
      const { data } = await api.delete(`/complaints/admin/${id}`);
      if (data.success) {
        toast.success("Ticket deleted successfully");
        // Socket listener will handle state update for all connected admins
        // But we can do it optimistically here too
        setComplaints(prev => prev.filter(c => c._id !== id));
        if (selectedComplaint && selectedComplaint._id === id) {
          setSelectedComplaint(null);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete ticket");
    }
  };

  // --- HELPER FUNCTIONS ---
  const hasUnreadMessages = (ticket) => {
    if (!ticket.messages || ticket.messages.length === 0) return false;
    const lastMsg = ticket.messages[ticket.messages.length - 1];
    return lastMsg.sender === "User" && !lastMsg.seen;
  };

  const filteredComplaints = complaints.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) || ticket._id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "text-amber-600 bg-amber-50 border-amber-200";
      case "In Progress": return "text-blue-600 bg-blue-50 border-blue-200";
      case "Resolved": return "text-emerald-600 bg-emerald-50 border-emerald-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] p-4 md:p-6 font-sans">

      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Support Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage customer conversations</p>
        </div>

        <button
          onClick={() => setHasNewNotification(false)}
          className="relative p-2.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-all self-start md:self-auto"
        >
          <Bell size={20} className="text-gray-600" />
          {hasNewNotification && (
            <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          )}
        </button>
      </div>

      {/* --- STATS OVERVIEW --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", count: complaints.length, icon: MessageSquare, color: "bg-blue-500" },
          { label: "Pending", count: complaints.filter(c => c.status === "Pending").length, icon: Clock, color: "bg-amber-500" },
          { label: "Active", count: complaints.filter(c => c.status === "In Progress").length, icon: Loader2, color: "bg-indigo-500" },
          { label: "Resolved", count: complaints.filter(c => c.status === "Resolved").length, icon: CheckCircle, color: "bg-emerald-500" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition-shadow hover:shadow-md">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{stat.count}</h3>
            </div>
            <div className={`p-3 rounded-xl ${stat.color} text-white shadow-sm`}>
              <stat.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* --- MAIN TABLE SECTION --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 bg-gray-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search tickets by ID or Subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008069]/20 focus:border-[#008069] transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-gray-200 text-sm rounded-lg p-2.5 focus:outline-none focus:border-[#008069] cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* List */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Ticket Info</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">User</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                 <tr><td colSpan="4" className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-[#008069] w-8 h-8" /></td></tr>
              ) : filteredComplaints.length === 0 ? (
                 <tr><td colSpan="4" className="p-12 text-center text-gray-400 font-medium">No tickets found</td></tr>
              ) : (
                filteredComplaints.map((ticket) => (
                  <tr
                    key={ticket._id}
                    onClick={() => openComplaintDrawer(ticket._id)}
                    className="group hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                         <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${hasUnreadMessages(ticket) ? "bg-[#25D366] shadow-sm shadow-green-200 animate-pulse" : "bg-gray-200"}`} />
                         <div className="max-w-[250px]">
                            <span className="text-xs font-mono text-gray-400 font-medium">#{ticket._id.slice(-6).toUpperCase()}</span>
                            <p className="font-semibold text-gray-800 text-sm truncate group-hover:text-[#008069] transition-colors">
                              {ticket.subject}
                            </p>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 border border-white shadow-sm">
                          {ticket.user?.name?.[0] || "U"}
                        </div>
                        <div className="max-w-[150px]">
                          <p className="font-medium text-gray-700 text-sm truncate">{ticket.user?.name || "Unknown User"}</p>
                          <p className="text-xs text-gray-400 truncate">{ticket.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(ticket.status)} bg-opacity-10 whitespace-nowrap`}>
                         {ticket.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                       <div className="flex items-center justify-end gap-3">
                          <div className="text-right">
                              <p className="text-xs text-gray-500 font-medium">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{new Date(ticket.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                          </div>

                          <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteComplaint(ticket._id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                            title="Delete Ticket"
                          >
                             <Trash2 size={16} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- WHATSAPP STYLE CHAT DRAWER --- */}
      <AnimatePresence>
        {selectedComplaint && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedComplaint(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", ease: "circOut", duration: 0.3 }}
              className="fixed top-0 right-0 h-[100dvh] w-full md:w-[600px] bg-[#efeae2] shadow-2xl z-50 flex flex-col"
              style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundBlendMode: "overlay" }}
            >

              {/* 1. HEADER (WhatsApp Green) */}
              <div className="bg-[#008069] px-4 py-3 flex items-center justify-between shadow-md z-10 text-white">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedComplaint(null)} className="mr-1 hover:bg-white/10 p-1 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                  </button>

                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold border border-white/30">
                    {selectedComplaint.user?.name?.[0] || "U"}
                  </div>

                  <div className="flex flex-col">
                    <h2 className="font-semibold text-base leading-tight truncate max-w-[150px] sm:max-w-xs">
                      {selectedComplaint.user?.name || "Unknown User"}
                    </h2>
                    <span className="text-xs text-green-100 opacity-90 truncate w-40">
                      #{selectedComplaint._id.slice(-6).toUpperCase()} • {selectedComplaint.subject}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status Actions (Desktop) */}
                  <div className="hidden sm:flex bg-[#006a57] rounded-lg p-1">
                     {["Pending", "In Progress", "Resolved"].map((s) => (
                       <button
                         key={s}
                         onClick={() => handleStatusUpdate(selectedComplaint._id, s)}
                         className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${
                            selectedComplaint.status === s ? "bg-white text-[#008069] shadow-sm" : "text-green-100 hover:bg-white/10"
                         }`}
                       >
                         {s === "In Progress" ? "Active" : s}
                       </button>
                     ))}
                  </div>

                  <button
                    onClick={() => handleDeleteComplaint(selectedComplaint._id)}
                    className="p-2 hover:bg-white/10 rounded-full text-white/90 hover:text-white transition-all"
                    title="Delete Ticket"
                  >
                    <Trash2 size={20} />
                  </button>

                  {/* Mobile Menu for Status */}
                  <div className="sm:hidden relative">
                    <button onClick={() => setShowStatusMenu(!showStatusMenu)} className="p-2 hover:bg-white/10 rounded-full">
                       <MoreVertical size={24} />
                    </button>
                    {showStatusMenu && (
                      <div className="absolute right-0 top-12 bg-white rounded-lg shadow-xl py-2 w-48 border border-gray-100 text-gray-800 animate-in fade-in slide-in-from-top-2 z-50">
                        <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Set Status</p>
                        {["Pending", "In Progress", "Resolved"].map((s) => (
                           <button
                             key={s}
                             onClick={() => handleStatusUpdate(selectedComplaint._id, s)}
                             className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center justify-between ${selectedComplaint.status === s ? "text-[#008069] font-bold" : ""}`}
                           >
                             {s} {selectedComplaint.status === s && <Check size={16} />}
                           </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. CHAT BODY */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar bg-[#efeae2]/90">

                {/* Description Bubble (System) */}
                <div className="flex justify-center mb-6">
                  <div className="bg-[#fff5c4] px-4 py-3 rounded-lg shadow-sm text-xs text-gray-600 max-w-[90%] text-center border border-yellow-200">
                    <p className="font-bold text-yellow-800 mb-1 uppercase tracking-wide text-[10px]">Subject: {selectedComplaint.subject}</p>
                    {selectedComplaint.description}
                  </div>
                </div>

                {/* Messages */}
                {messages.map((msg, idx) => {
                  const isAdmin = msg.sender === "Admin";
                  return (
                    <div key={idx} className={`flex w-full ${isAdmin ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`relative max-w-[85%] sm:max-w-[70%] px-4 py-2 rounded-lg text-sm shadow-sm ${
                          isAdmin
                            ? "bg-[#d9fdd3] text-gray-900 rounded-tr-none"
                            : "bg-white text-gray-900 rounded-tl-none"
                        }`}
                      >
                        {/* Triangle Tail */}
                        <div className={`absolute top-0 w-0 h-0 border-[8px] border-transparent ${
                            isAdmin
                              ? "right-[-8px] border-t-[#d9fdd3] border-l-[#d9fdd3]"
                              : "left-[-8px] border-t-white border-r-white"
                        }`}></div>

                        <p className="leading-relaxed whitespace-pre-wrap pb-1">{msg.message}</p>

                        <div className="flex items-center justify-end gap-1 mt-0.5 select-none">
                           <span className="text-[10px] text-gray-500">
                             {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                           {isAdmin && (
                             <span className={msg.seen ? "text-[#53bdeb]" : "text-gray-400"}>
                                {msg.seen ? <CheckCheck size={14} /> : <Check size={14} />}
                             </span>
                           )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* 3. FOOTER (Input) */}
              <div className="bg-[#f0f2f5] px-4 py-3 flex items-end gap-2 z-10">
                 {/* Icons (Visual only) */}
                 {/* <div className="flex gap-2 mb-3 text-gray-500 hidden sm:flex">
                    <button className="hover:text-gray-700 transition-colors"><Smile size={24} /></button>
                    <button className="hover:text-gray-700 transition-colors"><Paperclip size={24} /></button>
                 </div> */}

                 {selectedComplaint.status === "Resolved" ? (
                    <div className="flex-1 bg-gray-200 rounded-lg p-3 text-center text-sm text-gray-500 font-medium">
                       This ticket is closed. Re-open to send messages.
                    </div>
                 ) : (
                    <form onSubmit={handleSendMessage} className="flex-1 flex gap-2 items-end">
                      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-white focus-within:border-[#008069] transition-colors">
                        <textarea
                          rows={1}
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          onKeyDown={(e) => {
                            if(e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage(e);
                            }
                          }}
                          disabled={isSending}
                          className="w-full bg-transparent px-4 py-3 text-sm focus:outline-none resize-none max-h-32 text-gray-800 placeholder:text-gray-400"
                          placeholder="Type a message..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={!reply.trim() || isSending}
                        className="mb-1 p-3 bg-[#008069] text-white rounded-full shadow-md hover:bg-[#006a57] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex-shrink-0 flex items-center justify-center"
                      >
                        {isSending ? <Loader2 className="animate-spin w-5 h-5" /> : <Send size={20} className="ml-0.5" />}
                      </button>
                    </form>
                 )}
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminComplaints;
