import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import StatsCard from '../components/portal/StatsCard';
import { DollarSign, TrendingUp, Package, FileText } from 'lucide-react';

const COLORS = ['#D50000', '#1A1A1A', '#C0C0C0', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

export default function AdminAnalytics() {
  const { data: rfqs = [], isLoading: rfqL } = useQuery({
    queryKey: ['analytics-rfqs'], queryFn: () => base44.entities.RFQ.list('-created_date', 500),
  });
  const { data: shipments = [], isLoading: shipL } = useQuery({
    queryKey: ['analytics-shipments'], queryFn: () => base44.entities.Shipment.list('-created_date', 500),
  });

  const isLoading = rfqL || shipL;

  // RFQ by mode
  const rfqByMode = {};
  rfqs.forEach(r => { rfqByMode[r.mode] = (rfqByMode[r.mode] || 0) + 1; });
  const modeData = Object.entries(rfqByMode).map(([name, value]) => ({ name, value }));

  // RFQ status
  const rfqByStatus = {};
  rfqs.forEach(r => { rfqByStatus[r.status] = (rfqByStatus[r.status] || 0) + 1; });
  const statusData = Object.entries(rfqByStatus).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));

  // Quotation revenue
  const totalQuotation = rfqs.reduce((sum, r) => sum + (r.quotation_amount || 0), 0);
  const acceptedCount = rfqs.filter(r => r.status === 'accepted').length;
  const conversionRate = rfqs.length > 0 ? ((acceptedCount / rfqs.length) * 100).toFixed(1) : '0';

  // Top routes
  const routeCounts = {};
  rfqs.forEach(r => {
    const route = `${r.origin} → ${r.destination}`;
    routeCounts[route] = (routeCounts[route] || 0) + 1;
  });
  const topRoutes = Object.entries(routeCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  if (isLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid sm:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Business intelligence and performance metrics</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total RFQs" value={rfqs.length} icon={FileText} />
        <StatsCard title="Total Shipments" value={shipments.length} icon={Package} />
        <StatsCard title="Quoted Value" value={`$${totalQuotation.toLocaleString()}`} icon={DollarSign} />
        <StatsCard title="Conversion Rate" value={`${conversionRate}%`} icon={TrendingUp} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-[#1A1A1A] mb-4">RFQs by Transport Mode</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={modeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {modeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-[#1A1A1A] mb-4">RFQ Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#D50000" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-bold text-[#1A1A1A] mb-4">Top Trade Routes</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topRoutes} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={200} />
            <Tooltip />
            <Bar dataKey="value" fill="#1A1A1A" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}