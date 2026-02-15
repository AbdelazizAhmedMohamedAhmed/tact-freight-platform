import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from 'framer-motion';

export default function Portal() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F2F2F2] to-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="space-y-4">
          <Skeleton className="w-64 h-64 rounded-2xl" />
          <Skeleton className="w-48 h-8 rounded-lg mx-auto" />
        </div>
      </motion.div>
    );
  }

  if (!user) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1A1A] via-[#0F0F0F] to-[#000000] relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-[#D50000]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#D50000]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <motion.div 
          className="text-center max-w-md px-6 relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D50000] to-[#B00000] flex items-center justify-center mx-auto mb-6 shadow-2xl"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
          >
            <LogIn className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1 
            className="text-4xl md:text-5xl font-black text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Welcome Back
          </motion.h1>
          <motion.p 
            className="text-white/70 mb-8 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Sign in to access your dashboard and manage your shipments with ease.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={() => base44.auth.redirectToLogin(createPageUrl('Portal'))}
              className="bg-gradient-to-r from-[#D50000] to-[#B00000] hover:shadow-2xl h-12 px-10 text-base font-semibold text-white shadow-lg transition-all"
            >
              Sign In <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  // Redirect based on user role/department
  const dept = user.department || 'client';
  const redirectPage = 
    dept === 'admin' ? 'AdminDashboard' :
    dept === 'sales' ? 'SalesDashboard' :
    dept === 'pricing' ? 'PricingDashboard' :
    dept === 'operations' ? 'OperationsDashboard' :
    'ClientDashboard';

  window.location.href = createPageUrl(redirectPage);
  
  return null;
}