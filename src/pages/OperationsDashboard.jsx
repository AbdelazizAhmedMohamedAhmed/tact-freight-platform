import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Ship, Truck, Package, CheckCircle } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import PendingAmendments from '../components/operations/PendingAmendments';

export default function OperationsDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: shipments = [], isLoading, refetch: refetchShipments } = useQuery({
    queryKey: ['all-shipments'],
    queryFn: () => base44.entities.Shipment.list('-created_date', 100),
  });

  const myShipments = shipments.filter(s => s.assigned_operations === user?.email);
  
  const stats = {
    totalActive: shipments.filter(s => s.status !== 'delivered').length,
    myAssigned: myShipments.length,
    inTransit: shipments.filter(s => s.status === 'in_transit').length,
    delivered: shipments.filter(s => s.status === 'delivered').length,
  };

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Operations Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage shipments and logistics</p>
        </div>
        <Link to={createPageUrl('CreateShipment')}>
          <Button className="bg-[#D50000] hover:bg-[#B00000]">
            <Package className="w-4 h-4 mr-2" /> Create Shipment
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Ship className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A1A1A]">{stats.totalActive}</p>
              <p className="text-sm text-gray-500">Active Shipments</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A1A1A]">{stats.myAssigned}</p>
              <p className="text-sm text-gray-500">My Assigned</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <Truck className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A1A1A]">{stats.inTransit}</p>
              <p className="text-sm text-gray-500">In Transit</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A1A1A]">{stats.delivered}</p>
              <p className="text-sm text-gray-500">Delivered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Amendments */}
      <PendingAmendments refetch={refetchShipments} />

      {/* Active Shipments */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#1A1A1A]">Active Shipments</h2>
          <Link to={createPageUrl('OperationsShipments')}>
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        <div className="space-y-3">
          {shipments.filter(s => s.status !== 'delivered').slice(0, 10).map(shipment => (
            <div key={shipment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <p className="font-semibold text-[#1A1A1A]">{shipment.tracking_number}</p>
                <p className="text-sm text-gray-500">{shipment.company_name} • {shipment.origin} → {shipment.destination}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {shipment.status.replace(/_/g, ' ')}
                </span>
                {shipment.assigned_operations === user?.email && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-[#D50000] text-white">Mine</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}