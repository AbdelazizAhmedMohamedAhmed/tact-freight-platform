import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { Ship, Plane, Truck, Package, TrendingUp, CheckCircle, Clock, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import StatusBadge from '../components/shared/StatusBadge';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

const COLORS = ['#D50000', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
const modeIcons = { sea: Ship, air: Plane, inland: Truck };

function KPI({ label, value, sub, borderColor, bgColor, textColor, Icon }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${borderColor}`}>
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${textColor}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-[#1A1A1A]">{value}</p>
          <p className="text-sm text-gray-600">{label}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

export default function ClientReporting() {
  const [user, setUser] = useState(null);
  const [companyId, setCompanyId] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setCompanyId(u.company_id || null);
    }).catch(() => {});
  }, []);

  const { data: shipments = [], isLoading: shipL } = useQuery({
    queryKey: ['my-shipments-report', companyId, user?.email],
    queryFn: () => companyId
      ? base44.entities.Shipment.filter({ company_id: companyId }, '-created_date', 500)
      : base44.entities.Shipment.filter({ client_email: user.email }, '-created_date', 500),
    enabled: !!user,
  });

  const { data: rfqs = [], isLoading: rfqL } = useQuery({
    queryKey: ['my-rfqs-report', companyId, user?.email],
    queryFn: () => companyId
      ? base44.entities.RFQ.filter({ company_id: companyId }, '-created_date', 500)
      : base44.entities.RFQ.filter({ client_email: user.email }, '-created_date', 500),
    enabled: !!user,
  });

  const isLoading = shipL || rfqL;

  const metrics = useMemo(() => {
    const active = shipments.filter(s => s.status !== 'delivered').length;
    const delivered = shipments.filter(s => s.status === 'delivered').length;
    const pending = rfqs.filter(r => ['submitted', 'sales_review', 'pricing_in_progress', 'quotation_ready', 'sent_to_client'].includes(r.status)).length;
    const confirmed = rfqs.filter(r => r.status === 'client_confirmed').length;
    return { active, delivered, pending, confirmed };
  }, [shipments, rfqs]);

  const shipmentByStatus = useMemo(() => {
    const m = {};
    shipments.forEach(s => { m[s.status] = (m[s.status] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));
  }, [shipments]);

  const modeData = useMemo(() => {
    const m = {};
    shipments.forEach(s => { if (s.mode) m[s.mode] = (m[s.mode] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [shipments]);

  // Monthly activity for last 6 months
  const monthlyData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(new Date(), 5 - i);
      const start = startOfMonth(d);
      const end = endOfMonth(d);
      const inRange = item => item.created_date && isWithinInterval(parseISO(item.created_date), { start, end });
      return {
        month: format(d, 'MMM'),
        Shipments: shipments.filter(inRange).length,
        RFQs: rfqs.filter(inRange).length,
      };
    });
  }, [shipments, rfqs]);

  const recentShipments = [...shipments].sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date)).slice(0, 5);

  if (isLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-[#D50000]" /> My Reports
        </h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your shipments and RFQ activity</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Active Shipments" value={metrics.active} sub="currently in transit" borderColor="border-blue-500" bgColor="bg-blue-50" textColor="text-blue-600" Icon={Ship} />
        <KPI label="Delivered" value={metrics.delivered} sub="completed shipments" borderColor="border-green-500" bgColor="bg-green-50" textColor="text-green-600" Icon={CheckCircle} />
        <KPI label="Pending RFQs" value={metrics.pending} sub="awaiting quote" borderColor="border-orange-500" bgColor="bg-orange-50" textColor="text-orange-600" Icon={Clock} />
        <KPI label="Confirmed Orders" value={metrics.confirmed} sub="accepted quotes" borderColor="border-red-500" bgColor="bg-red-50" textColor="text-red-600" Icon={FileText} />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-bold text-[#1A1A1A] mb-4">Activity — Last 6 Months</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="gShip" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D50000" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D50000" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gRFQ" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="Shipments" stroke="#D50000" fill="url(#gShip)" />
              <Area type="monotone" dataKey="RFQs" stroke="#3B82F6" fill="url(#gRFQ)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-bold text-[#1A1A1A] mb-4">Shipment Mode Mix</h2>
          {modeData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={modeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {modeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Shipment status breakdown */}
      {shipmentByStatus.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-bold text-[#1A1A1A] mb-4">Shipments by Status</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={shipmentByStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#D50000" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent shipments table */}
      {recentShipments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="font-bold text-[#1A1A1A]">Recent Shipments</h2>
          </div>
          <div className="divide-y">
            {recentShipments.map(s => {
              const MIcon = modeIcons[s.mode] || Ship;
              return (
                <div key={s.id} className="flex items-center justify-between px-6 py-3 text-sm hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <MIcon className="w-4 h-4 text-gray-400" />
                    <span className="font-mono font-semibold text-[#D50000]">{s.tracking_number}</span>
                    <span className="text-gray-500">{s.origin} → {s.destination}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={s.status} />
                    <span className="text-xs text-gray-400">ETA: {s.eta ? format(new Date(s.eta), 'MMM d, yyyy') : 'N/A'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {shipments.length === 0 && rfqs.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-16 text-center">
          <TrendingUp className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No data yet</p>
          <p className="text-gray-400 text-sm mt-1">Reports will appear once you have shipments or RFQs.</p>
        </div>
      )}
    </div>
  );
}