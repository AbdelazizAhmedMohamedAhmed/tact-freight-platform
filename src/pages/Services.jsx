import React from 'react';
import SectionHeading from '../components/shared/SectionHeading';
import { Ship, Plane, Truck, FileCheck, Warehouse, Compass, Car, MessageSquare, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

const services = [
  {
    icon: Ship, title: 'Sea Freight',
    desc: 'Full Container Load (FCL) and Less than Container Load (LCL) shipments across all major global trade routes. We handle port-to-port and door-to-door ocean logistics with competitive rates.',
    features: ['FCL & LCL', 'Reefer Containers', 'Break Bulk', 'Port-to-Port', 'Door-to-Door'],
  },
  {
    icon: Plane, title: 'Air Freight',
    desc: 'Express and consolidated air cargo solutions worldwide. We offer both standard and time-critical air freight options for urgent shipments with full tracking capabilities.',
    features: ['Express Cargo', 'Consolidated', 'Charter Services', 'Dangerous Goods', 'Temperature Controlled'],
  },
  {
    icon: Truck, title: 'Inland Transportation',
    desc: 'Comprehensive ground logistics covering FTL and LTL trucking, cross-border road transport, and last-mile delivery solutions across the Middle East and North Africa.',
    features: ['FTL & LTL', 'Cross-Border', 'Last Mile', 'Flatbed & Trailer', 'GPS Tracking'],
  },
  {
    icon: FileCheck, title: 'Customs Clearance',
    desc: 'Full customs brokerage services ensuring smooth clearance at all Egyptian ports and airports. We handle all documentation, duties, and regulatory compliance.',
    features: ['Import & Export', 'Duty Optimization', 'Documentation', 'Regulatory Compliance', 'Bonded Warehousing'],
  },
  {
    icon: Warehouse, title: 'Warehousing & Distribution',
    desc: 'Modern warehousing facilities with inventory management, pick-and-pack, and distribution services to support your supply chain operations.',
    features: ['Inventory Management', 'Pick & Pack', 'Cross-Docking', 'Distribution', 'WMS Integration'],
  },
  {
    icon: Compass, title: 'Project Logistics',
    desc: 'Specialized handling of oversized, overweight, and high-value project cargo. Our team manages complex logistics for infrastructure and industrial projects.',
    features: ['Heavy Lift', 'Oversized Cargo', 'Route Surveys', 'Engineering Support', 'Multi-Modal'],
  },
  {
    icon: Car, title: 'RoRo Services',
    desc: 'Roll-on/roll-off shipping for vehicles, heavy machinery, and self-propelled equipment. Trusted by leading automotive brands in Egypt.',
    features: ['Vehicle Shipping', 'Heavy Machinery', 'Port Handling', 'Insurance', 'Inspection Services'],
  },
  {
    icon: MessageSquare, title: 'Consultancy & Advisory',
    desc: 'Expert supply chain consulting and logistics advisory services to optimize your operations, reduce costs, and improve efficiency.',
    features: ['Supply Chain Audit', 'Cost Optimization', 'Route Planning', 'Compliance Advisory', 'Risk Management'],
  },
];

export default function Services() {
  return (
    <div>
      <section className="relative py-32 bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F]">
        <motion.div 
          className="absolute inset-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
        >
          <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80" alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A] via-[#1A1A1A]/90 to-[#0F0F0F]/70" />
        </motion.div>
        <motion.div 
          className="relative z-10 max-w-7xl mx-auto px-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[#D50000] text-sm font-semibold uppercase tracking-widest">Our Services</span>
          <h1 className="text-4xl md:text-6xl font-black text-white mt-4 max-w-3xl">
            Complete Logistics <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D50000] to-[#FF6B6B]">Solutions</span>
          </h1>
          <p className="mt-6 text-white/70 max-w-2xl">Comprehensive freight forwarding services tailored to your unique supply chain needs.</p>
        </motion.div>
      </section>

      <section className="py-24 bg-gradient-to-b from-white via-[#F2F2F2] to-white">
         <div className="max-w-7xl mx-auto px-6 space-y-20">
           {services.map((service, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center p-8 rounded-2xl bg-white border border-gray-100 hover:border-[#D50000] hover:shadow-xl transition-all duration-300`}
             >
              <motion.div 
                className="flex-1"
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <motion.div 
                  className="w-14 h-14 rounded-xl bg-[#D50000]/10 flex items-center justify-center mb-5"
                  whileHover={{ scale: 1.15, rotate: 5 }}
                >
                  <service.icon className="w-7 h-7 text-[#D50000]" />
                </motion.div>
                <h3 className="text-3xl font-bold text-[#1A1A1A]">{service.title}</h3>
                <p className="mt-4 text-gray-600 leading-relaxed">{service.desc}</p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {service.features.map((f, j) => (
                    <motion.div 
                      key={j} 
                      className="flex items-center gap-2 text-sm text-gray-700 p-2 rounded hover:bg-[#D50000]/5 transition-colors"
                      whileHover={{ x: 5 }}
                    >
                      <Check className="w-4 h-4 text-[#D50000] flex-shrink-0" />
                      {f}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              <motion.div 
                className="flex-1 w-full"
                initial={{ opacity: 0, x: i % 2 === 0 ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <motion.div 
                  className="aspect-[4/3] bg-gradient-to-br from-[#F2F2F2] to-gray-100 rounded-2xl overflow-hidden relative shadow-lg"
                  whileHover={{ y: -10, shadow: '0 20px 40px rgba(0,0,0,0.3)' }}
                >
                  <img 
                    src={`https://images.unsplash.com/photo-${
                      service.title === 'Sea Freight' ? '1494412574643-ff11b0a5eb19' :
                      service.title === 'Air Freight' ? '1436491865332-7a61a109cc05' :
                      service.title === 'Inland Transportation' ? '1601584115197-04ecc0da31d7' :
                      service.title === 'Customs Clearance' ? '1450101499163-c8848c66ca85' :
                      service.title === 'Warehousing & Distribution' ? '1553413077-190dd305871c' :
                      service.title === 'Project Logistics' ? '1586528116311-ad8dd3c8310d' :
                      service.title === 'RoRo Services' ? '1492144534655-ae79c964c9d7' :
                      '1454165804606-c3d57bc86b40'
                    }?w=800&q=80`}
                    alt={service.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#D50000]/30 to-transparent" />
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-[#D50000]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white">Need a Custom Solution?</h2>
          <p className="mt-4 text-white/80">Contact our team for tailored logistics solutions.</p>
          <Link to={createPageUrl('RequestQuote')}>
            <Button size="lg" className="mt-8 bg-white text-[#D50000] hover:bg-gray-100 h-14 px-10 font-bold rounded-xl">
              Request a Quote <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}