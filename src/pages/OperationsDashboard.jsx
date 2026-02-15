import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import StatsCard from '../components/portal/StatsCard';
import DelayAlerts from '../components/operations/DelayAlerts';
import AssignTaskModal from '../components/operations/AssignTaskModal';
import InternalChat from '../components/operations/InternalChat';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from '../components/shared/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Ship, Plane, Truck, Plus, Package, CheckCircle2, Clock, AlertTriangle, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";

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

export default function OperationsDashboard() {
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const { data: shipments = [], isLoading, refetch } = useQuery({
    queryKey: ['ops-shipments'],
    queryFn: () => base44.entities.Shipment.list('-created_date', 100),
  });

  const { data: acceptedRFQs = [] } = useQuery({
    queryKey: ['ops-accepted-rfqs'],
    queryFn: () => base44.entities.RFQ.filter({ status: 'accepted' }, '-created_date', 50),
  });

  const active = shipments.filter(s => s.status !== 'delivered');
  const delivered = shipments.filter(s => s.status === 'delivered');

  const handleStatusUpdate = async () => {
    if (!newStatus || !selectedShipment) return;
    setUpdating(true);
    try {
      const now = new Date().toISOString();
      const history = [...(selectedShipment.status_history || []), { status: newStatus, timestamp: now, note: statusNote }];
      await base44.entities.Shipment.update(selectedShipment.id, { status: newStatus, status_history: history });
      setDetailsOpen(false);
      setNewStatus('');
      setStatusNote('');
      refetch();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Operations Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time shipment management with alerts & task assignment</p>
        </div>
        <Link to={createPageUrl('CreateShipment')}>
          <Button className="bg-[#D50000] hover:bg-[#B00000]"><Plus className="w-4 h-4 mr-2" /> New Shipment</Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Active Shipments" value={active.length} icon={Truck} />
        <StatsCard title="At Risk" value={shipments.filter(s => s.status === 'customs_clearance').length} icon={AlertTriangle} />
        <StatsCard title="Pending Jobs" value={acceptedRFQs.length} icon={Clock} />
        <StatsCard title="Delivered" value={delivered.length} icon={CheckCircle2} />
      </div>

      {/* Alerts Section */}
      {active.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Critical Alerts</h2>
          <DelayAlerts shipments={active} />
        </div>
      )}

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
        <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Active Shipments Management</h2>
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {active.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-12 text-gray-400">No active shipments</TableCell></TableRow>
                )}
                {active.map(s => {
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
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => { setSelectedShipment(s); setDetailsOpen(true); setNewStatus(s.status); }}
                          >
                            Update
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => { setSelectedShipment(s); setTaskOpen(true); }}
                          >
                            Assign
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-mono text-[#D50000]">{selectedShipment?.tracking_number}</DialogTitle>
          </DialogHeader>
          {selectedShipment && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Current Status:</span>
                <StatusBadge status={selectedShipment.status} />
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
                <Label>Status Update Note</Label>
                <Textarea value={statusNote} onChange={e => setStatusNote(e.target.value)} placeholder="e.g., In customs for inspection..." className="min-h-20" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>Cancel</Button>
                <Button onClick={handleStatusUpdate} disabled={updating || !newStatus} className="bg-[#D50000] hover:bg-[#B00000]">
                  {updating ? 'Updating...' : 'Update Status'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Task Assignment Modal */}
      <AssignTaskModal shipment={selectedShipment} open={taskOpen} onClose={() => setTaskOpen(false)} onUpdate={refetch} />
    </div>
  );
}