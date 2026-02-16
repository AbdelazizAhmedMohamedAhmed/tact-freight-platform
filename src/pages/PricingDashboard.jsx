import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Clock, CheckCircle, FileText } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";

export default function PricingDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: allRFQs = [], isLoading } = useQuery({
    queryKey: ['pricing-rfqs'],
    queryFn: () => base44.entities.RFQ.filter({ status: 'pricing_in_progress' }, '-created_date', 100),
  });

  const myRFQs = allRFQs.filter(r => r.assigned_pricing === user?.email);
  
  const stats = {
    pendingPricing: allRFQs.length,
    myAssigned: myRFQs.length,
    completedToday: 0,
    avgResponseTime: '4h',
  };

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1A1A1A]">Pricing Dashboard</h1>
        <p className="text-gray-500 mt-1">Prepare quotations for RFQs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A1A1A]">{stats.pendingPricing}</p>
              <p className="text-sm text-gray-500">Pending Pricing</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A1A1A]">{stats.myAssigned}</p>
              <p className="text-sm text-gray-500">My Assigned</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A1A1A]">{stats.completedToday}</p>
              <p className="text-sm text-gray-500">Completed Today</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-gray-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A1A1A]">{stats.avgResponseTime}</p>
              <p className="text-sm text-gray-500">Avg Response</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Queue */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#1A1A1A]">Pricing Queue</h2>
          <Link to={createPageUrl('PricingQueue')}>
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        <div className="space-y-3">
          {allRFQs.slice(0, 10).map(rfq => (
            <div key={rfq.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <p className="font-semibold text-[#1A1A1A]">{rfq.reference_number}</p>
                <p className="text-sm text-gray-500">{rfq.company_name} • {rfq.mode} • {rfq.origin} → {rfq.destination}</p>
              </div>
              <div className="flex items-center gap-3">
                {rfq.assigned_pricing === user?.email && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-[#D50000] text-white">Assigned to Me</span>
                )}
              </div>
            </div>
          ))}
          {allRFQs.length === 0 && (
            <p className="text-center text-gray-400 py-8">No RFQs pending pricing</p>
          )}
        </div>
      </div>
    </div>
  );
}