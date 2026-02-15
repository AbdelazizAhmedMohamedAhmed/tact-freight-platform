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
    <section className="py-20 bg-[#1A1A1A] relative overflow-hidden">
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80"
          alt=""
          className="w-full h-full object-cover opacity-10"
        />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="text-center"
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.3 }}
                className="text-4xl md:text-5xl font-black text-white mb-2"
              >
                {stat.value}
              </motion.div>
              <p className="text-white/60 text-sm font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}