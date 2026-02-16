import React from 'react';
import { Badge } from "@/components/ui/badge";

const rfqStatusConfig = {
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
  sales_review: { label: 'Sales Review', color: 'bg-yellow-100 text-yellow-800' },
  pricing_in_progress: { label: 'Pricing', color: 'bg-orange-100 text-orange-800' },
  quotation_ready: { label: 'Quotation Ready', color: 'bg-purple-100 text-purple-800' },
  sent_to_client: { label: 'Sent to Client', color: 'bg-indigo-100 text-indigo-800' },
  client_confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
};

const shipmentStatusConfig = {
  booking_confirmed: { label: 'Booking Confirmed', color: 'bg-blue-100 text-blue-800' },
  cargo_received: { label: 'Cargo Received', color: 'bg-cyan-100 text-cyan-800' },
  export_clearance: { label: 'Export Clearance', color: 'bg-yellow-100 text-yellow-800' },
  departed_origin: { label: 'Departed Origin', color: 'bg-orange-100 text-orange-800' },
  in_transit: { label: 'In Transit', color: 'bg-purple-100 text-purple-800' },
  arrived_destination: { label: 'Arrived', color: 'bg-indigo-100 text-indigo-800' },
  customs_clearance: { label: 'Customs Clearance', color: 'bg-pink-100 text-pink-800' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-teal-100 text-teal-800' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
};

export default function StatusBadge({ status, type = 'rfq' }) {
  const config = type === 'rfq' ? rfqStatusConfig : shipmentStatusConfig;
  const statusInfo = config[status] || { label: status, color: 'bg-gray-100 text-gray-800' };

  return (
    <Badge className={`${statusInfo.color} font-medium`}>
      {statusInfo.label}
    </Badge>
  );
}