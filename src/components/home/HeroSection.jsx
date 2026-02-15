import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Ship, Plane, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F]">
      {/* Background Image with parallax */}
      <motion.div 
        className="absolute inset-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5 }}
      >
        <img
          src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=1920&q=80"
          alt="Global Shipping"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A] via-[#1A1A1A]/85 to-[#0F0F0F]/70" />
      </motion.div>

      {/* Animated red accent */}
      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#D50000] to-[#D50000]/60" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24 w-full">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 bg-[#D50000]/15 text-[#FF6B6B] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-8">
              <span className="w-2 h-2 rounded-full bg-[#D50000] animate-pulse" />
              Global Freight Solutions
            </span>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tighter">
              Your Reliable Partner for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D50000] to-[#FF6B6B]">Global Shipping</span>
            </h1>

            <p className="mt-8 text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl font-light">
              From Cairo to the world — seamless freight forwarding across sea, air, and land with complete supply chain visibility and expertise.
            </p>

            <div className="flex flex-wrap gap-4 mt-12">
              <Link to={createPageUrl('RequestQuote')}>
                <Button size="lg" className="bg-[#D50000] hover:bg-[#B00000] text-white px-8 h-14 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  Request a Quote
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl('TrackShipment')}>
                <Button size="lg" variant="outline" className="border border-white/40 text-white hover:bg-white/15 px-8 h-14 text-base font-semibold rounded-xl backdrop-blur-sm transition-all duration-300">
                  <Search className="w-5 h-5 mr-2" />
                  Track Shipment
                </Button>
              </Link>
            </div>
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
             <div key={i} className="flex items-center gap-3 text-white/60 hover:text-white/80 transition-colors">
               <div className="w-12 h-12 rounded-xl bg-white/8 border border-white/15 flex items-center justify-center backdrop-blur-sm hover:bg-white/12 transition-colors">
                 <item.icon className="w-5 h-5" />
               </div>
               <span className="text-sm font-semibold hidden sm:block">{item.label}</span>
             </div>
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