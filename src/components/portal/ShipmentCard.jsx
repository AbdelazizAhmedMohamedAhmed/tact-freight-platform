import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusBadge from './StatusBadge';
import { Ship, Plane, Truck, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const modeIcons = {
  sea: Ship,
  air: Plane,
  inland: Truck,
};

export default function ShipmentCard({ shipment, onClick }) {
  const ModeIcon = modeIcons[shipment.mode] || Ship;

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-mono text-gray-500">{shipment.tracking_number}</p>
            <h3 className="font-bold text-[#1A1A1A] text-lg mt-1">{shipment.company_name}</h3>
          </div>
          <StatusBadge status={shipment.status} type="shipment" />
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ModeIcon className="w-4 h-4" />
            <span className="capitalize">{shipment.mode}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">{shipment.origin}</span> → <span className="font-medium">{shipment.destination}</span>
          </div>
          {shipment.eta && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>ETA: {format(new Date(shipment.eta), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-xs text-gray-500">
            Updated {format(new Date(shipment.updated_date), 'MMM d, yyyy')}
          </p>
          <Button variant="ghost" size="sm" className="text-[#D50000] hover:text-[#B00000]">
            Track <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}