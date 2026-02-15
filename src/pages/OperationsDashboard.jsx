import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import StatsCard from '../components/portal/StatsCard';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from '../components/shared/StatusBadge';
import { Ship, Plane, Truck, Plus, Package, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";

const modeIcons = { sea: Ship, air: Plane, inland: Truck };

export default function OperationsDashboard() {
  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ['ops-shipments'],
    queryFn: () => base44.entities.Shipment.list('-created_date', 100),
  });

  const { data: acceptedRFQs = [] } = useQuery({
    queryKey: ['ops-accepted-rfqs'],
    queryFn: () => base44.entities.RFQ.filter({ status: 'accepted' }, '-created_date', 50),
  });

  const active = shipments.filter(s => s.status !== 'delivered');
  const delivered = shipments.filter(s => s.status === 'delivered');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Operations Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage shipments and track deliveries</p>
        </div>
        <Link to={createPageUrl('CreateShipment')}>
          <Button className="bg-[#D50000] hover:bg-[#B00000]"><Plus className="w-4 h-4 mr-2" /> New Shipment</Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Active Shipments" value={active.length} icon={Truck} />
        <StatsCard title="Delivered" value={delivered.length} icon={CheckCircle2} />
        <StatsCard title="Pending Jobs" value={acceptedRFQs.length} icon={Clock} />
        <StatsCard title="Total Shipments" value={shipments.length} icon={Package} />
      </div>

      {/* Pending accepted RFQs */}
      {acceptedRFQs.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Accepted RFQs — Pending Shipment Creation</h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-yellow-50">
                  <TableHead>Reference</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {acceptedRFQs.map(rfq => (
                  <TableRow key={rfq.id}>
                    <TableCell className="font-mono text-[#D50000] font-semibold">{rfq.reference_number}</TableCell>
                    <TableCell>{rfq.company_name}</TableCell>
                    <TableCell className="text-sm">{rfq.origin} → {rfq.destination}</TableCell>
                    <TableCell className="capitalize">{rfq.mode}</TableCell>
                    <TableCell>
                      <Link to={createPageUrl(`CreateShipment?rfq_id=${rfq.id}`)}>
                        <Button size="sm" className="bg-[#D50000] hover:bg-[#B00000]">Create Shipment</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Active Shipments */}
      <div>
        <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Active Shipments</h2>
        {isLoading ? <Skeleton className="h-48 rounded-2xl" /> : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Tracking #</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>ETA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {active.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center py-12 text-gray-400">No active shipments</TableCell></TableRow>
                )}
                {active.map(s => {
                  const MIcon = modeIcons[s.mode] || Ship;
                  return (
                    <TableRow key={s.id} className="hover:bg-gray-50 cursor-pointer">
                      <TableCell className="font-mono font-semibold text-[#D50000]">{s.tracking_number}</TableCell>
                      <TableCell>{s.company_name}</TableCell>
                      <TableCell className="text-sm">{s.origin} → {s.destination}</TableCell>
                      <TableCell><div className="flex items-center gap-2 capitalize"><MIcon className="w-4 h-4 text-gray-400" />{s.mode}</div></TableCell>
                      <TableCell><StatusBadge status={s.status} /></TableCell>
                      <TableCell className="text-sm text-gray-500">{s.eta ? format(new Date(s.eta), 'MMM d') : '-'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}