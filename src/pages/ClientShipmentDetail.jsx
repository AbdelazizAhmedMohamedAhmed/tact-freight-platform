import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, Ship, Package, Calendar, MapPin, Eye, Save } from 'lucide-react';
import { format } from 'date-fns';
import ShipmentDocuments from '../components/client/ShipmentDocuments';
import ShipmentQuote from '../components/client/ShipmentQuote';
import ShipmentTimeline from '../components/operations/ShipmentTimeline';
import StatusBadge from '../components/shared/StatusBadge';
import CommentThread from '../components/portal/CommentThread';

export default function ClientShipmentDetail() {
  const [user, setUser] = useState(null);
  const [shipmentId, setShipmentId] = useState(null);
  const [acidInput, setAcidInput] = useState('');
  const [savingAcid, setSavingAcid] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
    
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) setShipmentId(id);
  }, []);

  const { data: shipment, isLoading } = useQuery({
    queryKey: ['shipment-detail', shipmentId],
    queryFn: () => base44.entities.Shipment.filter({ id: shipmentId }, '', 1),
    enabled: !!shipmentId,
    select: (data) => data[0],
  });

  useEffect(() => {
    if (shipment) setAcidInput(shipment.hbl_acid || '');
  }, [shipment?.id]);

  const handleSaveAcid = async () => {
    if (!shipment) return;
    setSavingAcid(true);
    await base44.entities.Shipment.update(shipment.id, { hbl_acid: acidInput });
    setSavingAcid(false);
  };

  const { data: rfq } = useQuery({
    queryKey: ['shipment-rfq', shipment?.rfq_id],
    queryFn: () => base44.entities.RFQ.filter({ id: shipment?.rfq_id }, '', 1),
    enabled: !!shipment?.rfq_id,
    select: (data) => data[0],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#D50000]" />
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="space-y-4 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Shipment not found</p>
            <p className="text-sm text-red-800">We couldn't find the shipment you're looking for.</p>
          </div>
        </div>
      </div>
    );
  }

  const ModeIcon = { sea: Ship, air: Package, inland: Package }[shipment.mode] || Ship;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ModeIcon className="w-6 h-6 text-[#D50000]" />
            <span className="font-mono font-bold text-[#D50000] text-2xl">{shipment.tracking_number}</span>
          </div>
          <p className="text-gray-600">{shipment.company_name}</p>
        </div>
        <StatusBadge status={shipment.status} />
      </div>

      {/* Key Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-gray-500 font-medium mb-1">ROUTE</p>
            <p className="font-semibold">{shipment.origin}</p>
            <p className="text-sm text-gray-600 mt-1">↓</p>
            <p className="font-semibold mt-1">{shipment.destination}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-gray-500 font-medium mb-1">MODE</p>
            <p className="font-semibold capitalize">{shipment.mode}</p>
            {shipment.shipping_line_airline && (
              <p className="text-sm text-gray-600 mt-2">{shipment.shipping_line_airline}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-gray-500 font-medium mb-1">WEIGHT / VOLUME</p>
            <p className="font-semibold">
              {shipment.actual_weight_kg || shipment.weight_kg || '—'} KG
            </p>
            {shipment.volume_cbm && (
              <p className="text-sm text-gray-600 mt-1">{shipment.volume_cbm} CBM</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-gray-500 font-medium mb-1">ETA</p>
            {shipment.eta ? (
              <p className="font-semibold">{format(new Date(shipment.eta), 'MMM d, yyyy')}</p>
            ) : (
              <p className="text-gray-500">To be confirmed</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">Tracking</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <ShipmentTimeline shipment={shipment} />
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Shipper Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Shipper</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {shipment.shipper_name && <div>
                  <p className="text-xs text-gray-500 mb-1">Company</p>
                  <p className="font-medium">{shipment.shipper_name}</p>
                </div>}
                {shipment.shipper_address && <div>
                  <p className="text-xs text-gray-500 mb-1">Address</p>
                  <p className="text-sm">{shipment.shipper_address}</p>
                </div>}
                {shipment.shipper_contact && <div>
                  <p className="text-xs text-gray-500 mb-1">Contact</p>
                  <p className="font-medium">{shipment.shipper_contact}</p>
                </div>}
                {shipment.shipper_email && <div>
                  <a href={`mailto:${shipment.shipper_email}`} className="text-[#D50000] hover:underline text-sm">
                    {shipment.shipper_email}
                  </a>
                </div>}
              </CardContent>
            </Card>

            {/* Consignee Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Consignee</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {shipment.consignee_name && <div>
                  <p className="text-xs text-gray-500 mb-1">Company</p>
                  <p className="font-medium">{shipment.consignee_name}</p>
                </div>}
                {shipment.consignee_address && <div>
                  <p className="text-xs text-gray-500 mb-1">Address</p>
                  <p className="text-sm">{shipment.consignee_address}</p>
                </div>}
                {shipment.consignee_contact && <div>
                  <p className="text-xs text-gray-500 mb-1">Contact</p>
                  <p className="font-medium">{shipment.consignee_contact}</p>
                </div>}
                {shipment.consignee_email && <div>
                  <a href={`mailto:${shipment.consignee_email}`} className="text-[#D50000] hover:underline text-sm">
                    {shipment.consignee_email}
                  </a>
                </div>}
              </CardContent>
            </Card>

            {/* Cargo Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cargo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {shipment.commodity_description && <div>
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-sm">{shipment.commodity_description}</p>
                </div>}
                {shipment.num_containers && <div>
                  <p className="text-xs text-gray-500 mb-1">Containers/Packages</p>
                  <p className="font-medium">{shipment.num_containers}</p>
                </div>}
              </CardContent>
            </Card>

            {/* BL/AWB + ACID Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Transport Docs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {shipment.bl_number && <div>
                  <p className="text-xs text-gray-500 mb-1">BL/AWB Number</p>
                  <p className="font-mono font-semibold text-[#D50000]">{shipment.bl_number}</p>
                </div>}
                {shipment.vessel_flight_info && <div>
                  <p className="text-xs text-gray-500 mb-1">Vessel/Flight</p>
                  <p className="font-medium">{shipment.vessel_flight_info}</p>
                </div>}
                {shipment.mbl_acid && <div>
                  <p className="text-xs text-gray-500 mb-1">MBL ACID</p>
                  <p className="font-mono font-semibold">{shipment.mbl_acid}</p>
                </div>}
                {/* Client can submit their HBL ACID */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">HBL ACID</p>
                  {shipment.hbl_acid && !savingAcid ? (
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-semibold flex-1">{shipment.hbl_acid}</p>
                      <button
                        onClick={() => setAcidInput(shipment.hbl_acid)}
                        className="text-xs text-[#D50000] hover:underline"
                      >Edit</button>
                    </div>
                  ) : null}
                  {(!shipment.hbl_acid || acidInput !== shipment.hbl_acid) && (
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={acidInput}
                        onChange={e => setAcidInput(e.target.value)}
                        placeholder="Enter HBL ACID number"
                        className="font-mono text-sm h-8"
                      />
                      <Button
                        size="sm"
                        onClick={handleSaveAcid}
                        disabled={savingAcid || !acidInput.trim()}
                        className="bg-[#D50000] hover:bg-[#B00000] h-8 px-3"
                      >
                        {savingAcid ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quote Section */}
          {rfq && (
            <ShipmentQuote rfq={rfq} />
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <ShipmentDocuments shipment={shipment} />
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments">
          {shipment.status !== 'delivered' ? (
            <CommentThread entityType="shipment" entityId={shipment.id} userRole="user" />
          ) : (
            <div className="space-y-4">
              <CommentThread entityType="shipment" entityId={shipment.id} userRole="user" readOnly />
              <p className="text-center text-sm text-gray-500 italic">This shipment is closed — no new comments can be added.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}