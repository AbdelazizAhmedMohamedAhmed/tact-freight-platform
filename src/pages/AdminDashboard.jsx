import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import StatsCard from '../components/portal/StatsCard';
import { Users, FileText, Ship, Activity, ArrowRight } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#D50000', '#1A1A1A', '#C0C0C0', '#FF6B6B', '#4ECDC4'];

export default function AdminDashboard() {
  const { data: rfqs = [], isLoading: rfqL } = useQuery({
    queryKey: ['admin-rfqs'], queryFn: () => base44.entities.RFQ.list('-created_date', 500),
  });
  const { data: shipments = [], isLoading: shipL } = useQuery({
    queryKey: ['admin-shipments'], queryFn: () => base44.entities.Shipment.list('-created_date', 500),
  });
  const { data: users = [], isLoading: userL } = useQuery({
    queryKey: ['admin-users'], queryFn: () => base44.entities.User.list('-created_date', 200),
  });

  // RFQ status distribution
  const rfqStatusCounts = {};
  rfqs.forEach(r => { rfqStatusCounts[r.status] = (rfqStatusCounts[r.status] || 0) + 1; });
  const rfqPieData = Object.entries(rfqStatusCounts).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));

  // Shipment mode distribution
  const modeCounts = {};
  shipments.forEach(s => { modeCounts[s.mode] = (modeCounts[s.mode] || 0) + 1; });
  const modeData = Object.entries(modeCounts).map(([name, value]) => ({ name, value }));

  const isLoading = rfqL || shipL || userL;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">System overview and analytics</p>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Users" value={users.length} icon={Users} />
          <StatsCard title="Total RFQs" value={rfqs.length} icon={FileText} />
          <StatsCard title="Active Shipments" value={shipments.filter(s => s.status !== 'delivered').length} icon={Ship} />
          <StatsCard title="Delivered" value={shipments.filter(s => s.status === 'delivered').length} icon={Activity} />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-[#1A1A1A] mb-4">RFQ Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={rfqPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {rfqPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-[#1A1A1A] mb-4">Shipments by Mode</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={modeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#D50000" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Manage Users', page: 'AdminUsers', icon: Users },
          { label: 'All RFQs', page: 'AdminRFQs', icon: FileText },
          { label: 'All Shipments', page: 'AdminShipments', icon: Ship },
          { label: 'Activity Log', page: 'AdminActivity', icon: Activity },
        ].map(item => (
          <Link key={item.page} to={createPageUrl(item.page)} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#D50000]/10 flex items-center justify-center">
              <item.icon className="w-6 h-6 text-[#D50000]" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[#1A1A1A]">{item.label}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </Link>
        ))}
      </div>
    </div>
  );
}