import React from 'react';
import SectionHeading from '../components/shared/SectionHeading';
import { motion } from 'framer-motion';

const clients = [
  { name: 'BMW', sector: 'Automotive' },
  { name: 'Nissan', sector: 'Automotive' },
  { name: 'Geely', sector: 'Automotive' },
  { name: 'Otsuka', sector: 'Pharmaceuticals' },
  { name: 'Abou Ghaly Motors', sector: 'Automotive' },
  { name: 'Brisk', sector: 'Automotive Parts' },
  { name: 'Proton', sector: 'Automotive' },
  { name: 'Itochu', sector: 'Trading' },
  { name: 'Mansour', sector: 'Conglomerate' },
  { name: 'Suzuki', sector: 'Automotive' },
  { name: 'Mobica', sector: 'Furniture' },
  { name: 'SFI', sector: 'Industrial' },
  { name: 'KG Mobility', sector: 'Automotive' },
  { name: 'Ezz Elarab', sector: 'Automotive' },
  { name: 'Jushi', sector: 'Manufacturing' },
];

export default function Clients() {
  return (
    <div>
      <section className="relative py-32 bg-[#1A1A1A]">
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <span className="text-[#D50000] text-sm font-semibold uppercase tracking-widest">Our Clients</span>
          <h1 className="text-4xl md:text-6xl font-black text-white mt-4">Trusted Partners</h1>
          <p className="mt-6 text-white/60 text-lg max-w-xl">
            We are proud to serve leading brands across automotive, pharmaceutical, manufacturing, and industrial sectors.
          </p>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {clients.map((client, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#F2F2F2] rounded-2xl p-8 text-center hover:shadow-lg transition-all hover:bg-white hover:border hover:border-[#D50000]/20"
              >
                <div className="w-16 h-16 rounded-full bg-[#D50000]/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-black text-[#D50000]">{client.name[0]}</span>
                </div>
                <h3 className="font-bold text-[#1A1A1A] text-sm">{client.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{client.sector}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}