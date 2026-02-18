import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import ShipmentDetailsForm from '../components/operations/ShipmentDetailsForm';
import ShipmentTimeline from '../components/operations/ShipmentTimeline';
import StatusBadge from '../components/shared/StatusBadge';
import { Loader2, Ship, Plane, Truck, AlertCircle } from 'lucide-react';
import { logRFQAction } from '../components/utils/activityLogger';

const modeIcons = { sea: Ship, air: Plane, inland: Truck };

export default function OperationsShipmentDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const shipmentId = urlParams.get('id');
  const [user, setUser] = useState(null);
  const [statusNotes, setStatusNotes] = useState('');
  const [selectedNextStatus, setSelectedNextStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const { data: shipment, isLoading, refetch } = useQuery({
    queryKey: ['shipment', shipmentId],
    queryFn: () => shipmentId ? base44.entities.Shipment.filter({ id: shipmentId }, '-created_date', 1).then(r => r[0]) : null,
    enabled: !!shipmentId && !!user,
  });

  if (!shipmentId || !user) {
    return <div className="text-center py-8">Invalid shipment ID</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#D50000]" />
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
        <p>Shipment not found</p>
      </div>
    );
  }

  const ModeIcon = modeIcons[shipment.mode] || Ship;

  const userRole = user?.department || user?.role || 'user';
  const isAdmin = userRole === 'admin';

  const handleDeleteShipment = async () => {
    if (!window.confirm(`Delete shipment ${shipment.tracking_number}? This cannot be undone.`)) return;
    await base44.entities.Shipment.delete(shipment.id);
    window.history.back();
  };
  
  const handleStatusUpdate = async (newStatus) => {
    if (!newStatus || updatingStatus) return;
    setUpdatingStatus(newStatus);

    try {
      const statusHistory = shipment.status_history || [];
      statusHistory.push({
        status: newStatus,
        timestamp: new Date().toISOString(),
        note: statusNotes || undefined,
        updated_by: user.email,
      });

      await base44.entities.Shipment.update(shipment.id, {
        status: newStatus,
        status_history: statusHistory,
      });

      await logRFQAction(
        { tracking_number: shipment.tracking_number },
        'shipment_status_changed',
        `Shipment ${shipment.tracking_number} status changed to ${newStatus}`,
        { old_value: shipment.status, new_value: newStatus }
      );

      // Send notifications
      const { notifyShipmentStatusUpdate } = await import('../components/utils/notificationEngine');
      await notifyShipmentStatusUpdate(shipment, newStatus);

      setStatusNotes('');
      refetch();
    } finally {
      setUpdatingStatus(null);
    }
  };

  const nextStatuses = {
    booking_confirmed: ['cargo_received'],
    cargo_received: ['export_clearance'],
    export_clearance: ['departed_origin'],
    departed_origin: ['in_transit'],
    in_transit: ['arrived_destination'],
    arrived_destination: ['customs_clearance'],
    customs_clearance: ['out_for_delivery'],
    out_for_delivery: ['delivered'],
    delivered: [],
  };

  const availableNextStatuses = nextStatuses[shipment.status] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">
              {shipment.tracking_number}
            </h1>
            <StatusBadge status={shipment.status} />
          </div>
          <p className="text-sm text-gray-600">
            {shipment.company_name} • {shipment.origin} → {shipment.destination}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ModeIcon className="w-6 h-6 text-[#D50000]" />
          <span className="text-sm font-semibold uppercase">{shipment.mode}</span>
        </div>
      </div>

      {/* Key Info Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-gray-500 mb-1">BL/AWB Number</p>
            <p className="font-semibold">{shipment.bl_number || 'Not set'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-gray-500 mb-1">Carrier</p>
            <p className="font-semibold text-sm">
              {shipment.shipping_line_airline || 'Not set'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-gray-500 mb-1">Containers</p>
            <p className="font-semibold">
              {shipment.num_containers || shipment.num_packages || 'N/A'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-gray-500 mb-1">Weight</p>
            <p className="font-semibold">
              {shipment.actual_weight_kg || shipment.weight_kg || 'N/A'} KG
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="status">Update Status</TabsTrigger>
        </TabsList>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shipment Journey</CardTitle>
            </CardHeader>
            <CardContent>
              <ShipmentTimeline shipment={shipment} showAllSteps={true} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <ShipmentDetailsForm
            shipment={shipment}
            onUpdate={refetch}
          />
        </TabsContent>

        {/* Status Update Tab */}
        <TabsContent value="status" className="space-y-4">
          {isAdmin && (
        <Card className="border-[#D50000]/20 bg-red-50">
          <CardHeader><CardTitle className="text-sm text-[#D50000]">Admin Override</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-gray-600">Force any status or delete this shipment.</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(nextStatuses).filter(s => s !== shipment.status).map(s => (
                <Button key={s} size="sm" variant="outline" onClick={() => handleStatusUpdate(s)}>
                  → {s.replace(/_/g, ' ')}
                </Button>
              ))}
            </div>
            <Button variant="destructive" size="sm" className="w-full" onClick={handleDeleteShipment}>
              Delete Shipment
            </Button>
          </CardContent>
        </Card>
      )}

      {(userRole === 'operations' || userRole === 'admin') && availableNextStatuses.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Update Shipment Status</CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Current: <span className="font-semibold capitalize">{shipment.status.replace('_', ' ')}</span>
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Next Status</label>
                  <Select
                    value={updatingStatus || ''}
                    onValueChange={setUpdatingStatus}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select next status" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableNextStatuses.map(status => (
                        <SelectItem key={status} value={status}>
                          {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Note (Optional)</label>
                  <Textarea
                    value={statusNotes}
                    onChange={e => setStatusNotes(e.target.value)}
                    placeholder="Add internal notes about this status update..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={() => handleStatusUpdate(updatingStatus)}
                  disabled={!updatingStatus || updatingStatus === 'loading'}
                  className="w-full bg-[#D50000] hover:bg-[#B00000]"
                >
                  {updatingStatus === 'loading' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Status'
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : userRole === 'operations' || userRole === 'admin' ? (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <p className="text-green-800 font-medium">
                  ✓ This shipment has been delivered and cannot be updated further.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <p className="text-yellow-800 font-medium">
                  You don't have permission to update shipment status.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}