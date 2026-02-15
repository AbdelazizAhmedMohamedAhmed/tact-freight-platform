import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatusBadge from '../shared/StatusBadge';
import { Ship, Plane, Truck, MapPin, Calendar, Upload, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

const modeIcons = { sea: Ship, air: Plane, inland: Truck };

export default function ClientShipmentCard({ shipment, onUploadDocs }) {
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

        <div className="flex gap-2">
          <Link to={createPageUrl(`TrackShipment?tn=${shipment.tracking_number}`)} className="flex-1">
            <Button className="w-full bg-[#D50000] hover:bg-[#B00000]">
              <ExternalLink className="w-4 h-4 mr-2" /> Track Live
            </Button>
          </Link>
          <Button onClick={onUploadDocs} variant="outline" size="icon">
            <Upload className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}