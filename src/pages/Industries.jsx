import React from 'react';
import SectionHeading from '../components/shared/SectionHeading';
import { Car, Building2, ShoppingCart, Heart, Wheat, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const industries = [
  { icon: Car, title: 'Automotive & Heavy Machinery', desc: 'End-to-end logistics for automotive manufacturers and heavy machinery importers. We serve BMW, Nissan, Geely, Suzuki, and more.', img: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80' },
  { icon: Building2, title: 'Construction & Infrastructure', desc: 'Project logistics for construction materials, steel, cement, and oversized equipment for major infrastructure projects.', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80' },
  { icon: ShoppingCart, title: 'Retail & Consumer Goods', desc: 'Fast-moving consumer goods logistics with warehousing, distribution, and last-mile delivery capabilities.', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80' },
  { icon: Heart, title: 'Pharmaceuticals & Healthcare', desc: 'Temperature-controlled and compliant logistics for pharmaceutical products, medical devices, and healthcare supplies.', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80' },
  { icon: Wheat, title: 'Agriculture & Food Products', desc: 'Specialized handling of perishable goods, grains, and agricultural commodities with reefer and bulk shipping options.', img: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80' },
  { icon: Zap, title: 'Energy & Industrial Projects', desc: 'Heavy-lift and project cargo for the energy sector including oil & gas, renewable energy, and industrial installations.', img: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80' },
];

export default function Industries() {
  return (
    <div>
      <section className="relative py-32 bg-[#1A1A1A]">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1553413077-190dd305871c?w=1920&q=80" alt="" className="w-full h-full object-cover opacity-15" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <span className="text-[#D50000] text-sm font-semibold uppercase tracking-widest">Industries</span>
          <h1 className="text-4xl md:text-6xl font-black text-white mt-4 max-w-3xl">
            Sector-Specific Expertise
          </h1>
          <p className="mt-6 text-white/60 text-lg max-w-xl">
            Tailored logistics solutions for diverse industry verticals.
          </p>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {industries.map((ind, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={ind.img}
                    alt={ind.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-8">
                  <div className="w-12 h-12 rounded-xl bg-[#D50000]/10 flex items-center justify-center mb-4">
                    <ind.icon className="w-6 h-6 text-[#D50000]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1A1A]">{ind.title}</h3>
                  <p className="mt-3 text-gray-500 text-sm leading-relaxed">{ind.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}