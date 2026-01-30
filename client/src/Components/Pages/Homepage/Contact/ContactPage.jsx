import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Send, ArrowRight, Clock, MessageSquare } from 'lucide-react';
import api from '@/services/api'; // Ensure this path is correct for your project
import toast from 'react-hot-toast'; // Import Toast

const ContactPage = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Make the API call to your new backend route
      const res = await api.post('/contact', formState);
      
      if (res.data.success) {
        toast.success("Message sent successfully!");
        // Reset form
        setFormState({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      }
    } catch (error) {
      console.error("Contact Error:", error);
      const errorMsg = error.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] relative overflow-hidden">
      {/* Background: Subtle Dot Pattern (Matches About Section) */}
      <div className="absolute inset-0 z-0 opacity-[0.3]" 
           style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-40 pb-24 relative z-10">
        
        {/* 1. Page Header */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mb-16 max-w-3xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="h-px w-12 bg-red-600"></span>
            <span className="text-xs font-bold tracking-[0.2em] text-red-700 uppercase">Get in Touch</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif text-gray-900 leading-tight mb-6">
            Let's start a <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">conversation.</span>
          </h1>
          <p className="text-xl text-gray-500 font-light max-w-xl">
            Have a question about our products or interested in a partnership? We are here to help.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          
          {/* 2. Left Column: Contact Info Card (Dark Theme) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="lg:col-span-5"
          >
            <div className="bg-[#0f172a] text-white rounded-2xl p-10 shadow-2xl relative overflow-hidden h-full min-h-[600px] flex flex-col justify-between">
              
              {/* Decorative Background Blurs */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

              {/* Content Top */}
              <div className="relative z-10">
                <h3 className="text-2xl font-serif mb-2">Contact Information</h3>
                <p className="text-gray-400 font-light text-sm mb-12">Fill up the form and our team will get back to you within 24 hours.</p>
                
                <div className="space-y-8">
                  <div className="flex items-start gap-6 group">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-red-700 transition-colors duration-300">
                      <Phone size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Call Us</p>
                      <p className="font-mono text-lg">+91 8682967445</p>
                      <p className="font-mono text-lg text-gray-400">+91 9442395444</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6 group">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-red-700 transition-colors duration-300">
                      <Mail size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Us</p>
                      <p className="font-mono text-lg">arasisoap@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6 group">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-red-700 transition-colors duration-300">
                      <MapPin size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Visit Us</p>
                      <p className="leading-relaxed text-gray-200">
                        No. 2, East Coast Road,<br />
                        Bahour, Pondicherry 607402
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Bottom: Hours */}
              <div className="relative z-10 mt-12 pt-8 border-t border-white/10">
                <div className="flex items-center gap-3 text-gray-400">
                  <Clock size={18} />
                  <span className="text-sm">Mon - Sat: 9:00 AM - 6:00 PM</span>
                </div>
              </div>

            </div>
          </motion.div>

          {/* 3. Right Column: The Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="lg:col-span-7 py-4"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Name */}
                <div className="relative group">
                  <input 
                    type="text" 
                    name="name" 
                    id="name"
                    required
                    value={formState.name}
                    onChange={handleChange}
                    className="peer w-full bg-transparent border-b border-gray-300 py-3 text-gray-900 focus:outline-none focus:border-red-700 transition-colors placeholder-transparent"
                    placeholder="John Doe"
                  />
                  <label 
                    htmlFor="name" 
                    className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-red-700 peer-focus:text-sm"
                  >
                    Your Name
                  </label>
                </div>

                {/* Email */}
                <div className="relative group">
                  <input 
                    type="email" 
                    name="email" 
                    id="email"
                    required
                    value={formState.email}
                    onChange={handleChange}
                    className="peer w-full bg-transparent border-b border-gray-300 py-3 text-gray-900 focus:outline-none focus:border-red-700 transition-colors placeholder-transparent"
                    placeholder="john@example.com"
                  />
                  <label 
                    htmlFor="email" 
                    className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-red-700 peer-focus:text-sm"
                  >
                    Email Address
                  </label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Phone */}
                <div className="relative group">
                  <input 
                    type="tel" 
                    name="phone" 
                    id="phone"
                    value={formState.phone}
                    onChange={handleChange}
                    className="peer w-full bg-transparent border-b border-gray-300 py-3 text-gray-900 focus:outline-none focus:border-red-700 transition-colors placeholder-transparent"
                    placeholder="+91 99999 99999"
                  />
                  <label 
                    htmlFor="phone" 
                    className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-red-700 peer-focus:text-sm"
                  >
                    Phone Number (Optional)
                  </label>
                </div>

                {/* Subject */}
                <div className="relative group">
                  <select
                    name="subject"
                    id="subject"
                    value={formState.subject}
                    onChange={handleChange}
                    className="peer w-full bg-transparent border-b border-gray-300 py-3 text-gray-900 focus:outline-none focus:border-red-700 transition-colors"
                  >
                    <option value="" disabled hidden></option>
                    <option value="general">General Inquiry</option>
                    <option value="distributor">Become a Distributor</option>
                    <option value="support">Product Support</option>
                    <option value="other">Other</option>
                  </select>
                  <label 
                    htmlFor="subject" 
                    className={`absolute left-0 transition-all pointer-events-none ${formState.subject ? '-top-3.5 text-sm text-red-700' : 'top-3 text-base text-gray-400'}`}
                  >
                    Subject
                  </label>
                </div>
              </div>

              {/* Message */}
              <div className="relative group">
                <textarea 
                  name="message" 
                  id="message" 
                  rows="4"
                  required
                  value={formState.message}
                  onChange={handleChange}
                  className="peer w-full bg-transparent border-b border-gray-300 py-3 text-gray-900 focus:outline-none focus:border-red-700 transition-colors placeholder-transparent resize-none"
                  placeholder="Your message..."
                ></textarea>
                <label 
                  htmlFor="message" 
                  className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-red-700 peer-focus:text-sm"
                >
                  Write your message...
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="group relative inline-flex items-center justify-center gap-3 bg-[#0f172a] text-white px-8 py-4 rounded-lg font-semibold overflow-hidden transition-all hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed w-full md:w-auto"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                    {!isSubmitting && <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-400 mt-4">
                <MessageSquare size={16} />
                <span>We respect your privacy. No spam, ever.</span>
              </div>

            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;