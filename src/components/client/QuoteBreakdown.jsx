import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const serviceTypeLabels = {
  freight: 'Ocean/Air Freight',
  customs: 'Customs Clearance',
  insurance: 'Insurance',
  handling: 'Handling',
  documentation: 'Documentation',
  storage: 'Storage',
  delivery: 'Delivery',
  other: 'Other Charges',
};

const serviceTypeColors = {
  freight: 'bg-blue-100 text-blue-800',
  customs: 'bg-purple-100 text-purple-800',
  insurance: 'bg-green-100 text-green-800',
  handling: 'bg-yellow-100 text-yellow-800',
  documentation: 'bg-indigo-100 text-indigo-800',
  storage: 'bg-orange-100 text-orange-800',
  delivery: 'bg-teal-100 text-teal-800',
  other: 'bg-gray-100 text-gray-800',
};

export default function QuoteBreakdown({ rfq }) {
  const details = rfq?.quotation_details;
  const lineItems = details?.line_items || [];
  const currency = details?.currency || rfq?.quotation_currency || 'USD';
  const total = details?.subtotal || rfq?.quotation_amount || 0;

  if (!lineItems.length && !rfq?.quotation_amount) return null;

  if (!lineItems.length) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        Quote total: <span className="font-bold text-[#1A1A1A]">{currency} {Number(total).toLocaleString()}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Service</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Unit Price</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lineItems.map((item, idx) => (
            <TableRow key={idx}>
              <TableCell>
                <Badge className={serviceTypeColors[item.service_type] || 'bg-gray-100 text-gray-800'}>
                  {serviceTypeLabels[item.service_type] || item.service_type}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-700">{item.description || '—'}</TableCell>
              <TableCell className="text-right text-sm">{item.quantity}</TableCell>
              <TableCell className="text-right text-sm">{currency} {Number(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell className="text-right font-semibold text-sm">
                {currency} {(item.quantity * item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Separator />

      <div className="flex justify-end items-center gap-4 pr-2">
        <span className="text-gray-600 font-medium">Total Amount</span>
        <span className="text-2xl font-black text-[#1A1A1A]">{currency} {Number(total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      </div>

      {details?.validity_days && (
        <p className="text-xs text-gray-500 text-right">Valid for {details.validity_days} days from issue date</p>
      )}

      {details?.notes && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 font-medium mb-1">Terms & Notes</p>
          <p className="text-sm text-gray-700 whitespace-pre-line">{details.notes}</p>
        </div>
      )}
    </div>
  );
}