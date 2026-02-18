import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Ship, Plane, Truck, Package, TrendingUp, Users, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import StatusBadge from '../components/shared/StatusBadge';
import { format } from 'date-fns';

const modeIcons = { sea: Ship, air: Plane, inland: Truck };
const COLORS = ['#D50000','#1A1A1A','#3B82F6','#10B981','#F59E0B','#8B5CF6','#EC4899','#14B8A6'];

export default function ClientReporting() {
  const [search, setSearch] = useState('');
  const [expandedClient, setExpandedClient] = useState(null);
  const [sortBy, setSortBy] = useState('shipments'); // shipments | rfqs | active

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['all-clients-report'],
    queryFn: () => base44.entities.ClientCompany.list('-created_date', 500),
  });

  const { data: shipments = [], isLoading: shipmentsLoading } = useQuery({
    queryKey: ['all-shipments-report'],
    queryFn: () => base44.entities.Shipment.list('-created_date', 1000),
  });

  const { data: rfqs = [], isLoading: rfqsLoading } = useQuery({
    queryKey: ['all-rfqs-report'],
    queryFn: () => base44.entities.RFQ.list('-created_date', 1000),
  });

  const isLoading = clientsLoading || shipmentsLoading || rfqsLoading;

  // Build per-client stats
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
      const active = clientShipments.filter(s => s.status !== 'delivered').length;
      const delivered = clientShipments.filter(s => s.status === 'delivered').length;
      const byMode = clientShipments.reduce((acc, s) => {
        acc[s.mode] = (acc[s.mode] || 0) + 1;
        return acc;
      }, {});
      const wonRFQs = clientRFQs.filter(r => r.status === 'client_confirmed').length;

      return {
        ...client,
        totalShipments: clientShipments.length,
        activeShipments: active,
        deliveredShipments: delivered,
        totalRFQs: clientRFQs.length,
        wonRFQs,
        byMode,
        shipmentsList: clientShipments,
        rfqsList: clientRFQs,
      };
    });
  }, [clients, shipments, rfqs]);

  const filtered = useMemo(() => {
    let list = clientStats.filter(c =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.primary_contact_email?.toLowerCase().includes(search.toLowerCase())
    );
    if (sortBy === 'shipments') list = [...list].sort((a, b) => b.totalShipments - a.totalShipments);
    if (sortBy === 'rfqs') list = [...list].sort((a, b) => b.totalRFQs - a.totalRFQs);
    if (sortBy === 'active') list = [...list].sort((a, b) => b.activeShipments - a.activeShipments);
    return list;
  }, [clientStats, search, sortBy]);

  // Top-N chart data
  const chartData = filtered.slice(0, 10).map(c => ({
    name: c.name?.length > 16 ? c.name.slice(0, 14) + '…' : c.name,
    Shipments: c.totalShipments,
    RFQs: c.totalRFQs,
    Active: c.activeShipments,
  }));

  // Mode distribution across all shipments
  const modeData = shipments.reduce((acc, s) => {
    if (s.mode) {
      const found = acc.find(x => x.name === s.mode);
      if (found) found.value++;
      else acc.push({ name: s.mode, value: 1 });
    }
    return acc;
  }, []);

  const totalLinked = shipments.filter(s => s.company_id || s.company_name || s.client_email).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#D50000]" /> Client Intelligence Report
          </h1>
          <p className="text-gray-500 text-sm mt-1">Understand your top clients — shipments, RFQs, and activity</p>
        </div>
      </div>

      {/* Summary KPIs */}
      {isLoading ? <Skeleton className="h-24 rounded-xl" /> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Clients', value: clients.length, cls: 'border-blue-500 bg-blue-100 text-blue-600', Icon: Users },
            { label: 'Total Shipments', value: shipments.length, cls: 'border-green-500 bg-green-100 text-green-600', Icon: Ship },
            { label: 'Linked Shipments', value: totalLinked, cls: 'border-orange-500 bg-orange-100 text-orange-600', Icon: Package },
            { label: 'Total RFQs', value: rfqs.length, cls: 'border-red-500 bg-red-100 text-red-600', Icon: TrendingUp },
          ].map(({ label, value, cls, Icon }) => {
            const [borderCls, bgCls, textCls] = cls.split(' ');
            return (
              <div key={label} className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${borderCls}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${bgCls} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${textCls}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1A1A1A]">{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Charts row */}
      {!isLoading && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-[#1A1A1A] mb-4">Top 10 Clients — Shipments vs RFQs</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
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
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-[#1A1A1A] mb-4">Shipment Mode Mix</h2>
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
      )}

      {/* Client Table with drill-down */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-4 p-4 border-b">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search clients…" className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Sort by:</span>
            {[['shipments', 'Shipments'], ['rfqs', 'RFQs'], ['active', 'Active']].map(([key, label]) => (
              <button key={key}
                onClick={() => setSortBy(key)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${sortBy === key ? 'bg-[#D50000] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? <Skeleton className="h-64 m-4 rounded-xl" /> : (
          <div className="divide-y">
            {filtered.length === 0 && (
              <div className="py-16 text-center text-gray-400">No clients found</div>
            )}
            {filtered.map((client, idx) => (
              <div key={client.id}>
                {/* Client row */}
                <div
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setExpandedClient(expandedClient === client.id ? null : client.id)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
                      style={{ background: COLORS[idx % COLORS.length] }}>
                      {client.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#1A1A1A] truncate">{client.name}</p>
                      <p className="text-xs text-gray-400">{client.primary_contact_email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-center hidden md:block">
                      <p className="text-xl font-bold text-[#D50000]">{client.totalShipments}</p>
                      <p className="text-xs text-gray-400">Shipments</p>
                    </div>
                    <div className="text-center hidden md:block">
                      <p className="text-xl font-bold text-blue-600">{client.activeShipments}</p>
                      <p className="text-xs text-gray-400">Active</p>
                    </div>
                    <div className="text-center hidden md:block">
                      <p className="text-xl font-bold text-green-600">{client.deliveredShipments}</p>
                      <p className="text-xs text-gray-400">Delivered</p>
                    </div>
                    <div className="text-center hidden md:block">
                      <p className="text-xl font-bold text-gray-700">{client.totalRFQs}</p>
                      <p className="text-xs text-gray-400">RFQs</p>
                    </div>
                    <div className="flex gap-1 hidden md:flex">
                      {Object.entries(client.byMode).map(([mode, count]) => {
                        const MIcon = modeIcons[mode] || Ship;
                        return (
                          <span key={mode} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                            <MIcon className="w-3 h-3" /> {count}
                          </span>
                        );
                      })}
                    </div>
                    {expandedClient === client.id ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                  </div>
                </div>

                {/* Expanded shipments list */}
                {expandedClient === client.id && (
                  <div className="bg-gray-50 px-6 pb-4 pt-2 border-t">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Linked Shipments ({client.shipmentsList.length})</p>
                    {client.shipmentsList.length === 0 ? (
                      <p className="text-sm text-gray-400 py-4">No shipments linked to this client yet.</p>
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
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-4 mb-3">Linked RFQs ({client.rfqsList.length})</p>
                        <div className="space-y-2">
                          {client.rfqsList.map(r => (
                            <div key={r.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow-sm text-sm">
                              <div className="flex items-center gap-3">
                                <span className="font-mono font-semibold text-blue-600">{r.reference_number}</span>
                                <span className="text-gray-500">{r.origin} → {r.destination}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <StatusBadge status={r.status} />
                                <span className="text-xs text-gray-400">{r.mode}</span>
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
        )}
      </div>
    </div>
  );
}