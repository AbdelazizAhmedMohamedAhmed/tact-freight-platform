import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import StatusBadge from '../components/shared/StatusBadge';
import {
  Download, TrendingUp, Users, Package, FileText, DollarSign,
  Ship, Plane, Truck, CheckCircle, Clock, XCircle, Search,
  ChevronDown, ChevronUp, BarChart3
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, isWithinInterval, parseISO } from 'date-fns';

const COLORS = ['#D50000', '#1A1A1A', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];
const modeIcons = { sea: Ship, air: Plane, inland: Truck };

function KPICard({ title, value, sub, icon: Icon, color = 'red' }) {
  const colorMap = {
    red: 'border-red-500 bg-red-50 text-red-600',
    blue: 'border-blue-500 bg-blue-50 text-blue-600',
    green: 'border-green-500 bg-green-50 text-green-600',
    purple: 'border-purple-500 bg-purple-50 text-purple-600',
    orange: 'border-orange-500 bg-orange-50 text-orange-600',
    gray: 'border-gray-500 bg-gray-50 text-gray-600',
  };
  const [borderCls, bgCls, textCls] = colorMap[color].split(' ');
  return (
    <div className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${borderCls}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-2xl font-bold text-[#1A1A1A]">{value}</p>
          <p className="text-sm font-medium text-gray-700 mt-0.5">{title}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl ${bgCls} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${textCls}`} />
        </div>
      </div>
    </div>
  );
}

// ─── Business Analytics Tab ─────────────────────────────────────────────────
function BusinessAnalytics({ rfqs, shipments, activities }) {
  const [dateRange, setDateRange] = useState('30');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { filteredRFQs, filteredShipments, filteredActivities, dateFilter } = useMemo(() => {
    let start, end;
    if (dateRange === 'custom' && startDate && endDate) {
      start = startOfDay(parseISO(startDate));
      end = endOfDay(parseISO(endDate));
    } else {
      const days = parseInt(dateRange);
      end = endOfDay(new Date());
      start = startOfDay(subDays(end, days));
    }
    const f = item => item.created_date && isWithinInterval(parseISO(item.created_date), { start, end });
    return { filteredRFQs: rfqs.filter(f), filteredShipments: shipments.filter(f), filteredActivities: activities.filter(f), dateFilter: { start, end } };
  }, [rfqs, shipments, activities, dateRange, startDate, endDate]);

  const metrics = useMemo(() => {
    const totalRFQs = filteredRFQs.length;
    const pendingRFQs = filteredRFQs.filter(r => ['submitted', 'sales_review', 'pricing_in_progress'].includes(r.status)).length;
    const confirmedRFQs = filteredRFQs.filter(r => r.status === 'client_confirmed').length;
    const rejectedRFQs = filteredRFQs.filter(r => r.status === 'rejected').length;
    const conversionRate = totalRFQs > 0 ? ((confirmedRFQs / totalRFQs) * 100).toFixed(1) : '0.0';
    const totalQuotedValue = filteredRFQs.reduce((s, r) => s + (r.quotation_amount || 0), 0);
    const totalShipments = filteredShipments.length;
    const deliveredShipments = filteredShipments.filter(s => s.status === 'delivered').length;
    const activeShipments = filteredShipments.filter(s => s.status !== 'delivered').length;
    const successRate = totalShipments > 0 ? ((deliveredShipments / totalShipments) * 100).toFixed(1) : '0.0';
    const activeUsers = new Set(filteredActivities.map(a => a.performed_by)).size;
    return { totalRFQs, pendingRFQs, confirmedRFQs, rejectedRFQs, conversionRate, totalQuotedValue, totalShipments, deliveredShipments, activeShipments, successRate, activeUsers };
  }, [filteredRFQs, filteredShipments, filteredActivities]);

  // Chart data
  const rfqByMode = useMemo(() => {
    const m = {};
    filteredRFQs.forEach(r => { m[r.mode] = (m[r.mode] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name: name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Unknown', value }));
  }, [filteredRFQs]);

  const rfqByStatus = useMemo(() => {
    const m = {};
    filteredRFQs.forEach(r => { m[r.status] = (m[r.status] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));
  }, [filteredRFQs]);

  const topRoutes = useMemo(() => {
    const m = {};
    filteredRFQs.forEach(r => { const k = `${r.origin} → ${r.destination}`; m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));
  }, [filteredRFQs]);

  const timeSeries = useMemo(() => {
    const days = Math.min(Math.ceil((dateFilter.end - dateFilter.start) / 86400000), 90);
    return Array.from({ length: days }, (_, i) => {
      const date = startOfDay(subDays(dateFilter.end, days - i - 1));
      const dateStr = format(date, 'MMM dd');
      const dayRFQs = filteredRFQs.filter(r => startOfDay(parseISO(r.created_date)).getTime() === date.getTime()).length;
      const dayShipments = filteredShipments.filter(s => startOfDay(parseISO(s.created_date)).getTime() === date.getTime()).length;
      return { date: dateStr, RFQs: dayRFQs, Shipments: dayShipments };
    });
  }, [filteredRFQs, filteredShipments, dateFilter]);

  const handleExport = () => {
    const data = JSON.stringify({ generated_at: new Date().toISOString(), metrics, rfqByMode, rfqByStatus, topRoutes, timeSeries }, null, 2);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    a.download = `report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Date Filter */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Period</p>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
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
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">From</p>
                  <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-40" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">To</p>
                  <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-40" />
                </div>
              </>
            )}
            <p className="text-sm text-gray-500 pb-0.5">
              {format(dateFilter.start, 'MMM d, yyyy')} — {format(dateFilter.end, 'MMM d, yyyy')}
            </p>
            <Button variant="outline" size="sm" onClick={handleExport} className="ml-auto">
              <Download className="w-4 h-4 mr-2" /> Export JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total RFQs" value={metrics.totalRFQs} sub={`${metrics.pendingRFQs} pending`} icon={FileText} color="blue" />
        <KPICard title="Confirmed RFQs" value={metrics.confirmedRFQs} sub={`${metrics.conversionRate}% conversion`} icon={CheckCircle} color="green" />
        <KPICard title="Total Shipments" value={metrics.totalShipments} sub={`${metrics.activeShipments} active`} icon={Package} color="purple" />
        <KPICard title="Quoted Value" value={`$${metrics.totalQuotedValue.toLocaleString()}`} sub="sum of all quotes" icon={DollarSign} color="orange" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Delivered" value={metrics.deliveredShipments} sub={`${metrics.successRate}% success rate`} icon={CheckCircle} color="green" />
        <KPICard title="Rejected RFQs" value={metrics.rejectedRFQs} icon={XCircle} color="red" />
        <KPICard title="Active Users" value={metrics.activeUsers} sub="unique in period" icon={Users} color="gray" />
        <KPICard title="Pending RFQs" value={metrics.pendingRFQs} sub="awaiting action" icon={Clock} color="orange" />
      </div>

      {/* Trend */}
      <Card>
        <CardHeader><CardTitle className="text-base">Activity Trends</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={timeSeries}>
              <defs>
                <linearGradient id="gRFQ" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D50000" stopOpacity={0.3} /><stop offset="95%" stopColor="#D50000" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gShip" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="RFQs" stroke="#D50000" fill="url(#gRFQ)" />
              <Area type="monotone" dataKey="Shipments" stroke="#3B82F6" fill="url(#gShip)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Mode + Status */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">RFQs by Mode</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={rfqByMode} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {rfqByMode.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">RFQ Status Breakdown</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={rfqByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" height={70} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#D50000" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance + Top Routes */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Performance Metrics</CardTitle></CardHeader>
          <CardContent className="space-y-6 pt-2">
            {[
              { label: 'RFQ Conversion Rate', value: metrics.conversionRate, color: 'bg-[#D50000]', sub: `${metrics.confirmedRFQs} confirmed / ${metrics.totalRFQs} total` },
              { label: 'Shipment Success Rate', value: metrics.successRate, color: 'bg-green-500', sub: `${metrics.deliveredShipments} delivered / ${metrics.totalShipments} total` },
            ].map(({ label, value, color, sub }) => (
              <div key={label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-sm font-bold">{value}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className={`${color} h-2.5 rounded-full transition-all`} style={{ width: `${Math.min(value, 100)}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{sub}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Top Trade Routes</CardTitle></CardHeader>
          <CardContent>
            {topRoutes.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">No route data in this period</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topRoutes} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={180} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1A1A1A" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Client Intelligence Tab ─────────────────────────────────────────────────
function ClientIntelligence({ clients, shipments, rfqs }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('shipments');
  const [expanded, setExpanded] = useState(null);

  const clientStats = useMemo(() => clients.map(client => {
    const emails = client.member_emails || [];
    const cs = shipments.filter(s => s.company_id === client.id || s.company_name?.toLowerCase() === client.name?.toLowerCase() || emails.includes(s.client_email));
    const cr = rfqs.filter(r => r.company_id === client.id || r.company_name?.toLowerCase() === client.name?.toLowerCase() || emails.includes(r.client_email || r.email));
    const byMode = cs.reduce((acc, s) => { acc[s.mode] = (acc[s.mode] || 0) + 1; return acc; }, {});
    return { ...client, totalShipments: cs.length, activeShipments: cs.filter(s => s.status !== 'delivered').length, deliveredShipments: cs.filter(s => s.status === 'delivered').length, totalRFQs: cr.length, confirmedRFQs: cr.filter(r => r.status === 'client_confirmed').length, byMode, shipmentsList: cs, rfqsList: cr };
  }), [clients, shipments, rfqs]);

  const filtered = useMemo(() => {
    let list = clientStats.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.primary_contact_email?.toLowerCase().includes(search.toLowerCase()));
    if (sortBy === 'shipments') list = [...list].sort((a, b) => b.totalShipments - a.totalShipments);
    else if (sortBy === 'rfqs') list = [...list].sort((a, b) => b.totalRFQs - a.totalRFQs);
    else if (sortBy === 'active') list = [...list].sort((a, b) => b.activeShipments - a.activeShipments);
    return list;
  }, [clientStats, search, sortBy]);

  const chartData = filtered.slice(0, 10).map(c => ({
    name: c.name?.length > 14 ? c.name.slice(0, 12) + '…' : c.name,
    Shipments: c.totalShipments,
    RFQs: c.totalRFQs,
    Active: c.activeShipments,
  }));

  const modeData = useMemo(() => {
    const m = {};
    shipments.forEach(s => { if (s.mode) m[s.mode] = (m[s.mode] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [shipments]);

  const totalLinked = shipments.filter(s => s.company_id || s.company_name || s.client_email).length;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Clients" value={clients.length} icon={Users} color="blue" />
        <KPICard title="Total Shipments" value={shipments.length} sub={`${totalLinked} linked to clients`} icon={Ship} color="green" />
        <KPICard title="Total RFQs" value={rfqs.length} icon={FileText} color="red" />
        <KPICard title="Active Shipments" value={shipments.filter(s => s.status !== 'delivered').length} icon={Package} color="orange" />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-[#1A1A1A] mb-4">Top 10 Clients — Shipments vs RFQs</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ right: 10, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Shipments" fill="#D50000" radius={[4, 4, 0, 0]} />
              <Bar dataKey="RFQs" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Active" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-[#1A1A1A] mb-4">Shipment Mode Mix</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={modeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {modeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Client Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-4 p-4 border-b flex-wrap">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search clients…" className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Sort:</span>
            {[['shipments', 'Shipments'], ['rfqs', 'RFQs'], ['active', 'Active']].map(([key, label]) => (
              <button key={key} onClick={() => setSortBy(key)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${sortBy === key ? 'bg-[#D50000] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y">
          {filtered.length === 0 && <div className="py-16 text-center text-gray-400">No clients found</div>}
          {filtered.map((client, idx) => (
            <div key={client.id}>
              <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setExpanded(expanded === client.id ? null : client.id)}>
                <div className="flex items-center gap-4 min-w-0">
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
                  {[
                    { val: client.totalShipments, lbl: 'Shipments', cls: 'text-[#D50000]' },
                    { val: client.activeShipments, lbl: 'Active', cls: 'text-blue-600' },
                    { val: client.deliveredShipments, lbl: 'Delivered', cls: 'text-green-600' },
                    { val: client.totalRFQs, lbl: 'RFQs', cls: 'text-gray-700' },
                  ].map(({ val, lbl, cls }) => (
                    <div key={lbl} className="text-center hidden md:block">
                      <p className={`text-xl font-bold ${cls}`}>{val}</p>
                      <p className="text-xs text-gray-400">{lbl}</p>
                    </div>
                  ))}
                  <div className="hidden md:flex gap-1 flex-wrap">
                    {Object.entries(client.byMode).map(([mode, count]) => {
                      const MIcon = modeIcons[mode] || Ship;
                      return (
                        <span key={mode} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                          <MIcon className="w-3 h-3" /> {count}
                        </span>
                      );
                    })}
                  </div>
                  {expanded === client.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>

              {expanded === client.id && (
                <div className="bg-gray-50 px-6 pb-4 pt-2 border-t">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Shipments ({client.shipmentsList.length})</p>
                  {client.shipmentsList.length === 0 ? (
                    <p className="text-sm text-gray-400 py-4">No shipments linked yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {client.shipmentsList.map(s => {
                        const MIcon = modeIcons[s.mode] || Ship;
                        return (
                          <div key={s.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow-sm text-sm">
                            <div className="flex items-center gap-3 min-w-0">
                              <MIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="font-mono font-semibold text-[#D50000]">{s.tracking_number}</span>
                              <span className="text-gray-500 truncate">{s.origin} → {s.destination}</span>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
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
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-4 mb-3">RFQs ({client.rfqsList.length})</p>
                      <div className="space-y-2">
                        {client.rfqsList.map(r => (
                          <div key={r.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow-sm text-sm">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="font-mono font-semibold text-blue-600">{r.reference_number}</span>
                              <span className="text-gray-500 truncate">{r.origin} → {r.destination}</span>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
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
    </div>
  );
}

// ─── Operations Overview Tab ─────────────────────────────────────────────────
function OperationsOverview({ shipments }) {
  const byStatus = useMemo(() => {
    const m = {};
    shipments.forEach(s => { m[s.status] = (m[s.status] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value, key: name }));
  }, [shipments]);

  const byMode = useMemo(() => {
    const m = {};
    shipments.forEach(s => { if (s.mode) m[s.mode] = (m[s.mode] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [shipments]);

  const overdueShipments = shipments.filter(s => {
    if (!s.eta || s.status === 'delivered') return false;
    return new Date(s.eta) < new Date();
  });

  const recentlyDelivered = shipments.filter(s => s.status === 'delivered').slice(0, 5);

  const inTransit = shipments.filter(s => ['departed_origin', 'in_transit', 'arrived_destination'].includes(s.status));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Shipments" value={shipments.length} icon={Package} color="blue" />
        <KPICard title="In Transit" value={inTransit.length} icon={Ship} color="purple" />
        <KPICard title="Overdue" value={overdueShipments.length} sub="past ETA" icon={Clock} color="red" />
        <KPICard title="Delivered" value={shipments.filter(s => s.status === 'delivered').length} icon={CheckCircle} color="green" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Shipments by Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" height={70} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#D50000" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Mode Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={byMode} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {byMode.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Overdue */}
      {overdueShipments.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader><CardTitle className="text-base text-red-700 flex items-center gap-2"><Clock className="w-4 h-4" /> Overdue Shipments ({overdueShipments.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueShipments.map(s => {
                const MIcon = modeIcons[s.mode] || Ship;
                const daysOverdue = Math.ceil((new Date() - new Date(s.eta)) / 86400000);
                return (
                  <div key={s.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-3 text-sm shadow-sm">
                    <div className="flex items-center gap-3">
                      <MIcon className="w-4 h-4 text-gray-400" />
                      <span className="font-mono font-semibold text-[#D50000]">{s.tracking_number}</span>
                      <span className="text-gray-500">{s.company_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={s.status} />
                      <Badge className="bg-red-100 text-red-700">{daysOverdue}d overdue</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* In Transit */}
      <Card>
        <CardHeader><CardTitle className="text-base">Shipments In Transit ({inTransit.length})</CardTitle></CardHeader>
        <CardContent>
          {inTransit.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No shipments currently in transit</p>
          ) : (
            <div className="space-y-2">
              {inTransit.map(s => {
                const MIcon = modeIcons[s.mode] || Ship;
                return (
                  <div key={s.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 text-sm">
                    <div className="flex items-center gap-3">
                      <MIcon className="w-4 h-4 text-gray-400" />
                      <span className="font-mono font-semibold text-[#D50000]">{s.tracking_number}</span>
                      <span className="text-gray-500">{s.origin} → {s.destination}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={s.status} />
                      <span className="text-xs text-gray-400">ETA: {s.eta ? format(new Date(s.eta), 'MMM d') : 'N/A'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Reporting() {
  const { data: rfqs = [], isLoading: rfqL } = useQuery({
    queryKey: ['reporting-rfqs'],
    queryFn: () => base44.entities.RFQ.list('-created_date', 1000),
  });
  const { data: shipments = [], isLoading: shipL } = useQuery({
    queryKey: ['reporting-shipments'],
    queryFn: () => base44.entities.Shipment.list('-created_date', 1000),
  });
  const { data: clients = [], isLoading: clientL } = useQuery({
    queryKey: ['reporting-clients'],
    queryFn: () => base44.entities.ClientCompany.list('-created_date', 500),
  });
  const { data: activities = [], isLoading: actL } = useQuery({
    queryKey: ['reporting-activities'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 500),
  });

  const isLoading = rfqL || shipL || clientL || actL;

  if (isLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#D50000]" /> Reporting & Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-1">Business intelligence, client insights, and operations overview</p>
        </div>
      </div>

      <Tabs defaultValue="business">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="business">Business Analytics</TabsTrigger>
          <TabsTrigger value="clients">Client Intelligence</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="mt-6">
          <BusinessAnalytics rfqs={rfqs} shipments={shipments} activities={activities} />
        </TabsContent>

        <TabsContent value="clients" className="mt-6">
          <ClientIntelligence clients={clients} shipments={shipments} rfqs={rfqs} />
        </TabsContent>

        <TabsContent value="operations" className="mt-6">
          <OperationsOverview shipments={shipments} />
        </TabsContent>
      </Tabs>
    </div>
  );
}