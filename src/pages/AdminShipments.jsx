import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from '../components/shared/StatusBadge';
import { Input } from "@/components/ui/input";
import { Search, Ship, Plane, Truck } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

const modeIcons = { sea: Ship, air: Plane, inland: Truck };

export default function AdminShipments() {
  const [search, setSearch] = useState('');

  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ['admin-all-shipments'],
    queryFn: () => base44.entities.Shipment.list('-created_date', 500),
  });

  const filtered = shipments.filter(s =>
    s.tracking_number?.toLowerCase().includes(search.toLowerCase()) ||
    s.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">All Shipments</h1>
          <p className="text-gray-500 text-sm mt-1">View all shipment records</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

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
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-gray-400">No shipments found</TableCell></TableRow>
              )}
              {filtered.map(s => {
                const MIcon = modeIcons[s.mode] || Ship;
                return (
                  <TableRow key={s.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Link to={createPageUrl(`TrackShipment?tn=${s.tracking_number}`)} className="font-mono font-semibold text-[#D50000] hover:underline">
                        {s.tracking_number}
                      </Link>
                    </TableCell>
                    <TableCell>{s.company_name}</TableCell>
                    <TableCell className="text-sm">{s.origin} → {s.destination}</TableCell>
                    <TableCell><div className="flex items-center gap-2 capitalize"><MIcon className="w-4 h-4 text-gray-400" />{s.mode}</div></TableCell>
                    <TableCell><StatusBadge status={s.status} /></TableCell>
                    <TableCell className="text-sm text-gray-500">{s.eta ? format(new Date(s.eta), 'MMM d, yyyy') : '-'}</TableCell>
                    <TableCell className="text-sm text-gray-500">{s.created_date ? format(new Date(s.created_date), 'MMM d') : '-'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}