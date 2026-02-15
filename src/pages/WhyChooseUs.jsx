import React from 'react';
import SectionHeading from '../components/shared/SectionHeading';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { Layers, Award, Puzzle, Cpu, ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const reasons = [
  {
    icon: Layers, title: 'Supply Chain Simplification',
    desc: 'We turn complex global supply chains into streamlined operations. Our integrated approach reduces touchpoints, eliminates redundancy, and ensures cargo flows smoothly from origin to destination.',
    points: ['Single point of contact', 'End-to-end visibility', 'Simplified documentation', 'Proactive issue resolution'],
  },
  {
    icon: Award, title: 'Professional Credibility',
    desc: 'Backed by memberships in IATA, FIATA, and major global alliances, our credentials guarantee the highest standards of professional service and regulatory compliance.',
    points: ['IATA & FIATA certified', 'Proven track record', 'Trusted by major brands', 'Industry recognition'],
  },
  {
    icon: Puzzle, title: 'Integrated Solutions',
    desc: 'From freight forwarding to customs clearance, warehousing to last-mile delivery — all your logistics needs under one roof with seamless coordination.',
    points: ['Multi-modal capabilities', 'Customs brokerage', 'Warehousing integration', 'Distribution network'],
  },
  {
    icon: Cpu, title: 'Technology-Enabled Efficiency',
    desc: 'Advanced tracking systems, digital documentation, and real-time reporting give you complete control and visibility over your shipments at all times.',
    points: ['Real-time tracking', 'Digital documentation', 'Automated alerts', 'Analytics dashboard'],
  },
];

export default function WhyChooseUs() {
  return (
    <div>
      <section className="relative py-32 bg-[#1A1A1A]">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1920&q=80" alt="" className="w-full h-full object-cover opacity-15" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <span className="text-[#D50000] text-sm font-semibold uppercase tracking-widest">Why Tact Freight</span>
          <h1 className="text-4xl md:text-6xl font-black text-white mt-4 max-w-3xl">
            The Difference Is In The Details
          </h1>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 space-y-20">
          {reasons.map((reason, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-16 items-center`}
            >
              <div className="flex-1">
                <div className="w-16 h-16 rounded-2xl bg-[#D50000] flex items-center justify-center mb-6">
                  <reason.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-[#1A1A1A]">{reason.title}</h3>
                <p className="mt-4 text-gray-600 leading-relaxed text-lg">{reason.desc}</p>
                <div className="mt-6 space-y-3">
                  {reason.points.map((p, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#D50000]/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-[#D50000]" />
                      </div>
                      <span className="text-gray-700 font-medium">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 w-full">
                <div className="aspect-square bg-[#F2F2F2] rounded-3xl flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-[#D50000]/10 flex items-center justify-center">
                    <reason.icon className="w-16 h-16 text-[#D50000]/30" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-[#1A1A1A]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white">Experience the Tact Freight difference</h2>
          <Link to={createPageUrl('RequestQuote')}>
            <Button size="lg" className="mt-8 bg-[#D50000] hover:bg-[#B00000] text-white h-14 px-10 font-bold rounded-xl">
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}