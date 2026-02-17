import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from '../components/shared/StatusBadge';
import { Search, Ship, Plane, Truck } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { sendStatusNotification } from '../components/utils/notificationService';
import { logShipmentAction, logFileAction } from '../components/utils/activityLogger';

const modeIcons = { sea: Ship, air: Plane, inland: Truck };
const statusOrder = [
  'booking_confirmed', 'cargo_received', 'export_clearance', 'departed_origin',
  'in_transit', 'arrived_destination', 'customs_clearance', 'out_for_delivery', 'delivered'
];
const statusLabels = {
  booking_confirmed: 'Booking Confirmed', cargo_received: 'Cargo Received',
  export_clearance: 'Export Clearance', departed_origin: 'Departed Origin',
  in_transit: 'In Transit', arrived_destination: 'Arrived Destination',
  customs_clearance: 'Customs Clearance', out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
};

export default function AdminShipments() {
  const [search, setSearch] = useState('');
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const { data: shipments = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-all-shipments'],
    queryFn: () => base44.entities.Shipment.list('-created_date', 500),
  });

  const filtered = shipments.filter(s =>
    s.tracking_number?.toLowerCase().includes(search.toLowerCase()) ||
    s.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusUpdate = async () => {
    if (!newStatus || !selectedShipment) return;
    setUpdating(true);
    const now = new Date().toISOString();
    const history = [...(selectedShipment.status_history || []), { status: newStatus, timestamp: now, note }];
    const updatedShipment = await base44.entities.Shipment.update(selectedShipment.id, {
      status: newStatus,
      status_history: history,
      shipper_name: selectedShipment.shipper_name,
      shipper_address: selectedShipment.shipper_address,
      shipper_contact: selectedShipment.shipper_contact,
      shipper_phone: selectedShipment.shipper_phone,
      shipper_email: selectedShipment.shipper_email,
      consignee_name: selectedShipment.consignee_name,
      consignee_address: selectedShipment.consignee_address,
      consignee_contact: selectedShipment.consignee_contact,
      consignee_phone: selectedShipment.consignee_phone,
      consignee_email: selectedShipment.consignee_email,
      lead_time_days: selectedShipment.lead_time_days,
      first_available_vessel: selectedShipment.first_available_vessel,
    });
    await logShipmentAction(updatedShipment, 'shipment_status_changed',
      `Shipment ${selectedShipment.tracking_number} status changed to ${newStatus}`,
      { old_value: selectedShipment.status, new_value: newStatus }
    );
    await sendStatusNotification('shipment', updatedShipment, selectedShipment.status, newStatus);
    setUpdating(false);
    setNote('');
    setNewStatus('');
    setSelectedShipment(null);
    refetch();
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedShipment) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const docs = [...(selectedShipment.document_urls || []), { name: file.name, url: file_url, type: 'Document' }];
    await base44.entities.Shipment.update(selectedShipment.id, { document_urls: docs });
    await logFileAction('file_uploaded', file.name, 'shipment', selectedShipment.id, `Document uploaded to shipment ${selectedShipment.tracking_number}`);
    refetch();
  };

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
                      <button onClick={() => { setSelectedShipment(s); setNewStatus(''); }} className="font-mono font-semibold text-[#D50000] hover:underline">
                        {s.tracking_number}
                      </button>
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

      <ShipmentDetailModal
        shipment={selectedShipment}
        open={!!selectedShipment}
        onClose={() => setSelectedShipment(null)}
        readOnly={userDept === 'customer_service' || userDept === 'analyst'}
      />
    </div>
  );
}