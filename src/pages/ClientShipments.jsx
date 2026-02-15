import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from '../components/shared/StatusBadge';
import { Skeleton } from "@/components/ui/skeleton";
import { Ship, Plane, Truck, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

const modeIcons = { sea: Ship, air: Plane, inland: Truck };

export default function ClientShipments() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ['client-shipments-all', user?.email],
    queryFn: () => base44.entities.Shipment.filter({ client_email: user.email }, '-created_date', 100),
    enabled: !!user?.email,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">My Shipments</h1>
        <p className="text-gray-500 text-sm mt-1">Track and monitor your shipments</p>
      </div>

      {isLoading ? <Skeleton className="h-48 rounded-2xl" /> : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Tracking #</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead>Track</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-gray-400">No shipments found</TableCell></TableRow>
              )}
              {shipments.map(s => {
                const MIcon = modeIcons[s.mode] || Ship;
                return (
                  <TableRow key={s.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono font-semibold text-[#D50000]">{s.tracking_number}</TableCell>
                    <TableCell><div className="flex items-center gap-2 capitalize"><MIcon className="w-4 h-4 text-gray-400" />{s.mode}</div></TableCell>
                    <TableCell className="text-sm">{s.origin} → {s.destination}</TableCell>
                    <TableCell><StatusBadge status={s.status} /></TableCell>
                    <TableCell className="text-sm text-gray-500">{s.eta ? format(new Date(s.eta), 'MMM d, yyyy') : '-'}</TableCell>
                    <TableCell>
                      <Link to={createPageUrl(`TrackShipment?tn=${s.tracking_number}`)} className="text-[#D50000] hover:underline flex items-center gap-1 text-sm">
                        <ExternalLink className="w-4 h-4" /> Track
                      </Link>
                    </TableCell>
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