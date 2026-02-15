import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="min-h-screen flex items-center justify-center bg-[#F2F2F2]">
        <Skeleton className="w-64 h-64 rounded-2xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A]">
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 rounded-2xl bg-[#D50000] flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Portal Login</h1>
          <p className="text-white/60 mb-8">Sign in to access your dashboard and manage your shipments</p>
          <Button 
            onClick={() => base44.auth.redirectToLogin(createPageUrl('Portal'))}
            className="bg-[#D50000] hover:bg-[#B00000] h-12 px-8 text-base font-semibold"
          >
            Sign In <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
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