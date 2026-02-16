import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Mail, Phone, Building2, Calendar, FileText, Ship, Activity, ChevronRight, User } from 'lucide-react';
import StatusBadge from '../components/shared/StatusBadge';
import { format } from 'date-fns';

export default function Clients() {
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
    enabled: user?.role === 'admin',
  });

  const { data: allRFQs = [] } = useQuery({
    queryKey: ['all-rfqs'],
    queryFn: () => base44.entities.RFQ.list('-created_date', 1000),
  });

  const { data: allShipments = [] } = useQuery({
    queryKey: ['all-shipments'],
    queryFn: () => base44.entities.Shipment.list('-created_date', 1000),
  });

  const { data: clientRFQs = [] } = useQuery({
    queryKey: ['client-rfqs', selectedClient?.email],
    queryFn: () => base44.entities.RFQ.filter({ client_email: selectedClient.email }, '-created_date', 100),
    enabled: !!selectedClient?.email,
  });

  const { data: clientShipments = [] } = useQuery({
    queryKey: ['client-shipments', selectedClient?.email],
    queryFn: () => base44.entities.Shipment.filter({ client_email: selectedClient.email }, '-created_date', 100),
    enabled: !!selectedClient?.email,
  });

  const { data: clientActivity = [] } = useQuery({
    queryKey: ['client-activity', selectedClient?.email],
    queryFn: () => base44.entities.ActivityLog.filter({ performed_by: selectedClient.email }, '-created_date', 50),
    enabled: !!selectedClient?.email,
  });

  const clients = allUsers.filter(u => u.role === 'user' || !u.role);
  
  const filteredClients = clients.filter(client => 
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getClientStats = (clientEmail) => {
    const rfqs = allRFQs.filter(r => r.client_email === clientEmail);
    const shipments = allShipments.filter(s => s.client_email === clientEmail);
    return {
      totalRFQs: rfqs.length,
      wonRFQs: rfqs.filter(r => r.final_status === 'won').length,
      activeShipments: shipments.filter(s => s.status !== 'delivered').length,
      totalShipments: shipments.length,
    };
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Access denied. Admin only.</p>
      </div>
    );
  }

  if (usersLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* Clients List */}
      <div className="w-96 bg-white rounded-2xl shadow-sm flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">Clients</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredClients.map(client => {
            const stats = getClientStats(client.email);
            return (
              <button
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`w-full text-left p-4 rounded-xl transition-all border ${
                  selectedClient?.id === client.id
                    ? 'bg-[#D50000]/5 border-[#D50000]'
                    : 'bg-gray-50 border-transparent hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-[#D50000] flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <p className="font-semibold text-sm text-[#1A1A1A] truncate">
                        {client.full_name || 'No Name'}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{client.email}</p>
                    <div className="flex gap-3 mt-2 text-xs text-gray-600">
                      <span>{stats.totalRFQs} RFQs</span>
                      <span>{stats.totalShipments} Shipments</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                </div>
              </button>
            );
          })}
          {filteredClients.length === 0 && (
            <p className="text-center text-gray-400 py-8 text-sm">No clients found</p>
          )}
        </div>
      </div>

      {/* Client Details */}
      <div className="flex-1 overflow-y-auto">
        {!selectedClient ? (
          <div className="bg-white rounded-2xl shadow-sm h-full flex items-center justify-center">
            <div className="text-center">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select a client to view details</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Client Header */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-full bg-[#D50000] flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[#1A1A1A]">{selectedClient.full_name || 'No Name'}</h2>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{selectedClient.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Joined {format(new Date(selectedClient.created_date), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-8 pt-8 border-t">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#D50000]">{clientRFQs.length}</p>
                  <p className="text-sm text-gray-500 mt-1">Total RFQs</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {clientRFQs.filter(r => r.final_status === 'won').length}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Won RFQs</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{clientShipments.length}</p>
                  <p className="text-sm text-gray-500 mt-1">Shipments</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">
                    {clientShipments.filter(s => s.status !== 'delivered').length}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Active</p>
                </div>
              </div>
            </div>

            {/* RFQs */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-[#D50000]" />
                <h3 className="font-bold text-[#1A1A1A]">Recent RFQs</h3>
              </div>
              <div className="space-y-3">
                {clientRFQs.slice(0, 5).map(rfq => (
                  <div key={rfq.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-sm text-[#1A1A1A]">{rfq.reference_number}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {rfq.origin} → {rfq.destination} ({rfq.mode})
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={rfq.status} type="rfq" />
                      {rfq.final_status !== 'pending' && (
                        <StatusBadge status={rfq.final_status} type="outcome" />
                      )}
                    </div>
                  </div>
                ))}
                {clientRFQs.length === 0 && (
                  <p className="text-center text-gray-400 py-8 text-sm">No RFQs</p>
                )}
              </div>
            </div>

            {/* Shipments */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Ship className="w-5 h-5 text-[#D50000]" />
                <h3 className="font-bold text-[#1A1A1A]">Recent Shipments</h3>
              </div>
              <div className="space-y-3">
                {clientShipments.slice(0, 5).map(shipment => (
                  <div key={shipment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-sm text-[#1A1A1A]">{shipment.tracking_number}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {shipment.origin} → {shipment.destination}
                      </p>
                    </div>
                    <StatusBadge status={shipment.status} type="shipment" />
                  </div>
                ))}
                {clientShipments.length === 0 && (
                  <p className="text-center text-gray-400 py-8 text-sm">No shipments</p>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-5 h-5 text-[#D50000]" />
                <h3 className="font-bold text-[#1A1A1A]">Recent Activity</h3>
              </div>
              <div className="space-y-3">
                {clientActivity.slice(0, 10).map(activity => (
                  <div key={activity.id} className="flex gap-3 p-3 border-l-2 border-gray-200">
                    <div className="flex-1">
                      <p className="text-sm text-[#1A1A1A]">{activity.action}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(activity.created_date), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
                {clientActivity.length === 0 && (
                  <p className="text-center text-gray-400 py-8 text-sm">No activity</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}