import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusBadge from '../shared/StatusBadge';
import { Ship, Plane, Truck, MapPin, Calendar, Upload, Eye, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import ShipmentDetailModal from './ShipmentDetailModal';
import RequestAmendmentModal from './RequestAmendmentModal';

const modeIcons = { sea: Ship, air: Plane, inland: Truck };

export default function ClientShipmentCard({ shipment, onUploadDocs, onRefresh }) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [amendOpen, setAmendOpen] = useState(false);
  const MIcon = modeIcons[shipment.mode] || Ship;

  const getStatusMessage = (status) => {
    const messages = {
      booking_confirmed: 'Booking confirmed - preparing for shipment',
      cargo_received: 'Cargo received at origin warehouse',
      customs_export: 'Clearing export customs',
      departed_origin: 'Departed from origin port',
      in_transit: 'In transit to destination',
      arrived_destination: 'Arrived at destination port',
      customs_clearance: 'Clearing destination customs',
      out_for_delivery: 'Out for delivery',
      delivered: 'Successfully delivered 🎉'
    };
    return messages[status] || status;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-lg font-bold text-[#D50000]">{shipment.tracking_number}</p>
            <p className="text-sm text-gray-500 mt-1">{shipment.company_name || 'Shipment'}</p>
          </div>
          <StatusBadge status={shipment.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <MIcon className="w-4 h-4 text-gray-400" />
          <span className="capitalize font-medium">{shipment.mode}</span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-gray-500">From</p>
              <p className="font-medium">{shipment.origin}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[#D50000] mt-0.5" />
            <div>
              <p className="text-gray-500">To</p>
              <p className="font-medium">{shipment.destination}</p>
            </div>
          </div>
        </div>

        {shipment.eta && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">ETA: {format(new Date(shipment.eta), 'MMM d, yyyy')}</span>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
          <p className="text-xs text-blue-700">{getStatusMessage(shipment.status)}</p>
        </div>

        <div className="flex gap-2 flex-col">
          <Button onClick={() => setDetailOpen(true)} className="bg-[#D50000] hover:bg-[#B00000]">
            <Eye className="w-4 h-4 mr-2" /> View Details
          </Button>
          <div className="flex gap-2">
            <Button onClick={onUploadDocs} variant="outline" className="flex-1" size="sm">
              <Upload className="w-4 h-4 mr-1" /> Upload Docs
            </Button>
            <Button onClick={() => setAmendOpen(true)} variant="outline" className="flex-1" size="sm">
              <AlertCircle className="w-4 h-4 mr-1" /> Request Change
            </Button>
          </div>
        </div>
      </CardContent>

      <ShipmentDetailModal
        shipment={shipment}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
      <RequestAmendmentModal
        shipment={shipment}
        open={amendOpen}
        onClose={() => setAmendOpen(false)}
        onUpdate={onRefresh}
      />
    </Card>
  );
}