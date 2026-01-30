import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Filter, CheckCircle, Clock, MessageSquare, Send, X, User, Check, CheckCheck, MoreHorizontal, ChevronRight, Bell 
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SERVER_URL);

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [hasNewNotification, setHasNewNotification] = useState(false); // State for Bell Dot

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  // --- SOCKET LISTENERS ---
  useEffect(() => {
    const handleNewComplaint = (data) => {
      toast.success(`New Ticket: ${data.userName}`, { icon: '🔔' });
      setHasNewNotification(true); // Trigger Red Dot on Bell
      fetchComplaints();
    };

    const handleNewMessage = ({ complaintId, message }) => {
      if (selectedComplaint && selectedComplaint._id === complaintId) {
         setMessages((prev) => [...prev, message]);
         if (message.sender === "User") {
           api.put(`/complaints/${complaintId}/seen`);
         }
      } else {
         fetchComplaints();
         setHasNewNotification(true); // Trigger Red Dot on Bell if chat not open
      }
    };

    const handleMessagesRead = ({ complaintId, reader }) => {
      if (selectedComplaint && selectedComplaint._id === complaintId && reader === "User") {
         setMessages(prev => prev.map(msg => 
            msg.sender === "Admin" ? { ...msg, seen: true } : msg
         ));
      }
    };

    socket.on("newComplaint", handleNewComplaint);
    socket.on("newMessage", handleNewMessage);
    socket.on("messagesRead", handleMessagesRead);

    return () => {
      socket.off("newComplaint");
      socket.off("newMessage");
      socket.off("messagesRead");
    };
  }, [selectedComplaint]);

  useEffect(() => {
    if (selectedComplaint) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedComplaint]);

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
      setChatLoading(true);
      const { data } = await api.get(`/complaints/${id}`);
      if (data.success) {
        setSelectedComplaint(data.complaint);
        setMessages(data.complaint.messages || []);
        
        await api.put(`/complaints/${id}/seen`);
        fetchComplaints(); 
      }
    } catch (error) {
      toast.error("Failed to load details");
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !selectedComplaint) return;
    try {
      const { data } = await api.post(`/complaints/${selectedComplaint._id}/message`, { message: reply.trim() });
      if (data.success) {
        setMessages([...messages, data.data]);
        setReply("");
        if (selectedComplaint.status === "Pending") handleStatusUpdate(selectedComplaint._id, "In Progress");
      }
    } catch (error) {
      toast.error("Failed to send");
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const { data } = await api.put(`/complaints/admin/${id}`, { status: newStatus });
      if (data.success) {
        toast.success(`Ticket marked as ${newStatus}`);
        setComplaints(prev => prev.map(c => c._id === id ? { ...c, status: newStatus } : c));
        if (selectedComplaint && selectedComplaint._id === id) setSelectedComplaint(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const hasUnreadMessages = (ticket) => {
    if (!ticket.messages || ticket.messages.length === 0) return false;
    const lastMsg = ticket.messages[ticket.messages.length - 1];
    return lastMsg.sender === "User" && !lastMsg.seen;
  };

  const formatTime = (dateString) => new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const filteredComplaints = complaints.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) || ticket._id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending": return "bg-amber-100 text-amber-700 border-amber-200";
      case "In Progress": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Resolved": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Helper to clear notification
  const clearNotification = () => setHasNewNotification(false);

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 font-sans">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Support Center</h1>
          <p className="text-slate-500 mt-1 text-sm md:text-base">Manage customer queries and support tickets.</p>
        </div>
        
        {/* BELL NOTIFICATION ICON */}
        <button 
          onClick={clearNotification}
          className="relative p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all self-start md:self-auto"
        >
          <Bell size={20} className="text-slate-600" />
          {hasNewNotification && (
            <span className="absolute top-2 right-2.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          )}
        </button>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Tickets</p>
             <h3 className="text-2xl md:text-3xl font-bold text-slate-800">{complaints.length}</h3>
           </div>
           <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
             <MessageSquare size={20} className="md:w-6 md:h-6" />
           </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Pending</p>
             <h3 className="text-2xl md:text-3xl font-bold text-slate-800">{complaints.filter(c => c.status === "Pending").length}</h3>
           </div>
           <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
             <Clock size={20} className="md:w-6 md:h-6" />
           </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Resolved</p>
             <h3 className="text-2xl md:text-3xl font-bold text-slate-800">{complaints.filter(c => c.status === "Resolved").length}</h3>
           </div>
           <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
             <CheckCircle size={20} className="md:w-6 md:h-6" />
           </div>
        </div>
      </div>

      {/* --- MAIN CONTENT CARD --- */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Filters Toolbar */}
        <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/30">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by ID, Subject..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-auto">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full md:w-auto pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-sm appearance-none"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[200px]">Ticket Details</th>
                <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 md:px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 md:px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-20 text-center"><div className="flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div></td></tr>
              ) : filteredComplaints.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-20 text-center text-slate-400">No tickets found.</td></tr>
              ) : (
                filteredComplaints.map((ticket) => (
                  <tr key={ticket._id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${hasUnreadMessages(ticket) ? 'bg-red-500 animate-pulse' : 'bg-transparent'}`}></div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm mb-0.5">#{ticket._id.slice(-6).toUpperCase()}</p>
                          <p className="text-sm text-slate-600 line-clamp-1 font-medium">{ticket.subject}</p>
                          {/* Mobile Only Customer Name */}
                          <p className="md:hidden text-xs text-slate-500 mt-1">by {ticket.user?.name}</p>
                          <p className="text-xs text-slate-400 mt-1">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4">
                       <div className="flex items-center gap-3">
                         <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
                            {ticket.user?.name?.[0] || "U"}
                         </div>
                         <div>
                            <p className="text-sm font-semibold text-slate-700">{ticket.user?.name || "Unknown"}</p>
                            <p className="text-xs text-slate-500">{ticket.user?.email}</p>
                         </div>
                       </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold border ${getStatusBadge(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      <button 
                        onClick={() => openComplaintDrawer(ticket._id)}
                        className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs md:text-sm font-medium rounded-lg hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                      >
                        <span className="hidden md:inline">Open Chat</span> 
                        <span className="md:hidden">Chat</span>
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CHAT DRAWER --- */}
      <AnimatePresence>
        {selectedComplaint && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedComplaint(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />

            {/* Drawer - Full width on mobile */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full md:w-[600px] lg:w-[700px] bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-100 bg-white z-10">
                <div className="flex items-center gap-3 md:gap-4">
                  <button onClick={() => setSelectedComplaint(null)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
                  <div>
                    <h2 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
                      #{selectedComplaint._id.slice(-6).toUpperCase()}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wide ${getStatusBadge(selectedComplaint.status)}`}>
                        {selectedComplaint.status}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 font-medium truncate max-w-[150px] md:max-w-none">{selectedComplaint.subject}</p>
                  </div>
                </div>
                
                {/* Status Actions - Hidden on very small screens or stacked */}
                <div className="hidden sm:flex bg-slate-100 p-1 rounded-lg">
                   {["Pending", "In Progress", "Resolved"].map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(selectedComplaint._id, status)}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                          selectedComplaint.status === status
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {status === "In Progress" ? "Progress" : status}
                      </button>
                   ))}
                </div>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6 custom-scrollbar">
                 
                 {/* Ticket Details Card */}
                 <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm mb-6 md:mb-8">
                    <div className="flex items-center gap-3 mb-4">
                       <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <User size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-800">{selectedComplaint.user?.name}</p>
                          <p className="text-xs text-slate-500">{selectedComplaint.user?.email}</p>
                       </div>
                    </div>
                    {/* Status buttons for Mobile */}
                    <div className="sm:hidden flex flex-wrap gap-2 mb-4">
                        {["Pending", "In Progress", "Resolved"].map(status => (
                            <button
                                key={status}
                                onClick={() => handleStatusUpdate(selectedComplaint._id, status)}
                                className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
                                selectedComplaint.status === status
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-slate-500 border-slate-200"
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                    <div className="md:pl-13">
                       <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100">
                         {selectedComplaint.description}
                       </p>
                    </div>
                 </div>

                 {/* Date Divider */}
                 <div className="flex items-center justify-center mb-6">
                    <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      Conversation Started
                    </span>
                 </div>

                 {/* Messages */}
                 <div className="space-y-6">
                    {messages.map((msg, idx) => {
                       const isAdmin = msg.sender === "Admin";
                       return (
                         <div key={idx} className={`flex w-full ${isAdmin ? "justify-end" : "justify-start"}`}>
                           <div className={`relative max-w-[85%] md:max-w-[80%] p-4 rounded-2xl text-sm shadow-sm ${
                              isAdmin 
                                ? "bg-blue-600 text-white rounded-br-none" 
                                : "bg-white text-slate-800 border border-slate-100 rounded-bl-none"
                           }`}>
                              <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                              
                              <div className={`flex items-center gap-1.5 mt-2 justify-end opacity-80`}>
                                 <span className="text-[10px] font-medium">
                                   {formatTime(msg.createdAt)}
                                 </span>
                                 {isAdmin && (
                                   <span className={msg.seen ? "text-blue-200" : "text-blue-300/70"}>
                                      {msg.seen ? <CheckCheck size={14} strokeWidth={2.5} /> : <Check size={14} strokeWidth={2.5} />}
                                   </span>
                                 )}
                              </div>
                           </div>
                         </div>
                       )
                    })}
                    <div ref={messagesEndRef} />
                 </div>
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-slate-100">
                 {selectedComplaint.status === "Resolved" ? (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-center gap-2 text-emerald-700 text-sm font-medium">
                       <CheckCircle size={18} /> Ticket is marked as Resolved. Re-open to reply.
                    </div>
                 ) : (
                    <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
                      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
                        <textarea 
                          rows={1}
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          className="w-full bg-transparent p-3 text-sm focus:outline-none resize-none max-h-32"
                          placeholder="Type your reply..."
                          onKeyDown={(e) => {
                            if(e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage(e);
                            }
                          }}
                        />
                      </div>
                      <button 
                         type="submit" 
                         disabled={!reply.trim()}
                         className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95"
                      >
                         <Send size={20} />
                      </button>
                    </form>
                 )}
                 <div className="text-center mt-2 hidden md:block">
                    <span className="text-[10px] text-slate-400">Press Enter to send, Shift + Enter for new line</span>
                 </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminComplaints;