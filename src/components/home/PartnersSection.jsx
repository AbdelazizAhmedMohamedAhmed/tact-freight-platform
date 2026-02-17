import React from 'react';
import SectionHeading from '../shared/SectionHeading';
import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const partners = [
  { name: 'IATA', desc: 'International Air Transport Association', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/IATA_logo.svg/320px-IATA_logo.svg.png', url: 'https://www.iata.org' },
  { name: 'FIATA', desc: 'International Federation of Freight Forwarders Associations', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/FIATA_logo.svg/320px-FIATA_logo.svg.png', url: 'https://fiata.org' },
  { name: 'DF Alliance', desc: 'Digital Freight Alliance – DP World Network', logo: 'https://www.df-alliance.com/hubfs/df-alliance-logo.svg', url: 'https://www.df-alliance.com' },
  { name: 'All Forward', desc: 'Next-Gen Digital Freight Forwarder Network', logo: 'https://www.all-forward.com/hubfs/all-forward-logo.svg', url: 'https://www.all-forward.com' },
  { name: 'Freightnet', desc: "World's Largest Online Freight Logistics Hub", logo: 'https://www.freightnet.com/images/freightnet-logo.png', url: 'https://www.freightnet.com' },
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 mt-16">
          {partners.map((partner, i) => (
            <motion.a
              key={i}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="group bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#D50000]/30 cursor-pointer"
            >
              <div className="h-14 flex items-center justify-center">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-14 max-w-[140px] object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-60 group-hover:opacity-100"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div style={{ display: 'none' }} className="w-14 h-14 rounded-full bg-[#D50000] items-center justify-center shadow-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-bold text-[#1A1A1A] text-sm">{partner.name}</h3>
                <p className="text-xs text-gray-400 mt-1 leading-snug">{partner.desc}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}