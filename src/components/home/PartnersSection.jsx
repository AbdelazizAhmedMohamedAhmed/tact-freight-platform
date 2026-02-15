import React from 'react';
import SectionHeading from '../shared/SectionHeading';
import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const partners = [
  { name: 'IATA', desc: 'International Air Transport Association', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200&q=80' },
  { name: 'FIATA', desc: 'International Federation of Freight Forwarders', image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=200&q=80' },
  { name: 'DF Alliance', desc: 'DP World Global Alliance', image: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5eb19?w=200&q=80' },
  { name: 'ALLFORWARD', desc: 'Digital Freight Network', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200&q=80' },
  { name: 'Freightnet', desc: 'Global Freight Network', image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=200&q=80' },
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
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-transparent hover:border-[#D50000]/30"
            >
              <div className="relative h-32 overflow-hidden">
                <img 
                  src={partner.image} 
                  alt={partner.name}
                  className="w-full h-full object-cover opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[#D50000] flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="p-5 pt-8 text-center">
                <h3 className="font-bold text-[#1A1A1A]">{partner.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{partner.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}