import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import SectionHeading from '../shared/SectionHeading';
import { Ship, Plane, Truck, FileCheck, Warehouse, Compass, Car, MessageSquare, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const services = [
  { icon: Ship, title: 'Sea Freight', desc: 'FCL & LCL shipments across all major global trade routes.', image: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=600&q=90' },
  { icon: Plane, title: 'Air Freight', desc: 'Express and consolidated air cargo solutions worldwide.', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=90' },
  { icon: Truck, title: 'Inland Transport', desc: 'Door-to-door trucking and ground logistics coverage.', image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=90' },
  { icon: FileCheck, title: 'Customs Clearance', desc: 'Full customs brokerage and regulatory compliance.', image: 'https://images.unsplash.com/photo-1568093858174-0f391ea21c45?w=600&q=90' },
  { icon: Warehouse, title: 'Warehousing', desc: 'Storage, distribution, and inventory management.', image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&q=90' },
  { icon: Compass, title: 'Project Logistics', desc: 'Oversized and heavy-lift project cargo handling.', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=90' },
  { icon: Car, title: 'RoRo Services', desc: 'Roll-on/roll-off vehicle and machinery shipping.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=90' },
  { icon: MessageSquare, title: 'Consultancy', desc: 'Supply chain advisory and logistics optimization.', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=90' },
];

export default function ServicesOverview() {
  return (
    <section className="py-32 bg-gradient-to-br from-white via-gray-50 to-white relative">
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#D50000]/5 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <SectionHeading
          label="What We Do"
          title="End-to-End Logistics Services"
          description="Comprehensive freight solutions designed to move your cargo efficiently across borders and continents."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          {services.map((service, i) => {
            const pageMap = {
              'Sea Freight': 'SeaFreight',
              'Air Freight': 'AirFreight',
              'Inland Transport': 'InlandTransport',
              'Customs Clearance': 'CustomsClearance',
              'Warehousing': 'Warehousing',
              'Project Logistics': 'ProjectLogistics',
              'RoRo Services': 'RoRoServices',
              'Consultancy': 'Consultancy'
            };

            return (
            <Link key={i} to={createPageUrl(pageMap[service.title])}>
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.05 }}
                 className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-200 hover:border-[#D50000]"
                 whileHover={{ y: -8 }}
               >
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                 <img 
                   src={service.image} 
                   alt={service.title}
                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/70 via-[#1A1A1A]/40 to-transparent opacity-70" />
                 <motion.div 
                   className="absolute bottom-4 left-4 w-12 h-12 rounded-xl bg-[#D50000] flex items-center justify-center shadow-lg"
                   whileHover={{ scale: 1.15, rotate: 10 }}
                 >
                   <service.icon className="w-6 h-6 text-white" />
                 </motion.div>
               </div>
               <div className="p-7">
                 <h3 className="text-lg font-bold text-[#1A1A1A] mb-3 group-hover:text-[#D50000] transition-colors">
                   {service.title}
                 </h3>
                 <p className="text-sm text-gray-600 leading-relaxed">
                   {service.desc}
                 </p>
                 <motion.div 
                   className="mt-4 flex items-center gap-2 text-[#D50000] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                   initial={{ x: -10 }}
                   whileHover={{ x: 5 }}
                 >
                   Learn More <ArrowRight className="w-4 h-4" />
                 </motion.div>
               </div>
              </motion.div>
            </Link>
            );
          })}
        </div>

        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Link to={createPageUrl('Services')}>
            <motion.button 
              className="inline-flex items-center gap-2 text-[#D50000] font-semibold hover:gap-3 transition-all px-6 py-3 rounded-xl hover:bg-[#D50000]/10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View All Services <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}