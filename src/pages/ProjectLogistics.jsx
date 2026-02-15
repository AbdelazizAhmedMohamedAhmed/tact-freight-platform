import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { Compass, Check, Hammer, Users, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProjectLogistics() {
  const benefits = [
    { icon: Hammer, title: 'Heavy Lift Expertise', desc: 'Specialized handling of oversized and heavy cargo' },
    { icon: Users, title: 'Project Management', desc: 'Dedicated teams for complex logistics operations' },
    { icon: Target, title: 'Precision Planning', desc: 'Custom solutions tailored to project requirements' },
  ];

  const features = [
    'Oversized cargo handling',
    'Heavy-lift operations',
    'Breakbulk shipping services',
    'Project cargo insurance',
    'Route planning and logistics',
    'Equipment rental and support',
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F]">
        <motion.div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80"
            alt="Project Logistics"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A] via-[#1A1A1A]/85 to-[#0F0F0F]/70" />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#D50000]/20 flex items-center justify-center">
                <Compass className="w-6 h-6 text-[#D50000]" />
              </div>
              <span className="text-[#D50000] font-bold text-lg">Project Logistics Solutions</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tighter max-w-3xl">
              Complex <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D50000] to-[#FF6B6B]">Project Cargo</span>
            </h1>

            <p className="mt-8 text-lg text-white/70 leading-relaxed max-w-2xl font-light">
              Specialized logistics for demanding projects. We handle the most complex cargo movements with expertise and precision.
            </p>

            <Link to={createPageUrl('RequestQuote')}>
              <Button size="lg" className="bg-[#D50000] hover:bg-[#B00000] text-white px-8 h-14 mt-8 text-base font-bold rounded-xl shadow-lg">
                Get a Quote
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-6">Why Choose Our Project Logistics?</h2>
            <p className="text-lg text-gray-600 max-w-2xl">Expert handling of challenging cargo movements and complex logistics operations.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200"
              >
                <div className="w-14 h-14 rounded-xl bg-[#D50000]/10 flex items-center justify-center mb-6">
                  <benefit.icon className="w-7 h-7 text-[#D50000]" />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A]">Our Project Logistics Services</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-4 p-6 rounded-xl bg-white border border-gray-200/50 hover:border-[#D50000]/20 transition-colors"
              >
                <Check className="w-6 h-6 text-[#D50000] flex-shrink-0 mt-1" />
                <span className="text-lg text-gray-700 font-medium">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#D50000] to-[#B00000]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Have a Complex Project?</h2>
            <p className="text-white/90 text-xl mb-8 max-w-2xl mx-auto">Our specialists are ready to plan and execute your project logistics.</p>
            <Link to={createPageUrl('RequestQuote')}>
              <Button size="lg" className="bg-white text-[#D50000] hover:bg-gray-100 px-8 h-14 text-base font-bold rounded-xl">
                Request a Quote Today
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}