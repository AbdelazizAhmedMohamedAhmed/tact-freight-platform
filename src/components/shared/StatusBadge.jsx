import React from 'react';
import { Badge } from "@/components/ui/badge";

const statusConfig = {
  // RFQ statuses
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  sales_review: { label: 'Sales Review', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  pricing_in_progress: { label: 'Pricing In Progress', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  quotation_ready: { label: 'Quotation Ready', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  sent_to_client: { label: 'Sent to Client', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  client_confirmed: { label: 'Client Confirmed', color: 'bg-green-100 text-green-800 border-green-200' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  // Shipment statuses
  booking_confirmed: { label: 'Booking Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  cargo_received: { label: 'Cargo Received', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  customs_export: { label: 'Customs Export', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  departed_origin: { label: 'Departed Origin', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  in_transit: { label: 'In Transit', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  arrived_destination: { label: 'Arrived', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  customs_clearance: { label: 'Customs Clearance', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800 border-green-200' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  return (
    <Badge variant="outline" className={`${config.color} border font-medium text-xs`}>
      {config.label}
    </Badge>
  );
}