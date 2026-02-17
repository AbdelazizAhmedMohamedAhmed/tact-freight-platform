import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CTASection() {
  return (
    <section className="py-32 bg-gradient-to-br from-[#D50000] via-[#B00000] to-[#900000] relative overflow-hidden">
      {/* Background with animation */}
      <motion.div 
        className="absolute inset-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2 }}
      >
        <img
          src="https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1920&q=90"
          alt=""
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#D50000] via-[#D50000]/95 to-[#900000]" />
      </motion.div>

      {/* Animated decorative elements */}
      <div className="absolute top-10 right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <motion.div 
        className="relative z-10 max-w-4xl mx-auto px-6 text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2 
          className="text-4xl md:text-6xl font-black text-white leading-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Ready to Ship?<br />
          <span className="text-white/90">Let's Move Your Cargo</span>
        </motion.h2>
        <motion.p 
          className="mt-8 text-white/90 text-lg max-w-xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          Get a competitive quote in minutes. Our dedicated team is ready to handle your shipment with expertise and care.
        </motion.p>
        <motion.div 
          className="flex flex-wrap justify-center gap-4 mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Link to={createPageUrl('RequestQuote')}>
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button size="lg" className="bg-white text-[#D50000] hover:bg-gray-100 h-14 px-10 text-base font-bold rounded-xl shadow-2xl hover:shadow-2xl transition-all">
                Get a Free Quote
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </Link>
          <a href="tel:+20204042643">
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/15 h-14 px-10 text-base rounded-xl backdrop-blur-sm shadow-lg transition-all">
                <Phone className="w-5 h-5 mr-2" />
                Call Us Now
              </Button>
            </motion.div>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}