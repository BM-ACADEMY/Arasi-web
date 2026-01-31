// src/Components/Pages/About/AboutSection.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Factory } from 'lucide-react';

const AboutSection = () => {
  
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

      <div className="max-w-5xl mx-auto px-6 md:pt-40 pt-25 pb-24 relative z-10">
        
        {/* 1. Header */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="h-px w-12 bg-red-600"></span>
            <span className="text-xs font-bold tracking-[0.2em] text-red-700 uppercase">Est. 2018 • Puducherry</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif text-gray-900 leading-tight mb-8">
            About Us
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl leading-relaxed font-light border-l-4 border-gray-900 pl-6">
            From a visionary start-up to a manufacturing staple. We produce high-performance cleaning solutions that power thousands of households.
          </p>
        </motion.div>

        {/* 2. Content Layout (Simplified to Single Column) */}
        <div className="space-y-16">
          
          {/* The Story Block */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl"
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 border-t border-b border-gray-100 py-10 max-w-4xl">
            <div>
              <h4 className="text-4xl font-serif text-gray-900 mb-1">30+</h4>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">SKU Variants</p>
            </div>
            <div>
              <h4 className="text-4xl font-serif text-blue-900 mb-1">100%</h4>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Compliance</p>
            </div>
            <div>
              <h4 className="text-4xl font-serif text-gray-900 mb-1">6+</h4>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Years Active</p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-gray-50 p-8 md:p-12 rounded-none border-l-4 border-red-700 max-w-4xl">
            <h4 className="font-bold text-gray-900 mb-8 uppercase tracking-widest text-sm">Corporate Contact</h4>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="flex gap-4">
                <MapPin className="text-gray-400 shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-semibold text-gray-900">Manufacturing Unit</p>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    No. 2, East Coast Road, Bahour,<br/>
                    Pondicherry 607402, IN
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Phone className="text-gray-400 shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-semibold text-gray-900">Inquiries</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600 font-mono hover:text-red-700 cursor-pointer transition-colors">
                      +91 8682967445
                    </p>
                    <p className="text-sm text-gray-600 font-mono hover:text-red-700 cursor-pointer transition-colors">
                      +91 9442395444
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;