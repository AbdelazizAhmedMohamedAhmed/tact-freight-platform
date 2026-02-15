import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatusBadge from '../shared/StatusBadge';
import { Ship, Plane, Truck, MessageSquare, Upload, FileText, Calendar, Package } from 'lucide-react';
import { format } from 'date-fns';

const modeIcons = { sea: Ship, air: Plane, inland: Truck };

export default function ClientRFQCard({ rfq, onViewDetails, onUploadDocs }) {
  const MIcon = modeIcons[rfq.mode] || Ship;

  const getStatusMessage = (status) => {
    const messages = {
      submitted: 'Your RFQ has been received and is being reviewed',
      sales_review: 'Our sales team is reviewing your request',
      pricing_review: 'Our pricing team is preparing your quotation',
      quoted: 'Quotation is ready for review',
      sent_to_client: 'Quotation sent - awaiting your response',
      accepted: 'RFQ accepted - shipment will be created soon',
      rejected: 'RFQ was declined',
      won: 'Deal secured! 🎉',
      lost: 'RFQ closed'
    };
    return messages[status] || status;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-lg font-bold text-[#D50000]">{rfq.reference_number}</p>
            <p className="text-sm text-gray-500 mt-1">{rfq.company_name}</p>
          </div>
          <StatusBadge status={rfq.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <MIcon className="w-4 h-4 text-gray-400" />
            <span className="capitalize">{rfq.mode}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{format(new Date(rfq.created_date), 'MMM d, yyyy')}</span>
          </div>
        </div>

        <div className="text-sm">
          <p className="text-gray-500">Route:</p>
          <p className="font-medium">{rfq.origin} → {rfq.destination}</p>
        </div>

        {rfq.weight_kg || rfq.volume_cbm ? (
          <div className="flex gap-4 text-sm">
            {rfq.weight_kg && (
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3 text-gray-400" />
                <span className="text-gray-600">{rfq.weight_kg} KG</span>
              </div>
            )}
            {rfq.volume_cbm && (
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3 text-gray-400" />
                <span className="text-gray-600">{rfq.volume_cbm} CBM</span>
              </div>
            )}
          </div>
        ) : null}

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
          <p className="text-xs text-blue-700">{getStatusMessage(rfq.status)}</p>
        </div>

        {rfq.quotation_url && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
            <FileText className="w-4 h-4 text-green-600" />
            <div className="flex-1">
              <p className="text-xs font-medium text-green-900">Quotation Available</p>
              {rfq.quotation_amount && (
                <p className="text-lg font-bold text-green-700">${rfq.quotation_amount.toLocaleString()}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={onViewDetails} className="flex-1 bg-[#D50000] hover:bg-[#B00000]">
            <MessageSquare className="w-4 h-4 mr-2" /> View Details
          </Button>
          <Button onClick={onUploadDocs} variant="outline" size="icon">
            <Upload className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}