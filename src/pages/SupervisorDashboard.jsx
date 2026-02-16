import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FileText, Ship, Users, TrendingUp } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export default function SupervisorDashboard() {
  const { data: rfqs = [], isLoading: rfqsLoading } = useQuery({
    queryKey: ['all-rfqs'],
    queryFn: () => base44.entities.RFQ.list('-created_date', 100),
  });

  const { data: shipments = [], isLoading: shipmentsLoading } = useQuery({
    queryKey: ['all-shipments'],
    queryFn: () => base44.entities.Shipment.list('-created_date', 100),
  });

  const stats = {
    totalRFQs: rfqs.length,
    activeRFQs: rfqs.filter(r => !['client_confirmed', 'rejected'].includes(r.status)).length,
    activeShipments: shipments.filter(s => s.status !== 'delivered').length,
    delivered: shipments.filter(s => s.status === 'delivered').length,
  };

  if (rfqsLoading || shipmentsLoading) {
    return <div className="space-y-6"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1A1A1A]">Supervisor Dashboard</h1>
        <p className="text-gray-500 mt-1">Monitor team performance and workflows</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A1A1A]">{stats.totalRFQs}</p>
              <p className="text-sm text-gray-500">Total RFQs</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A1A1A]">{stats.activeRFQs}</p>
              <p className="text-sm text-gray-500">Active RFQs</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Ship className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A1A1A]">{stats.activeShipments}</p>
              <p className="text-sm text-gray-500">Active Shipments</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-gray-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A1A1A]">{stats.delivered}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">Recent RFQs</h2>
        <div className="space-y-3">
          {rfqs.slice(0, 10).map(rfq => (
            <div key={rfq.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-[#1A1A1A]">{rfq.reference_number}</p>
                <p className="text-sm text-gray-500">{rfq.company_name}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {rfq.status.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}