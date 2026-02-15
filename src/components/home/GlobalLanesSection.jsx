import React from 'react';
import SectionHeading from '../shared/SectionHeading';
import { Globe, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const regions = [
  { name: 'Africa', color: '#D50000' },
  { name: 'Europe', color: '#1A1A1A' },
  { name: 'North America', color: '#D50000' },
  { name: 'Latin America', color: '#1A1A1A' },
  { name: 'Middle East', color: '#D50000' },
  { name: 'Asia & Far East', color: '#1A1A1A' },
  { name: 'Australia', color: '#D50000' },
];

export default function GlobalLanesSection() {
  return (
    <section className="py-24 bg-[#1A1A1A] relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <SectionHeading
          light
          label="Global Reach"
          title="Connecting Continents"
          description="Our extensive network spans across all major trade lanes, ensuring your cargo reaches any destination worldwide."
        />

        <div className="mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          {regions.map((region, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-[#D50000] hover:border-[#D50000] transition-all duration-300 cursor-default"
            >
              <MapPin className="w-6 h-6 mx-auto text-[#D50000] group-hover:text-white mb-3 transition-colors" />
              <p className="text-sm font-semibold text-white">{region.name}</p>
            </motion.div>
          ))}
        </div>

        {/* Globe visual */}
        <div className="mt-16 flex justify-center">
          <div className="relative w-48 h-48">
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/10 animate-spin" style={{ animationDuration: '30s' }} />
            <div className="absolute inset-4 rounded-full border border-white/10" />
            <div className="absolute inset-8 rounded-full border border-[#D50000]/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Globe className="w-16 h-16 text-[#D50000]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}