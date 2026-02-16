import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { FileText, Ship, Plus, Package, Clock, CheckCircle } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: rfqs = [], isLoading: rfqsLoading } = useQuery({
    queryKey: ['my-rfqs'],
    queryFn: () => base44.entities.RFQ.filter({ client_email: user?.email }, '-created_date', 10),
    enabled: !!user?.email,
  });

  const { data: shipments = [], isLoading: shipmentsLoading } = useQuery({
    queryKey: ['my-shipments'],
    queryFn: () => base44.entities.Shipment.filter({ client_email: user?.email }, '-created_date', 10),
    enabled: !!user?.email,
  });

  const stats = {
    totalRFQs: rfqs.length,
    pendingRFQs: rfqs.filter(r => !['client_confirmed', 'rejected'].includes(r.status)).length,
    activeShipments: shipments.filter(s => s.status !== 'delivered').length,
    completedShipments: shipments.filter(s => s.status === 'delivered').length,
  };

  if (rfqsLoading || shipmentsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Welcome, {user?.full_name}</h1>
          <p className="text-gray-500 mt-1">Manage your shipments and requests</p>
        </div>
        <Link to={createPageUrl('RequestQuote')}>
          <Button className="bg-[#D50000] hover:bg-[#B00000]">
            <Plus className="w-4 h-4 mr-2" /> New RFQ
          </Button>
        </Link>
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
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A1A1A]">{stats.pendingRFQs}</p>
              <p className="text-sm text-gray-500">Pending RFQs</p>
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
              <CheckCircle className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A1A1A]">{stats.completedShipments}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent RFQs */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#1A1A1A]">Recent RFQs</h2>
          <Link to={createPageUrl('ClientRFQs')}>
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        <div className="space-y-3">
          {rfqs.slice(0, 5).map(rfq => (
            <div key={rfq.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-semibold text-[#1A1A1A]">{rfq.reference_number}</p>
                <p className="text-sm text-gray-500">{rfq.origin} → {rfq.destination}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {rfq.status.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
          {rfqs.length === 0 && (
            <p className="text-center text-gray-400 py-8">No RFQs yet. Create your first request!</p>
          )}
        </div>
      </div>

      {/* Active Shipments */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#1A1A1A]">Active Shipments</h2>
          <Link to={createPageUrl('ClientShipments')}>
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        <div className="space-y-3">
          {shipments.filter(s => s.status !== 'delivered').slice(0, 5).map(shipment => (
            <div key={shipment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-semibold text-[#1A1A1A]">{shipment.tracking_number}</p>
                <p className="text-sm text-gray-500">{shipment.origin} → {shipment.destination}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                {shipment.status.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
          {shipments.filter(s => s.status !== 'delivered').length === 0 && (
            <p className="text-center text-gray-400 py-8">No active shipments</p>
          )}
        </div>
      </div>
    </div>
  );
}