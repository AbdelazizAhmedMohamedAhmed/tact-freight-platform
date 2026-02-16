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
import { Ship, Plane, Truck, Upload, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { sendStatusNotification } from '../components/utils/notificationService';
import { logShipmentAction, logFileAction } from '../components/utils/activityLogger';

const modeIcons = { sea: Ship, air: Plane, inland: Truck };
const statusOrder = [
  'booking_confirmed', 'cargo_received', 'customs_export', 'departed_origin',
  'in_transit', 'arrived_destination', 'customs_clearance', 'out_for_delivery', 'delivered'
];
const statusLabels = {
  booking_confirmed: 'Booking Confirmed', cargo_received: 'Cargo Received',
  customs_export: 'Customs Export', departed_origin: 'Departed Origin',
  in_transit: 'In Transit', arrived_destination: 'Arrived Destination',
  customs_clearance: 'Customs Clearance', out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
};

export default function OperationsShipments() {
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const { data: shipments = [], isLoading, refetch } = useQuery({
    queryKey: ['ops-all-shipments'],
    queryFn: () => base44.entities.Shipment.list('-created_date', 200),
  });

  const handleStatusUpdate = async () => {
    if (!newStatus || !selected) return;
    setUpdating(true);
    const now = new Date().toISOString();
    const history = [...(selected.status_history || []), { status: newStatus, timestamp: now, note }];
    
    const updatedShipment = await base44.entities.Shipment.update(selected.id, { 
      status: newStatus, 
      status_history: history,
      shipper_name: selected.shipper_name,
      shipper_address: selected.shipper_address,
      shipper_contact: selected.shipper_contact,
      shipper_phone: selected.shipper_phone,
      shipper_email: selected.shipper_email,
      consignee_name: selected.consignee_name,
      consignee_address: selected.consignee_address,
      consignee_contact: selected.consignee_contact,
      consignee_phone: selected.consignee_phone,
      consignee_email: selected.consignee_email,
      lead_time_days: selected.lead_time_days,
      first_available_vessel: selected.first_available_vessel,
    });
    
    // Log activity
    await logShipmentAction(
      updatedShipment,
      'shipment_status_changed',
      `Shipment ${selected.tracking_number} updated - status changed from ${selected.status} to ${newStatus}${note ? ': ' + note : ''}`,
      { old_value: selected.status, new_value: newStatus }
    );
    
    // Send notification to client
    await sendStatusNotification('shipment', updatedShipment, selected.status, newStatus);
    
    setUpdating(false);
    setNote('');
    setNewStatus('');
    setSelected(null);
    refetch();
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selected) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const docs = [...(selected.document_urls || []), { name: file.name, url: file_url, type: 'Document' }];
    await base44.entities.Shipment.update(selected.id, { document_urls: docs });
    
    await logFileAction('file_uploaded', file.name, 'shipment', selected.id, `Document uploaded to shipment ${selected.tracking_number}`);
    
    refetch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">All Shipments</h1>
        <p className="text-gray-500 text-sm mt-1">Update statuses and manage shipments</p>
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
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.map(s => {
                const MIcon = modeIcons[s.mode] || Ship;
                return (
                  <TableRow key={s.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono font-semibold text-[#D50000]">{s.tracking_number}</TableCell>
                    <TableCell>{s.company_name}</TableCell>
                    <TableCell className="text-sm">{s.origin} → {s.destination}</TableCell>
                    <TableCell><div className="flex items-center gap-2 capitalize"><MIcon className="w-4 h-4 text-gray-400" />{s.mode}</div></TableCell>
                    <TableCell><StatusBadge status={s.status} /></TableCell>
                    <TableCell className="text-sm text-gray-500">{s.eta ? format(new Date(s.eta), 'MMM d') : '-'}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => { setSelected(s); setNewStatus(''); }}>Update</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Update Modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono text-[#D50000]">{selected?.tracking_number}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-6 mt-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Current Status:</span>
                <StatusBadge status={selected.status} />
              </div>

              {/* Shipper Details */}
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-[#1A1A1A]">Shipper Details</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input 
                      value={selected.shipper_name || ''} 
                      onChange={e => setSelected({...selected, shipper_name: e.target.value})}
                      placeholder="Shipper company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Person</Label>
                    <Input 
                      value={selected.shipper_contact || ''} 
                      onChange={e => setSelected({...selected, shipper_contact: e.target.value})}
                      placeholder="Contact person"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input 
                      value={selected.shipper_phone || ''} 
                      onChange={e => setSelected({...selected, shipper_phone: e.target.value})}
                      placeholder="+1234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      value={selected.shipper_email || ''} 
                      onChange={e => setSelected({...selected, shipper_email: e.target.value})}
                      placeholder="shipper@company.com"
                      type="email"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Address</Label>
                    <Textarea 
                      value={selected.shipper_address || ''} 
                      onChange={e => setSelected({...selected, shipper_address: e.target.value})}
                      placeholder="Full shipper address"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Consignee Details */}
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-[#1A1A1A]">Consignee Details</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input 
                      value={selected.consignee_name || ''} 
                      onChange={e => setSelected({...selected, consignee_name: e.target.value})}
                      placeholder="Consignee company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Person</Label>
                    <Input 
                      value={selected.consignee_contact || ''} 
                      onChange={e => setSelected({...selected, consignee_contact: e.target.value})}
                      placeholder="Contact person"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input 
                      value={selected.consignee_phone || ''} 
                      onChange={e => setSelected({...selected, consignee_phone: e.target.value})}
                      placeholder="+1234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      value={selected.consignee_email || ''} 
                      onChange={e => setSelected({...selected, consignee_email: e.target.value})}
                      placeholder="consignee@company.com"
                      type="email"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Address</Label>
                    <Textarea 
                      value={selected.consignee_address || ''} 
                      onChange={e => setSelected({...selected, consignee_address: e.target.value})}
                      placeholder="Full consignee address"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Lead Time & Vessel Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lead Time (Days)</Label>
                  <Input 
                    type="number"
                    value={selected.lead_time_days || ''} 
                    onChange={e => setSelected({...selected, lead_time_days: parseInt(e.target.value) || null})}
                    placeholder="e.g. 14"
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>First Available Vessel</Label>
                  <Input 
                    type="date"
                    value={selected.first_available_vessel || ''} 
                    onChange={e => setSelected({...selected, first_available_vessel: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Update Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger><SelectValue placeholder="Select new status" /></SelectTrigger>
                  <SelectContent>
                    {statusOrder.map(s => (
                      <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Note</Label>
                <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Optional status update note..." />
              </div>

              <div className="space-y-2">
                <Label>Upload Document</Label>
                <Input type="file" onChange={handleDocUpload} />
              </div>

              <Button onClick={handleStatusUpdate} disabled={updating || !newStatus} className="bg-[#D50000] hover:bg-[#B00000] w-full h-12">
                {updating ? 'Updating...' : 'Update Shipment'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}