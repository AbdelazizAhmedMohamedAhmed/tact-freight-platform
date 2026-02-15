import React from 'react';
import SectionHeading from '../components/shared/SectionHeading';
import { Shield, Globe, Network, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const networks = [
  { name: 'IATA', full: 'International Air Transport Association', desc: 'As an IATA accredited agent, we have direct access to airlines worldwide, ensuring competitive air freight rates and priority booking for your cargo.' },
  { name: 'FIATA', full: 'International Federation of Freight Forwarders', desc: 'Our FIATA membership connects us with over 40,000 forwarding companies in 150 countries, enabling seamless global logistics coverage.' },
  { name: 'DF Alliance', full: 'DP World Global Alliance', desc: 'Through DF Alliance (DP World), we leverage one of the world\'s largest port operator networks for efficient sea freight and terminal operations.' },
  { name: 'ALLFORWARD', full: 'Digital Freight Network', desc: 'Our partnership with ALLFORWARD enables digital freight collaboration, connecting us with a modern network of vetted freight forwarders.' },
  { name: 'Freightnet', full: 'Global Freight Network', desc: 'Freightnet membership provides access to a trusted network of independent freight forwarders, expanding our global reach and capabilities.' },
];

export default function GlobalNetwork() {
  return (
    <div>
      <section className="relative py-32 bg-[#1A1A1A]">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80" alt="" className="w-full h-full object-cover opacity-20" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <span className="text-[#D50000] text-sm font-semibold uppercase tracking-widest">Global Network</span>
          <h1 className="text-4xl md:text-6xl font-black text-white mt-4 max-w-3xl">
            Connected Worldwide
          </h1>
          <p className="mt-6 text-white/60 text-lg max-w-xl">
            Our strategic partnerships and memberships in leading global logistics networks ensure worldwide coverage and reliability.
          </p>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-8">
            {networks.map((network, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col md:flex-row gap-8 items-start p-8 rounded-2xl bg-[#F2F2F2] hover:shadow-lg transition-shadow"
              >
                <div className="w-20 h-20 rounded-2xl bg-[#D50000]/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-10 h-10 text-[#D50000]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-[#1A1A1A]">{network.name}</h3>
                  <p className="text-sm text-[#D50000] font-medium mt-1">{network.full}</p>
                  <p className="mt-4 text-gray-600 leading-relaxed">{network.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}