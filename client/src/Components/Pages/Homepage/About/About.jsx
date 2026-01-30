// src/Components/Pages/About/AboutSection.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, MapPin, Phone, Award, ArrowUpRight, ShieldCheck, Factory } from 'lucide-react';
import Pdf from "@/assets/GetDocuments.pdf";
import TrademarkImg from "@/assets/trademark.png";

const AboutSection = () => {
  
  const handleViewCertificate = () => {
    window.open(`${Pdf}#toolbar=0&navpanes=0&scrollbar=0`, '_blank');
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <section className="relative w-full bg-[#faf9f6] overflow-hidden">
      {/* Background: Subtle Dot Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.4]" 
           style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      {/* Top Gradient Fade */}
      <div className="absolute top-0 w-full h-64 bg-gradient-to-b from-white to-transparent z-0" />

      {/* FIXED: Increased pt-32 to pt-48 (12rem) to prevent content hiding under navbars */}
      <div className="max-w-7xl mx-auto px-6 md:pt-40 pt-25 pb-24 relative z-10">
        
        {/* 1. Header */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-4xl mb-24"
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="h-px w-12 bg-red-600"></span>
            <span className="text-xs font-bold tracking-[0.2em] text-red-700 uppercase">Est. 2018 • Puducherry</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif text-gray-900 leading-tight mb-8">
            About Us <br />
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl leading-relaxed font-light border-l-4 border-gray-900 pl-6">
            From a visionary start-up to a manufacturing staple. We produce high-performance cleaning solutions that power thousands of households.
          </p>
        </motion.div>

        {/* 2. Asymmetric Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Left Column: Narrative (Scrolls naturally) */}
          <div className="lg:col-span-7 space-y-16">
            
            {/* The Story Block */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Factory className="text-blue-900" size={28} strokeWidth={1.5} />
                Manufacturing Excellence
              </h3>
              <div className="prose prose-lg text-gray-600 space-y-6">
                <p>
                  Founded by the late <strong>R. Lakshminarayanan</strong>, Arasi Soap Works began with a singular mission: to democratize access to premium cleaning agents. What started as a local initiative has evolved into a robust manufacturing operation.
                </p>
                <p>
                  Today, under the stewardship of <strong>Swarnalaksmi</strong>, we blend traditional integrity with modern chemical engineering. Our facility in Bahour operates under strict quality controls, ensuring every batch meets industrial standards.
                </p>
                <p>
                  Our commitment to sustainable practices and rigorous testing protocols has allowed us to maintain consistency across our entire product line, from detergent cakes to advanced liquid solutions.
                </p>
              </div>
            </motion.div>

            {/* KPI Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 border-t border-b border-gray-100 py-8">
              <div>
                <h4 className="text-4xl font-serif text-gray-900 mb-1">30+</h4>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">SKU Variants</p>
              </div>
              <div>
                <h4 className="text-4xl font-serif text-blue-900 mb-1">100%</h4>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Compliance</p>
              </div>
              <div className="hidden md:block">
                <h4 className="text-4xl font-serif text-gray-900 mb-1">6+</h4>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Years Active</p>
              </div>
            </div>

            {/* Contact Grid */}
            <div className="bg-gray-50 p-8 rounded-none border-l-4 border-red-700">
              <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-sm">Corporate Contact</h4>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <MapPin className="text-gray-400 shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-gray-900">Manufacturing Unit</p>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                      No. 2, East Coast Road, Bahour,<br/>
                      Pondicherry 607402, IN
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Phone className="text-gray-400 shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-gray-900">Inquiries</p>
                    <p className="text-sm text-gray-500 mt-1 font-mono hover:text-red-700 cursor-pointer transition-colors">
                      +91 8682967445
                    </p>
                    <p className="text-sm text-gray-500 font-mono hover:text-red-700 cursor-pointer transition-colors">
                      +91 9442395444
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Credibility Card (Sticky) */}
          {/* Note: 'self-start' enables the sticky behavior. 'top-40' keeps it below headers. */}
          <div className="lg:col-span-5 lg:sticky lg:top-40 self-start mt-8 lg:mt-0">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="relative z-10"
            >
              {/* Premium Dark Card */}
              <div className="bg-[#0f172a] text-white p-10 rounded-xl shadow-2xl relative overflow-hidden group">
                
                {/* Abstract decorative shapes */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-900/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-red-900/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

                {/* Card Header */}
                <div className="flex justify-between items-start mb-10 relative z-10">
                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Certification</p>
                    <h3 className="text-3xl font-serif text-white">Trademark <br/>Registered</h3>
                  </div>
                  <div className="p-2 rounded-lg shadow-inner">
                    <img 
                      src={TrademarkImg} 
                      alt="Trademark Certificate" 
                      className="w-18 h-18 object-contain"
                    />
                  </div>
                </div>

                {/* Card Details */}
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                    <span className="text-gray-400 text-sm">Registry</span>
                    <span className="font-mono text-sm">Govt. of India</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                    <span className="text-gray-400 text-sm">Registration No.</span>
                    <span className="font-mono text-yellow-500 tracking-wider">4296577</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                    <span className="text-gray-400 text-sm">Class</span>
                    <span className="font-mono text-sm">03 (Cleaning Prep)</span>
                  </div>
                </div>

                {/* Action Button */}
                <button 
                  onClick={handleViewCertificate}
                  className="mt-10 w-full group bg-white hover:bg-gray-100 text-gray-900 py-4 px-6 rounded-lg font-bold transition-all duration-300 flex items-center justify-between"
                >
                  <span className="flex items-center gap-3">
                    <FileText className="text-red-700" size={20} />
                    View Document
                  </span>
                  <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform text-gray-400" size={20} />
                </button>

                <div className="mt-4 text-center">
                  <p className="text-[10px] text-gray-200 flex items-center justify-center gap-1">
                    <ShieldCheck size={12} className="text-green-500" />
                    Digitally Verified • Secure View
                  </p>
                </div>
              </div>

              {/* Background Offset Element for depth */}
              <div className="absolute top-4 -right-4 w-full h-full border-2 border-gray-200 rounded-xl -z-10 hidden md:block"></div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;