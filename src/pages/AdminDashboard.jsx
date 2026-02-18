import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FileText, Ship, Users, BarChart3, TrendingUp, DollarSign, Building2 } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { data: rfqs = [], isLoading: rfqsLoading } = useQuery({
    queryKey: ['all-rfqs'],
    queryFn: () => base44.entities.RFQ.list('-created_date', 1000),
  });

  const { data: shipments = [], isLoading: shipmentsLoading } = useQuery({
    queryKey: ['all-shipments'],
    queryFn: () => base44.entities.Shipment.list('-created_date', 1000),
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
  });

  const stats = {
    totalRFQs: rfqs.length,
    confirmedRFQs: rfqs.filter(r => r.status === 'client_confirmed').length,
    totalShipments: shipments.length,
    activeShipments: shipments.filter(s => s.status !== 'delivered').length,
    totalUsers: users.length,
    clientUsers: users.filter(u => u.role === 'user').length,
  };

  if (rfqsLoading || shipmentsLoading || usersLoading) {
    return <div className="space-y-6"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1A1A1A]">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Complete system overview and management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
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

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Ship className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A1A1A]">{stats.totalShipments}</p>
              <p className="text-sm text-gray-500">Total Shipments</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A1A1A]">{stats.totalUsers}</p>
              <p className="text-sm text-gray-500">Total Users</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A1A1A]">{stats.confirmedRFQs}</p>
              <p className="text-sm text-gray-500">Confirmed RFQs</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <Ship className="w-6 h-6 text-red-600" />
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
              <p className="text-2xl font-bold text-[#1A1A1A]">{stats.clientUsers}</p>
              <p className="text-sm text-gray-500">Clients</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-6">
        <Link to={createPageUrl('AdminRFQs')}>
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <FileText className="w-8 h-8 text-[#D50000] mb-3" />
            <h3 className="font-bold text-[#1A1A1A]">Manage RFQs</h3>
            <p className="text-sm text-gray-500 mt-1">View and manage all RFQs</p>
          </div>
        </Link>

        <Link to={createPageUrl('AdminShipments')}>
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Ship className="w-8 h-8 text-[#D50000] mb-3" />
            <h3 className="font-bold text-[#1A1A1A]">Manage Shipments</h3>
            <p className="text-sm text-gray-500 mt-1">Track all shipments</p>
          </div>
        </Link>

        <Link to={createPageUrl('AdminUsers')}>
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Users className="w-8 h-8 text-[#D50000] mb-3" />
            <h3 className="font-bold text-[#1A1A1A]">Manage Users</h3>
            <p className="text-sm text-gray-500 mt-1">User roles and permissions</p>
          </div>
        </Link>

        <Link to={createPageUrl('Reporting')}>
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-[#D50000]">
            <TrendingUp className="w-8 h-8 text-[#D50000] mb-3" />
            <h3 className="font-bold text-[#1A1A1A]">Reporting & Analytics</h3>
            <p className="text-sm text-gray-500 mt-1">Business intelligence, client insights, operations</p>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">Recent RFQs</h2>
        <div className="space-y-3">
          {rfqs.slice(0, 10).map(rfq => (
            <div key={rfq.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-semibold text-[#1A1A1A]">{rfq.reference_number}</p>
                <p className="text-sm text-gray-500">{rfq.company_name} • {rfq.origin} → {rfq.destination}</p>
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