import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Ship, Plane, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-b from-[#1A1A1A] via-[#0F0F0F] to-[#000000]">
      {/* Animated background */}
      <motion.div 
        className="absolute inset-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5 }}
      >
        <img
          src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=1920&q=80"
          alt="Global Shipping"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A] via-[#1A1A1A]/90 to-[#0F0F0F]/75" />
      </motion.div>

      {/* Animated accent line */}
      <motion.div 
        className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#D50000] to-transparent"
        initial={{ height: 0 }}
        animate={{ height: '100%' }}
        transition={{ duration: 1 }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24 w-full">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.span 
              className="inline-flex items-center gap-2 bg-[#D50000]/20 backdrop-blur-sm border border-[#D50000]/30 text-[#FF6B6B] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.span 
                className="w-2 h-2 rounded-full bg-[#D50000]"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              Global Freight Solutions
            </motion.span>

            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tighter mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Your Trusted Logistics Partner{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D50000] via-[#FF6B6B] to-[#D50000]">Globally</span>
            </motion.h1>

            <motion.p 
              className="mt-8 text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Seamless freight forwarding across sea, air, and land with complete supply chain visibility, reliability, and 24/7 expert support.
            </motion.p>

            <motion.div 
              className="flex flex-wrap gap-4 mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link to={createPageUrl('RequestQuote')}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button size="lg" className="bg-[#D50000] hover:bg-[#B00000] text-white px-8 h-14 text-base font-bold rounded-xl shadow-2xl hover:shadow-2xl transition-all duration-300">
                    Request a Quote
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
              </Link>
              <Link to={createPageUrl('TrackShipment')}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button size="lg" variant="outline" className="border border-white/40 text-white hover:bg-white/15 px-8 h-14 text-base font-semibold rounded-xl backdrop-blur-sm transition-all duration-300">
                    <Search className="w-5 h-5 mr-2" />
                    Track Shipment
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Mode indicators */}
          <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5, duration: 0.6 }}
           className="flex gap-10 mt-20"
          >
           {[
              { icon: Ship, label: 'Sea Freight' },
              { icon: Plane, label: 'Air Freight' },
              { icon: Truck, label: 'Inland Transport' },
            ].map((item, i) => (
              <motion.div 
                key={i} 
                className="flex items-center gap-3 text-white/60 hover:text-white transition-colors cursor-pointer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                whileHover={{ x: 4 }}
              >
                <motion.div 
                  className="w-12 h-12 rounded-xl bg-white/8 border border-white/15 flex items-center justify-center backdrop-blur-sm hover:bg-white/12 transition-colors"
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                >
                  <item.icon className="w-5 h-5" />
                </motion.div>
                <span className="text-sm font-semibold hidden sm:block">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="absolute bottom-0 right-0 hidden xl:flex items-end gap-8 p-16"
        >
          {[
            { value: '6', label: 'Continents' },
            { value: '50+', label: 'Countries' },
            { value: '15+', label: 'Major Clients' },
            { value: '5+', label: 'Global Networks' },
          ].map((stat, i) => (
            <div key={i} className="text-right">
              <div className="text-4xl font-black text-white">{stat.value}</div>
              <div className="text-sm text-white/40 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}