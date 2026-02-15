import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import SectionHeading from '../shared/SectionHeading';
import { Ship, Plane, Truck, FileCheck, Warehouse, Compass, Car, MessageSquare, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const services = [
  { icon: Ship, title: 'Sea Freight', desc: 'FCL & LCL shipments across all major global trade routes.', image: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5eb19?w=400&q=80' },
  { icon: Plane, title: 'Air Freight', desc: 'Express and consolidated air cargo solutions worldwide.', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80' },
  { icon: Truck, title: 'Inland Transport', desc: 'Door-to-door trucking and ground logistics coverage.', image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&q=80' },
  { icon: FileCheck, title: 'Customs Clearance', desc: 'Full customs brokerage and regulatory compliance.', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80' },
  { icon: Warehouse, title: 'Warehousing', desc: 'Storage, distribution, and inventory management.', image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=400&q=80' },
  { icon: Compass, title: 'Project Logistics', desc: 'Oversized and heavy-lift project cargo handling.', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&q=80' },
  { icon: Car, title: 'RoRo Services', desc: 'Roll-on/roll-off vehicle and machinery shipping.', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80' },
  { icon: MessageSquare, title: 'Consultancy', desc: 'Supply chain advisory and logistics optimization.', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=80' },
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
              className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/50 to-transparent opacity-60" />
                <div className="absolute bottom-4 left-4 w-12 h-12 rounded-xl bg-[#D50000] flex items-center justify-center">
                  <service.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {service.desc}
                </p>
              </div>
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