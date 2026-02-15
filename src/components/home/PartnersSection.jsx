import React from 'react';
import SectionHeading from '../shared/SectionHeading';
import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const partners = [
  { name: 'IATA', desc: 'International Air Transport Association' },
  { name: 'FIATA', desc: 'International Federation of Freight Forwarders' },
  { name: 'DF Alliance', desc: 'DP World Global Alliance' },
  { name: 'ALLFORWARD', desc: 'Digital Freight Network' },
  { name: 'Freightnet', desc: 'Global Freight Network' },
];

export default function PartnersSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          label="Strategic Partnerships"
          title="Global Networks & Alliances"
          description="Our memberships in major international logistics networks ensure reliable and efficient service worldwide."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mt-16">
          {partners.map((partner, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#F2F2F2] rounded-2xl p-6 text-center hover:shadow-lg transition-shadow border border-transparent hover:border-[#D50000]/20"
            >
              <div className="w-14 h-14 rounded-full bg-[#D50000]/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-[#D50000]" />
              </div>
              <h3 className="font-bold text-[#1A1A1A]">{partner.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{partner.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}