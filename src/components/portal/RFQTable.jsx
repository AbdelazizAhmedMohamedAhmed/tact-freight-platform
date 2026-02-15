import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from '../shared/StatusBadge';
import { format } from 'date-fns';
import { Ship, Plane, Truck, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";

const modeIcons = { sea: Ship, air: Plane, inland: Truck };

export default function RFQTable({ rfqs, onView, showActions = true }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Reference</TableHead>
              <TableHead className="font-semibold">Company</TableHead>
              <TableHead className="font-semibold">Mode</TableHead>
              <TableHead className="font-semibold">Route</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              {showActions && <TableHead className="font-semibold">Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rfqs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-12">No RFQs found</TableCell>
              </TableRow>
            )}
            {rfqs.map(rfq => {
              const MIcon = modeIcons[rfq.mode] || Ship;
              return (
                <TableRow key={rfq.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onView?.(rfq)}>
                  <TableCell className="font-mono font-semibold text-[#D50000] text-sm">{rfq.reference_number}</TableCell>
                  <TableCell className="font-medium">{rfq.company_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 capitalize">
                      <MIcon className="w-4 h-4 text-gray-400" />{rfq.mode}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{rfq.origin} → {rfq.destination}</TableCell>
                  <TableCell><StatusBadge status={rfq.status} /></TableCell>
                  <TableCell className="text-sm text-gray-500">{rfq.created_date ? format(new Date(rfq.created_date), 'MMM d, yyyy') : '-'}</TableCell>
                  {showActions && (
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onView?.(rfq); }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}