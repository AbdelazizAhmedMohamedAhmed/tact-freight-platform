import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Globe, Award } from 'lucide-react';

const stats = [
  { icon: Globe, value: '50+', label: 'Global Destinations', color: 'from-blue-500 to-blue-600' },
  { icon: Users, value: '500+', label: 'Active Clients', color: 'from-green-500 to-green-600' },
  { icon: TrendingUp, value: '10K+', label: 'Shipments Delivered', color: 'from-purple-500 to-purple-600' },
  { icon: Award, value: '15+', label: 'Years of Excellence', color: 'from-orange-500 to-orange-600' },
];

export default function StatsSection() {
  return (
    <section className="py-32 bg-gradient-to-b from-[#1A1A1A] via-[#0F0F0F] to-[#000000] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80"
          alt=""
          className="w-full h-full object-cover opacity-5"
        />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-[#000000]/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-black text-white">Our Impact</h2>
          <p className="mt-4 text-white/60 max-w-2xl mx-auto">Setting industry standards with reliable, proven results</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/8 hover:border-white/20 transition-all duration-300"
              whileHover={{ y: -5 }}
            >
              <motion.div 
                className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-2xl`}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <stat.icon className="w-10 h-10 text-white" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.3 }}
                className="text-4xl md:text-5xl font-black text-white mb-3"
              >
                {stat.value}
              </motion.div>
              <p className="text-white/70 text-sm font-semibold">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}