import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import SectionHeading from '../shared/SectionHeading';
import { Ship, Plane, Truck, FileCheck, Warehouse, Compass, Car, MessageSquare, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const services = [
  { icon: Ship, title: 'Sea Freight', desc: 'FCL & LCL shipments across all major global trade routes.' },
  { icon: Plane, title: 'Air Freight', desc: 'Express and consolidated air cargo solutions worldwide.' },
  { icon: Truck, title: 'Inland Transport', desc: 'Door-to-door trucking and ground logistics coverage.' },
  { icon: FileCheck, title: 'Customs Clearance', desc: 'Full customs brokerage and regulatory compliance.' },
  { icon: Warehouse, title: 'Warehousing', desc: 'Storage, distribution, and inventory management.' },
  { icon: Compass, title: 'Project Logistics', desc: 'Oversized and heavy-lift project cargo handling.' },
  { icon: Car, title: 'RoRo Services', desc: 'Roll-on/roll-off vehicle and machinery shipping.' },
  { icon: MessageSquare, title: 'Consultancy', desc: 'Supply chain advisory and logistics optimization.' },
];

export default function ServicesOverview() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          label="What We Do"
          title="End-to-End Logistics Services"
          description="Comprehensive freight solutions designed to move your cargo efficiently across borders and continents."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group relative bg-[#F2F2F2] rounded-2xl p-6 hover:bg-[#1A1A1A] transition-all duration-500 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#D50000]/10 group-hover:bg-[#D50000] flex items-center justify-center mb-4 transition-colors duration-500">
                <service.icon className="w-6 h-6 text-[#D50000] group-hover:text-white transition-colors duration-500" />
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1A] group-hover:text-white transition-colors duration-500">
                {service.title}
              </h3>
              <p className="mt-2 text-sm text-gray-500 group-hover:text-white/60 transition-colors duration-500">
                {service.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to={createPageUrl('Services')}>
            <button className="inline-flex items-center gap-2 text-[#D50000] font-semibold hover:gap-3 transition-all">
              View All Services <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}