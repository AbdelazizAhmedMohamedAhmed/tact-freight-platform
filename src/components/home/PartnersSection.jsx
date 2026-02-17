import React, { useState } from 'react';
import SectionHeading from '../shared/SectionHeading';
import { motion } from 'framer-motion';

function LogoWithFallback({ partner }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <PartnerBadge partner={partner} />;
  return (
    <img
      src={partner.logo}
      alt={partner.name}
      className="max-h-14 max-w-[140px] object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-60 group-hover:opacity-100"
      onError={() => setFailed(true)}
    />
  );
}

function PartnerBadge({ partner }) {
  return (
    <div
      className="px-5 py-3 rounded-xl flex items-center justify-center font-black text-white text-lg tracking-wide shadow-md"
      style={{ backgroundColor: partner.color }}
    >
      {partner.name}
    </div>
  );
}

const partners = [
  {
    name: 'IATA',
    desc: 'International Air Transport Association',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/IATA_logo.svg/320px-IATA_logo.svg.png',
    url: 'https://www.iata.org',
    color: '#003580',
  },
  {
    name: 'FIATA',
    desc: 'International Federation of Freight Forwarders Associations',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/FIATA_logo.svg/320px-FIATA_logo.svg.png',
    url: 'https://fiata.org',
    color: '#0066B3',
  },
  {
    name: 'DF Alliance',
    desc: 'Digital Freight Alliance – DP World Network',
    logo: null,
    url: 'https://www.df-alliance.com',
    color: '#E4002B',
  },
  {
    name: 'All Forward',
    desc: 'Next-Gen Digital Freight Forwarder Network',
    logo: null,
    url: 'https://www.all-forward.com',
    color: '#00AEEF',
  },
  {
    name: 'Freightnet',
    desc: "World's Largest Online Freight Logistics Hub",
    logo: null,
    url: 'https://www.freightnet.com',
    color: '#FF6600',
  },
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
              <div className="h-16 w-full flex items-center justify-center">
                {partner.logo ? (
                  <LogoWithFallback partner={partner} />
                ) : (
                  <PartnerBadge partner={partner} />
                )}
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