import React from 'react';
import SectionHeading from '../components/shared/SectionHeading';
import { Target, Eye, Heart, Star, Users, Globe, Award, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const values = [
  { icon: Star, title: 'Excellence', desc: 'We strive for the highest standards in every shipment and interaction.' },
  { icon: Shield, title: 'Integrity', desc: 'Transparent and ethical business practices are at our core.' },
  { icon: Users, title: 'Partnership', desc: 'We build long-term relationships based on trust and mutual success.' },
  { icon: Award, title: 'Innovation', desc: 'Leveraging technology to drive efficiency and visibility.' },
];

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="relative py-32 bg-[#1A1A1A] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80"
            alt="Logistics"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <span className="text-[#D50000] text-sm font-semibold uppercase tracking-widest">About Us</span>
          <h1 className="text-4xl md:text-6xl font-black text-white mt-4 max-w-3xl leading-tight">
            A Reputation-Driven Logistics Company
          </h1>
          <p className="mt-6 text-white/60 text-lg max-w-2xl leading-relaxed">
            Tact Freight is a reputation-driven logistics & freight forwarding company headquartered in Cairo, Egypt. 
            We offer comprehensive supply chain solutions across all modes of transport, serving clients in six continents.
          </p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#D50000]/5 rounded-2xl" />
              <div className="relative bg-[#F2F2F2] rounded-2xl p-10">
                <div className="w-14 h-14 rounded-xl bg-[#D50000] flex items-center justify-center mb-6">
                  <Eye className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#1A1A1A]">Our Vision</h3>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  To be the most trusted and innovative logistics partner in the region, recognized for 
                  delivering exceptional supply chain solutions that drive our clients' success in global markets.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#D50000]/5 rounded-2xl" />
              <div className="relative bg-[#F2F2F2] rounded-2xl p-10">
                <div className="w-14 h-14 rounded-xl bg-[#1A1A1A] flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#1A1A1A]">Our Mission</h3>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  To simplify global trade by providing reliable, efficient, and technology-driven freight 
                  forwarding and logistics solutions. We are committed to creating value through professional 
                  credibility, integrated solutions, and unwavering dedication to client satisfaction.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-[#F2F2F2]">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading
            label="Our Values"
            title="What Drives Us Forward"
            description="Core principles that guide every decision and shipment we handle."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-shadow"
              >
                <div className="w-14 h-14 rounded-full bg-[#D50000]/10 flex items-center justify-center mx-auto mb-5">
                  <v.icon className="w-7 h-7 text-[#D50000]" />
                </div>
                <h4 className="font-bold text-lg text-[#1A1A1A]">{v.title}</h4>
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}