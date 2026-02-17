import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import StatusBadge from '../shared/StatusBadge';
import { Ship, Plane, Truck, MapPin, Calendar, CheckCircle2, Circle, Clock, FileText, Package, User } from 'lucide-react';
import { format } from 'date-fns';

const modeIcons = { sea: Ship, air: Plane, inland: Truck };

const statusOrder = [
  { key: 'booking_confirmed', label: 'Booking Confirmed' },
  { key: 'cargo_received', label: 'Cargo Received' },
  { key: 'export_clearance', label: 'Export Clearance' },
  { key: 'departed_origin', label: 'Departed Origin' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'arrived_destination', label: 'Arrived Destination' },
  { key: 'customs_clearance', label: 'Customs Clearance' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

export default function ShipmentDetailModal({ shipment, open, onClose }) {
  if (!shipment) return null;

  const MIcon = modeIcons[shipment.mode] || Ship;
  const currentIndex = statusOrder.findIndex(s => s.key === shipment.status);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="font-mono text-[#D50000] text-xl">{shipment.tracking_number}</span>
            <StatusBadge status={shipment.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* Route Summary */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <MIcon className="w-5 h-5 text-[#D50000]" />
              <span className="font-semibold capitalize">{shipment.mode} Freight</span>
              {shipment.company_name && <span className="text-gray-500 text-sm">· {shipment.company_name}</span>}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs">From</p>
                <p className="font-semibold">{shipment.origin}</p>
              </div>
              <div className="flex-1 border-t-2 border-dashed border-gray-300 mx-2" />
              <div className="text-right">
                <p className="text-gray-500 text-xs">To</p>
                <p className="font-semibold">{shipment.destination}</p>
              </div>
            </div>
            <div className="flex gap-6 mt-3 text-sm">
              {shipment.eta && (
                <div className="flex items-center gap-1 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>ETA: {format(new Date(shipment.eta), 'MMM d, yyyy')}</span>
                </div>
              )}
              {shipment.lead_time_days && (
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Lead time: {shipment.lead_time_days} days</span>
                </div>
              )}
              {shipment.first_available_vessel && (
                <div className="flex items-center gap-1 text-gray-600">
                  <Ship className="w-4 h-4" />
                  <span>1st vessel: {format(new Date(shipment.first_available_vessel), 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status Timeline */}
          <div>
            <h3 className="font-semibold text-[#1A1A1A] mb-4">Shipment Progress</h3>
            <div className="space-y-3">
              {statusOrder.map((step, index) => {
                const isDone = index < currentIndex;
                const isCurrent = index === currentIndex;
                const isPending = index > currentIndex;

                // Find the history entry for this step
                const historyEntry = (shipment.status_history || [])
                  .filter(h => h.status === step.key)
                  .at(-1);

                return (
                  <div key={step.key} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isDone ? 'bg-green-100' : isCurrent ? 'bg-[#D50000]' : 'bg-gray-100'
                      }`}>
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : isCurrent ? (
                          <Circle className="w-5 h-5 text-white fill-white" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                      {index < statusOrder.length - 1 && (
                        <div className={`w-0.5 h-8 mt-1 ${isDone ? 'bg-green-200' : 'bg-gray-200'}`} />
                      )}
                    </div>
                    <div className="pt-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${
                          isDone ? 'text-green-700' : isCurrent ? 'text-[#D50000]' : 'text-gray-400'
                        }`}>{step.label}</p>
                        {isCurrent && (
                          <Badge className="bg-[#D50000]/10 text-[#D50000] text-xs px-2 py-0">Current</Badge>
                        )}
                      </div>
                      {historyEntry && (
                        <div className="mt-0.5">
                          {historyEntry.timestamp && (
                            <p className="text-xs text-gray-400">
                              {format(new Date(historyEntry.timestamp), 'MMM d, yyyy · HH:mm')}
                            </p>
                          )}
                          {historyEntry.note && (
                            <p className="text-xs text-gray-600 mt-0.5">{historyEntry.note}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipper & Consignee */}
          {(shipment.shipper_name || shipment.consignee_name) && (
            <div className="grid md:grid-cols-2 gap-4">
              {shipment.shipper_name && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-sm">Shipper</span>
                  </div>
                  <p className="font-medium text-sm">{shipment.shipper_name}</p>
                  {shipment.shipper_contact && <p className="text-xs text-gray-600">{shipment.shipper_contact}</p>}
                  {shipment.shipper_phone && <p className="text-xs text-gray-600">{shipment.shipper_phone}</p>}
                  {shipment.shipper_email && <p className="text-xs text-gray-600">{shipment.shipper_email}</p>}
                  {shipment.shipper_address && <p className="text-xs text-gray-500 mt-1">{shipment.shipper_address}</p>}
                </div>
              )}
              {shipment.consignee_name && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-sm">Consignee</span>
                  </div>
                  <p className="font-medium text-sm">{shipment.consignee_name}</p>
                  {shipment.consignee_contact && <p className="text-xs text-gray-600">{shipment.consignee_contact}</p>}
                  {shipment.consignee_phone && <p className="text-xs text-gray-600">{shipment.consignee_phone}</p>}
                  {shipment.consignee_email && <p className="text-xs text-gray-600">{shipment.consignee_email}</p>}
                  {shipment.consignee_address && <p className="text-xs text-gray-500 mt-1">{shipment.consignee_address}</p>}
                </div>
              )}
            </div>
          )}

          {/* Documents */}
          {shipment.document_urls?.length > 0 && (
            <div>
              <h3 className="font-semibold text-[#1A1A1A] mb-3">Documents</h3>
              <div className="space-y-2">
                {shipment.document_urls.map((doc, i) => (
                  <a
                    key={i}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[#D50000] hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    {doc.name || `Document ${i + 1}`}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}