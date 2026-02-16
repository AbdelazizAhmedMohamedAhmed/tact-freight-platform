import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusBadge from './StatusBadge';
import { Ship, Plane, Truck, Calendar, Package, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const modeIcons = {
  sea: Ship,
  air: Plane,
  inland: Truck,
};

export default function RFQCard({ rfq, onClick }) {
  const ModeIcon = modeIcons[rfq.mode] || Package;

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-mono text-gray-500">{rfq.reference_number}</p>
            <h3 className="font-bold text-[#1A1A1A] text-lg mt-1">{rfq.company_name}</h3>
          </div>
          <StatusBadge status={rfq.status} type="rfq" />
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ModeIcon className="w-4 h-4" />
            <span className="capitalize">{rfq.mode}</span>
          </div>
          <p className="text-sm text-gray-700">
            <span className="font-medium">{rfq.origin}</span> → <span className="font-medium">{rfq.destination}</span>
          </p>
          {rfq.preferred_shipping_date && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(rfq.preferred_shipping_date), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-xs text-gray-500">
            Created {format(new Date(rfq.created_date), 'MMM d, yyyy')}
          </p>
          <Button variant="ghost" size="sm" className="text-[#D50000] hover:text-[#B00000]">
            View Details <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}