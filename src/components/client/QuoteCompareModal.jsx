import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ship, Plane, Truck, Check, X, Download, CheckCircle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import QuoteBreakdown from './QuoteBreakdown';

const modeIcons = { sea: Ship, air: Plane, inland: Truck };

const statusColors = {
  quotation_ready: 'bg-purple-100 text-purple-800',
  sent_to_client: 'bg-indigo-100 text-indigo-800',
  client_confirmed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function QuoteCompareModal({ open, onClose, rfqs, onAccept, onReject, accepting }) {
  if (!rfqs?.length) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Compare Quotes ({rfqs.length})</DialogTitle>
        </DialogHeader>

        <div className="overflow-x-auto">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${rfqs.length}, minmax(320px, 1fr))` }}>
            {rfqs.map((rfq) => {
              const ModeIcon = modeIcons[rfq.mode] || Ship;
              const currency = rfq.quotation_details?.currency || rfq.quotation_currency || 'USD';
              const total = rfq.quotation_details?.subtotal || rfq.quotation_amount;
              const isConfirmed = rfq.status === 'client_confirmed';
              const isRejected = rfq.status === 'rejected';

              return (
                <div
                  key={rfq.id}
                  className={`border-2 rounded-xl overflow-hidden flex flex-col ${
                    isConfirmed ? 'border-green-400 bg-green-50/30' :
                    isRejected ? 'border-gray-200 opacity-60' :
                    'border-gray-200 bg-white'
                  }`}
                >
                  {/* Header */}
                  <div className="bg-[#1A1A1A] text-white p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-mono text-xs text-white/60">{rfq.reference_number}</p>
                        <p className="font-bold mt-0.5">{rfq.company_name}</p>
                      </div>
                      <Badge className={statusColors[rfq.status] || 'bg-gray-100 text-gray-800 text-xs'}>
                        {isConfirmed ? 'Accepted' : isRejected ? 'Rejected' : 'Quoted'}
                      </Badge>
                    </div>
                    {isConfirmed && (
                      <div className="mt-2 flex items-center gap-1.5 text-green-400 text-xs font-medium">
                        <CheckCircle className="w-3.5 h-3.5" /> You accepted this quote
                      </div>
                    )}
                  </div>

                  {/* Route Summary */}
                  <div className="p-4 border-b space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <ModeIcon className="w-4 h-4 text-[#D50000]" />
                      <span className="capitalize">{rfq.mode} Freight</span>
                      {rfq.incoterm && <span className="text-gray-400">· {rfq.incoterm}</span>}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{rfq.origin}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="font-medium">{rfq.destination}</span>
                    </div>
                    <div className="flex gap-3 text-xs text-gray-500 flex-wrap">
                      {rfq.cargo_type && <span>{rfq.cargo_type}</span>}
                      {rfq.weight_kg && <span>{rfq.weight_kg} KG</span>}
                      {rfq.volume_cbm && <span>{rfq.volume_cbm} CBM</span>}
                    </div>
                    {rfq.preferred_shipping_date && (
                      <p className="text-xs text-gray-500">
                        Preferred: {format(new Date(rfq.preferred_shipping_date), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>

                  {/* Total Price - Hero */}
                  <div className="p-4 border-b text-center bg-gray-50">
                    <p className="text-xs text-gray-500 mb-1">Total Quote</p>
                    <p className="text-3xl font-black text-[#1A1A1A]">
                      {total ? `${currency} ${Number(total).toLocaleString()}` : '—'}
                    </p>
                    {rfq.quotation_details?.validity_days && (
                      <p className="text-xs text-gray-400 mt-1">Valid {rfq.quotation_details.validity_days} days</p>
                    )}
                  </div>

                  {/* Line Items */}
                  <div className="p-4 flex-1">
                    {rfq.quotation_details?.line_items?.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pricing Breakdown</p>
                        {rfq.quotation_details.line_items.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-sm py-1 border-b border-dashed border-gray-100 last:border-0">
                            <span className="text-gray-600 truncate pr-2">{item.description || item.service_type}</span>
                            <span className="font-semibold text-right flex-shrink-0">
                              {currency} {(item.quantity * item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 text-center py-2">No line-item breakdown</p>
                    )}

                    {rfq.pricing_notes && (
                      <div className="mt-3 bg-gray-50 rounded p-2">
                        <p className="text-xs text-gray-500">{rfq.pricing_notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-4 border-t space-y-2">
                    {rfq.quotation_url && (
                      <a href={rfq.quotation_url} target="_blank" rel="noopener noreferrer" className="block">
                        <Button variant="outline" size="sm" className="w-full">
                          <Download className="w-3.5 h-3.5 mr-2" /> Download Quote
                        </Button>
                      </a>
                    )}
                    {!isConfirmed && !isRejected && ['quotation_ready', 'sent_to_client'].includes(rfq.status) && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => onAccept(rfq)}
                          disabled={accepting}
                        >
                          <Check className="w-3.5 h-3.5 mr-1" /> Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => onReject(rfq)}
                          disabled={accepting}
                        >
                          <X className="w-3.5 h-3.5 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                    {isConfirmed && (
                      <div className="flex items-center justify-center gap-2 text-green-700 text-sm font-medium py-1">
                        <CheckCircle className="w-4 h-4" /> Booking Created
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}