import React from 'react';
import SectionHeading from '../shared/SectionHeading';

const clients = [
  'BMW', 'Nissan', 'Geely', 'Otsuka', 'Abou Ghaly Motors', 
  'Brisk', 'Proton', 'Itochu', 'Mansour', 'Suzuki', 
  'Mobica', 'SFI', 'KG Mobility', 'Ezz Elarab', 'Jushi'
];

export default function ClientsCarousel() {
  return (
    <section className="py-24 bg-[#F2F2F2]">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          label="Trusted By"
          title="Our Valued Clients"
          description="We partner with leading brands across automotive, manufacturing, and industrial sectors."
        />

        <div className="mt-16 relative overflow-hidden">
          {/* Scrolling row */}
          <div className="flex animate-scroll gap-8">
            {[...clients, ...clients].map((client, i) => (
              <div
                key={i}
                className="flex-shrink-0 bg-white rounded-xl px-8 py-6 flex items-center justify-center min-w-[180px] shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <span className="text-[#1A1A1A] font-bold text-sm whitespace-nowrap">{client}</span>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll {
            animation: scroll 30s linear infinite;
          }
          .animate-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>
      </div>
    </section>
  );
}