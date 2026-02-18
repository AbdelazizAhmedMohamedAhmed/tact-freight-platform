import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '../components/shared/StatusBadge';
import {
  Download, TrendingUp, Package, FileText, DollarSign, Users,
  CheckCircle, Clock, Ship, Plane, Truck, Search, ChevronDown, ChevronUp, BarChart3
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, isWithinInterval, parseISO } from 'date-fns';

const COLORS = ['#D50000', '#1A1A1A', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];
const modeIcons = { sea: Ship, air: Plane, inland: Truck };

function MetricCard({ title, value, sub, color = 'gray' }) {
  const colorMap = {
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    gray: 'bg-gray-50 text-gray-700',
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{title}</p>
      <p className={`text-3xl font-bold mt-1 ${colorMap[color].split(' ')[1]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function Reporting() {
  const [dateRange, setDateRange] = useState('30');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [expandedClient, setExpandedClient] = useState(null);
  const [clientSort, setClientSort] = useState('shipments');

  const { data: rfqs = [], isLoading: rfqL } = useQuery({
    queryKey: ['report-rfqs'], queryFn: () => base44.entities.RFQ.list('-created_date', 1000),
  });
  const { data: shipments = [], isLoading: shipL } = useQuery({
    queryKey: ['report-shipments'], queryFn: () => base44.entities.Shipment.list('-created_date', 1000),
  });
  const { data: clients = [], isLoading: clientL } = useQuery({
    queryKey: ['report-clients'], queryFn: () => base44.entities.ClientCompany.list('-created_date', 500),
  });
  const { data: activities = [], isLoading: actL } = useQuery({
    queryKey: ['report-activities'], queryFn: () => base44.entities.ActivityLog.list('-created_date', 500),
  });

  const isLoading = rfqL || shipL || clientL || actL;

  // ── Date filter ──────────────────────────────────────────────────────────
  const { dateFilter } = useMemo(() => {
    let start, end;
    if (dateRange === 'custom' && startDate && endDate) {
      start = startOfDay(parseISO(startDate));
      end = endOfDay(parseISO(endDate));
    } else {
      const days = parseInt(dateRange);
      end = endOfDay(new Date());
      start = startOfDay(subDays(end, days));
    }
    return { dateFilter: { start, end } };
  }, [dateRange, startDate, endDate]);

  const inRange = (item) => {
    if (!item.created_date) return false;
    return isWithinInterval(parseISO(item.created_date), dateFilter);
  };

  const filteredRFQs = useMemo(() => rfqs.filter(inRange), [rfqs, dateFilter]);
  const filteredShipments = useMemo(() => shipments.filter(inRange), [shipments, dateFilter]);
  const filteredActivities = useMemo(() => activities.filter(inRange), [activities, dateFilter]);

  // ── Business metrics ─────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const totalRFQs = filteredRFQs.length;
    const confirmedRFQs = filteredRFQs.filter(r => r.status === 'client_confirmed').length;
    const rejectedRFQs = filteredRFQs.filter(r => r.status === 'rejected').length;
    const conversionRate = totalRFQs > 0 ? ((confirmedRFQs / totalRFQs) * 100).toFixed(1) : '0';
    const totalQuotedValue = filteredRFQs.reduce((s, r) => s + (r.quotation_amount || 0), 0);
    const confirmedValue = filteredRFQs.filter(r => r.status === 'client_confirmed').reduce((s, r) => s + (r.quotation_amount || 0), 0);
    const wonRevenue = rfqs.filter(r => r.final_status === 'won').reduce((s, r) => s + (r.final_value || 0), 0);

    const totalShipments = filteredShipments.length;
    const delivered = filteredShipments.filter(s => s.status === 'delivered').length;
    const active = filteredShipments.filter(s => !['delivered'].includes(s.status)).length;
    const deliveryRate = totalShipments > 0 ? ((delivered / totalShipments) * 100).toFixed(1) : '0';

    const days = Math.max(1, Math.ceil((dateFilter.end - dateFilter.start) / 86400000));
    const avgActivities = (filteredActivities.length / days).toFixed(1);

    return {
      totalRFQs, confirmedRFQs, rejectedRFQs, conversionRate,
      totalQuotedValue, confirmedValue, wonRevenue,
      totalShipments, delivered, active, deliveryRate,
      avgActivities,
    };
  }, [filteredRFQs, filteredShipments, filteredActivities, rfqs, dateFilter]);

  // ── Chart data ────────────────────────────────────────────────────────────
  const rfqStatusData = useMemo(() => {
    const counts = {};
    filteredRFQs.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));
  }, [filteredRFQs]);

  const rfqModeData = useMemo(() => {
    const counts = {};
    filteredRFQs.forEach(r => { if (r.mode) counts[r.mode] = (counts[r.mode] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [filteredRFQs]);

  const shipmentStatusData = useMemo(() => {
    const counts = {};
    filteredShipments.forEach(s => { counts[s.status] = (counts[s.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));
  }, [filteredShipments]);

  const topRoutes = useMemo(() => {
    const counts = {};
    filteredRFQs.forEach(r => {
      const route = `${r.origin} → ${r.destination}`;
      counts[route] = (counts[route] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));
  }, [filteredRFQs]);

  const timeSeriesData = useMemo(() => {
    const days = Math.min(60, Math.ceil((dateFilter.end - dateFilter.start) / 86400000));
    const data = [];
    for (let i = 0; i < days; i++) {
      const date = startOfDay(subDays(dateFilter.end, days - i - 1));
      const label = format(date, 'MMM dd');
      const dayRFQs = filteredRFQs.filter(r => startOfDay(parseISO(r.created_date)).getTime() === date.getTime()).length;
      const dayShipments = filteredShipments.filter(s => startOfDay(parseISO(s.created_date)).getTime() === date.getTime()).length;
      data.push({ date: label, RFQs: dayRFQs, Shipments: dayShipments });
    }
    return data;
  }, [filteredRFQs, filteredShipments, dateFilter]);

  // ── Client intelligence ───────────────────────────────────────────────────
  const clientStats = useMemo(() => {
    return clients.map(client => {
      const clientShipments = shipments.filter(s =>
        s.company_id === client.id ||
        s.company_name?.toLowerCase() === client.name?.toLowerCase() ||
        (client.member_emails || []).includes(s.client_email)
      );
      const clientRFQs = rfqs.filter(r =>
        r.company_id === client.id ||
        r.company_name?.toLowerCase() === client.name?.toLowerCase() ||
        (client.member_emails || []).includes(r.client_email || r.email)
      );
      const byMode = clientShipments.reduce((acc, s) => {
        acc[s.mode] = (acc[s.mode] || 0) + 1; return acc;
      }, {});
      return {
        ...client,
        totalShipments: clientShipments.length,
        activeShipments: clientShipments.filter(s => s.status !== 'delivered').length,
        deliveredShipments: clientShipments.filter(s => s.status === 'delivered').length,
        totalRFQs: clientRFQs.length,
        byMode,
        shipmentsList: clientShipments,
        rfqsList: clientRFQs,
      };
    });
  }, [clients, shipments, rfqs]);

  const filteredClients = useMemo(() => {
    let list = clientStats.filter(c =>
      c.name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.primary_contact_email?.toLowerCase().includes(clientSearch.toLowerCase())
    );
    if (clientSort === 'shipments') list = [...list].sort((a, b) => b.totalShipments - a.totalShipments);
    if (clientSort === 'rfqs') list = [...list].sort((a, b) => b.totalRFQs - a.totalRFQs);
    if (clientSort === 'active') list = [...list].sort((a, b) => b.activeShipments - a.activeShipments);
    return list;
  }, [clientStats, clientSearch, clientSort]);

  const clientChartData = filteredClients.slice(0, 10).map(c => ({
    name: c.name?.length > 14 ? c.name.slice(0, 12) + '…' : c.name,
    Shipments: c.totalShipments,
    RFQs: c.totalRFQs,
    Active: c.activeShipments,
  }));

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = () => {
    const rows = [
      ['Type', 'Reference', 'Company', 'Origin', 'Destination', 'Mode', 'Status', 'Created'],
      ...filteredRFQs.map(r => ['RFQ', r.reference_number, r.company_name, r.origin, r.destination, r.mode, r.status, r.created_date?.slice(0, 10)]),
      ...filteredShipments.map(s => ['Shipment', s.tracking_number, s.company_name, s.origin, s.destination, s.mode, s.status, s.created_date?.slice(0, 10)]),
    ];
    const csv = rows.map(r => r.map(v => `"${v || ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `report-${format(new Date(), 'yyyy-MM-dd')}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#D50000]" /> Reporting & Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-1">Unified business intelligence across RFQs, shipments, and clients</p>
        </div>
        <Button onClick={handleExport} className="bg-[#D50000] hover:bg-[#B00000]">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-wrap items-end gap-4 border border-gray-100">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">Period</p>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="180">Last 6 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {dateRange === 'custom' && (
          <>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500">From</p>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-40" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500">To</p>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-40" />
            </div>
          </>
        )}
        <p className="text-sm text-gray-500 pb-0.5">
          {format(dateFilter.start, 'MMM d, yyyy')} — {format(dateFilter.end, 'MMM d, yyyy')}
        </p>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : (
        <Tabs defaultValue="overview">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW TAB ────────────────────────────────────────── */}
          <TabsContent value="overview" className="space-y-6 mt-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard title="Total RFQs" value={metrics.totalRFQs} sub={`in selected period`} color="blue" />
              <MetricCard title="Confirmed RFQs" value={metrics.confirmedRFQs} sub={`${metrics.conversionRate}% conversion`} color="green" />
              <MetricCard title="Total Shipments" value={metrics.totalShipments} sub={`${metrics.active} active`} color="red" />
              <MetricCard title="Won Revenue" value={`$${(metrics.wonRevenue/1000).toFixed(1)}K`} sub="all time" color="orange" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard title="Quoted Value" value={`$${(metrics.totalQuotedValue/1000).toFixed(1)}K`} color="purple" />
              <MetricCard title="Confirmed Value" value={`$${(metrics.confirmedValue/1000).toFixed(1)}K`} color="green" />
              <MetricCard title="Delivered" value={metrics.delivered} sub={`${metrics.deliveryRate}% delivery rate`} color="green" />
              <MetricCard title="Avg Activities/Day" value={metrics.avgActivities} color="gray" />
            </div>

            {/* Time series */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-bold text-[#1A1A1A] mb-4">RFQs & Shipments Over Time</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={timeSeriesData}>
                  <defs>
                    <linearGradient id="gRFQ" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D50000" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#D50000" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gShip" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="RFQs" stroke="#D50000" fill="url(#gRFQ)" />
                  <Area type="monotone" dataKey="Shipments" stroke="#1A1A1A" fill="url(#gShip)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Mode + Status */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="font-bold text-[#1A1A1A] mb-4">RFQs by Transport Mode</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={rfqModeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                      {rfqModeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="font-bold text-[#1A1A1A] mb-4">RFQ Status Breakdown</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={rfqStatusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#D50000" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance bars */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 space-y-6">
              <h3 className="font-bold text-[#1A1A1A]">Performance Snapshot</h3>
              {[
                { label: 'RFQ Conversion Rate', value: metrics.conversionRate, sub: `${metrics.confirmedRFQs} confirmed / ${metrics.totalRFQs} total`, color: 'bg-[#D50000]' },
                { label: 'Shipment Delivery Rate', value: metrics.deliveryRate, sub: `${metrics.delivered} delivered / ${metrics.totalShipments} total`, color: 'bg-green-600' },
              ].map(({ label, value, sub, color }) => (
                <div key={label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <span className="text-sm font-bold">{value}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className={`${color} h-2.5 rounded-full transition-all`} style={{ width: `${Math.min(100, value)}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{sub}</p>
                </div>
              ))}
            </div>

            {/* Top routes */}
            {topRoutes.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="font-bold text-[#1A1A1A] mb-4">Top Trade Routes</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={topRoutes} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={180} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1A1A1A" radius={[0,6,6,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>

          {/* ── OPERATIONS TAB ────────────────────────────────────────── */}
          <TabsContent value="operations" className="space-y-6 mt-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard title="Total Shipments" value={metrics.totalShipments} color="red" />
              <MetricCard title="Active" value={metrics.active} color="blue" />
              <MetricCard title="Delivered" value={metrics.delivered} color="green" />
              <MetricCard title="Delivery Rate" value={`${metrics.deliveryRate}%`} color="green" />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="font-bold text-[#1A1A1A] mb-4">Shipment Status Distribution</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={shipmentStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {shipmentStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="font-bold text-[#1A1A1A] mb-4">Shipments by Mode</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={(() => {
                    const c = {};
                    filteredShipments.forEach(s => { if (s.mode) c[s.mode] = (c[s.mode] || 0) + 1; });
                    return Object.entries(c).map(([name, value]) => ({ name: name.charAt(0).toUpperCase()+name.slice(1), value }));
                  })()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#D50000" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Shipment table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h3 className="font-bold text-[#1A1A1A]">Recent Shipments ({filteredShipments.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-6 py-3">Tracking</th>
                      <th className="text-left px-6 py-3">Client</th>
                      <th className="text-left px-6 py-3">Route</th>
                      <th className="text-left px-6 py-3">Mode</th>
                      <th className="text-left px-6 py-3">Status</th>
                      <th className="text-left px-6 py-3">ETA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredShipments.slice(0, 20).map(s => {
                      const MIcon = modeIcons[s.mode] || Ship;
                      return (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="px-6 py-3 font-mono font-semibold text-[#D50000]">{s.tracking_number}</td>
                          <td className="px-6 py-3 text-gray-700">{s.company_name || s.client_email || '—'}</td>
                          <td className="px-6 py-3 text-gray-500">{s.origin} → {s.destination}</td>
                          <td className="px-6 py-3"><span className="flex items-center gap-1.5 text-gray-600"><MIcon className="w-3.5 h-3.5" />{s.mode}</span></td>
                          <td className="px-6 py-3"><StatusBadge status={s.status} /></td>
                          <td className="px-6 py-3 text-gray-500">{s.eta ? format(new Date(s.eta), 'MMM d, yyyy') : '—'}</td>
                        </tr>
                      );
                    })}
                    {filteredShipments.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">No shipments in this period</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ── CLIENTS TAB ────────────────────────────────────────────── */}
          <TabsContent value="clients" className="space-y-6 mt-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard title="Total Clients" value={clients.length} color="blue" />
              <MetricCard title="With Shipments" value={clientStats.filter(c => c.totalShipments > 0).length} color="green" />
              <MetricCard title="Total Linked Shipments" value={shipments.filter(s => s.company_id || s.company_name || s.client_email).length} color="red" />
              <MetricCard title="Total RFQs" value={rfqs.length} color="orange" />
            </div>

            {/* Top clients chart */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-bold text-[#1A1A1A] mb-4">Top 10 Clients — Shipments vs RFQs</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={clientChartData} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Shipments" fill="#D50000" radius={[4,4,0,0]} />
                  <Bar dataKey="RFQs" fill="#3B82F6" radius={[4,4,0,0]} />
                  <Bar dataKey="Active" fill="#10B981" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Client drilldown table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between gap-4 px-6 py-4 border-b flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search clients…" className="pl-9 w-56" value={clientSearch} onChange={e => setClientSearch(e.target.value)} />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">Sort:</span>
                  {[['shipments','Shipments'],['rfqs','RFQs'],['active','Active']].map(([k, l]) => (
                    <button key={k} onClick={() => setClientSort(k)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${clientSort === k ? 'bg-[#D50000] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y">
                {filteredClients.length === 0 && (
                  <div className="py-16 text-center text-gray-400">No clients found</div>
                )}
                {filteredClients.map((client, idx) => (
                  <div key={client.id}>
                    <div
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setExpandedClient(expandedClient === client.id ? null : client.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                          style={{ background: COLORS[idx % COLORS.length] }}>
                          {client.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#1A1A1A] truncate">{client.name}</p>
                          <p className="text-xs text-gray-400">{client.primary_contact_email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center hidden md:block">
                          <p className="text-lg font-bold text-[#D50000]">{client.totalShipments}</p>
                          <p className="text-xs text-gray-400">Shipments</p>
                        </div>
                        <div className="text-center hidden md:block">
                          <p className="text-lg font-bold text-blue-600">{client.activeShipments}</p>
                          <p className="text-xs text-gray-400">Active</p>
                        </div>
                        <div className="text-center hidden md:block">
                          <p className="text-lg font-bold text-green-600">{client.deliveredShipments}</p>
                          <p className="text-xs text-gray-400">Delivered</p>
                        </div>
                        <div className="text-center hidden md:block">
                          <p className="text-lg font-bold text-gray-700">{client.totalRFQs}</p>
                          <p className="text-xs text-gray-400">RFQs</p>
                        </div>
                        <div className="hidden md:flex gap-1">
                          {Object.entries(client.byMode).map(([mode, count]) => {
                            const MIcon = modeIcons[mode] || Ship;
                            return (
                              <span key={mode} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                                <MIcon className="w-3 h-3" />{count}
                              </span>
                            );
                          })}
                        </div>
                        {expandedClient === client.id
                          ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                      </div>
                    </div>

                    {expandedClient === client.id && (
                      <div className="bg-gray-50 px-6 pb-4 pt-2 border-t">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                          Linked Shipments ({client.shipmentsList.length})
                        </p>
                        {client.shipmentsList.length === 0 ? (
                          <p className="text-sm text-gray-400 py-3">No shipments linked yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {client.shipmentsList.map(s => {
                              const MIcon = modeIcons[s.mode] || Ship;
                              return (
                                <div key={s.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow-sm text-sm">
                                  <div className="flex items-center gap-3">
                                    <MIcon className="w-4 h-4 text-gray-400" />
                                    <span className="font-mono font-semibold text-[#D50000]">{s.tracking_number}</span>
                                    <span className="text-gray-500">{s.origin} → {s.destination}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <StatusBadge status={s.status} />
                                    <span className="text-xs text-gray-400">{s.eta ? format(new Date(s.eta), 'MMM d, yyyy') : 'No ETA'}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {client.rfqsList.length > 0 && (
                          <>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-4 mb-3">
                              Linked RFQs ({client.rfqsList.length})
                            </p>
                            <div className="space-y-2">
                              {client.rfqsList.map(r => (
                                <div key={r.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow-sm text-sm">
                                  <div className="flex items-center gap-3">
                                    <span className="font-mono font-semibold text-blue-600">{r.reference_number}</span>
                                    <span className="text-gray-500">{r.origin} → {r.destination}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <StatusBadge status={r.status} />
                                    <span className="text-xs text-gray-400 capitalize">{r.mode}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}