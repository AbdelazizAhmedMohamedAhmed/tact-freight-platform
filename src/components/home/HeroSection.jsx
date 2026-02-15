import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Ship, Plane, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#1A1A1A]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1494412574643-ff11b0a5eb19?w=1920&q=80"
          alt="Global Shipping"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A] via-[#1A1A1A]/80 to-transparent" />
      </div>

      {/* Animated red accent */}
      <div className="absolute top-0 left-0 w-2 h-full bg-[#D50000]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 bg-[#D50000]/20 text-[#D50000] px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-[#D50000] animate-pulse" />
              Global Freight Solutions
            </span>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
              Your Reliable Partner for{' '}
              <span className="text-[#D50000]">Global Shipping</span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-white/60 leading-relaxed max-w-lg">
              From Cairo to the world — seamless freight forwarding across sea, air, and land with full supply chain visibility.
            </p>

            <div className="flex flex-wrap gap-4 mt-10">
              <Link to={createPageUrl('RequestQuote')}>
                <Button size="lg" className="bg-[#D50000] hover:bg-[#B00000] text-white px-8 h-14 text-base font-semibold rounded-xl">
                  Request a Quote
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl('TrackShipment')}>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 h-14 text-base rounded-xl">
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
            className="flex gap-8 mt-16"
          >
            {[
              { icon: Ship, label: 'Sea Freight' },
              { icon: Plane, label: 'Air Freight' },
              { icon: Truck, label: 'Inland Transport' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-white/50">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium hidden sm:block">{item.label}</span>
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