import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StatusBadge from '../components/shared/StatusBadge';
import { Search, Ship, Plane, Truck, MapPin, Calendar, Clock, FileText, Package, Check, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const statusOrder = [
  'booking_confirmed', 'cargo_received', 'customs_export', 'departed_origin',
  'in_transit', 'arrived_destination', 'customs_clearance', 'out_for_delivery', 'delivered'
];

const statusLabels = {
  booking_confirmed: 'Booking Confirmed',
  cargo_received: 'Cargo Received',
  customs_export: 'Customs Export',
  departed_origin: 'Departed Origin',
  in_transit: 'In Transit',
  arrived_destination: 'Arrived at Destination',
  customs_clearance: 'Customs Clearance',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
};

const modeIcons = { sea: Ship, air: Plane, inland: Truck };

export default function TrackShipment() {
  const [trackingNum, setTrackingNum] = useState('');
  const [shipment, setShipment] = useState(null);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleTrack = async (e) => {
    e?.preventDefault();
    if (!trackingNum.trim()) return;
    setSearching(true);
    setNotFound(false);
    setShipment(null);

    const results = await base44.entities.Shipment.filter({ tracking_number: trackingNum.trim().toUpperCase() });
    if (results.length > 0) {
      setShipment(results[0]);
    } else {
      setNotFound(true);
    }
    setSearching(false);
  };

  const currentStatusIdx = shipment ? statusOrder.indexOf(shipment.status) : -1;
  const ModeIcon = shipment ? (modeIcons[shipment.mode] || Package) : Package;

  return (
    <div>
      <section className="relative py-24 bg-[#1A1A1A]">
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <span className="text-[#D50000] text-sm font-semibold uppercase tracking-widest">Shipment Tracking</span>
          <h1 className="text-4xl md:text-5xl font-black text-white mt-4">Track Your Shipment</h1>
          <p className="mt-4 text-white/60 max-w-md mx-auto">Enter your tracking number to get real-time shipment updates.</p>

          <form onSubmit={handleTrack} className="mt-10 max-w-xl mx-auto flex gap-3">
            <Input
              value={trackingNum}
              onChange={e => setTrackingNum(e.target.value)}
              placeholder="TF-YY-XXXXX"
              className="h-14 bg-white text-lg font-mono text-center"
            />
            <Button type="submit" disabled={searching} className="bg-[#D50000] hover:bg-[#B00000] h-14 px-8">
              <Search className="w-5 h-5 mr-2" />
              {searching ? 'Searching...' : 'Track'}
            </Button>
          </form>
        </div>
      </section>

      <section className="py-16 bg-white min-h-[40vh]">
        <div className="max-w-5xl mx-auto px-6">
          {notFound && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800">No shipment found</h3>
              <p className="text-gray-500 mt-2">Please check the tracking number and try again.</p>
            </motion.div>
          )}

          {shipment && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              {/* Header card */}
              <div className="bg-[#F2F2F2] rounded-2xl p-8">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Tracking Number</p>
                    <h2 className="text-2xl font-mono font-bold text-[#1A1A1A] mt-1">{shipment.tracking_number}</h2>
                    <div className="mt-3"><StatusBadge status={shipment.status} /></div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <ModeIcon className="w-8 h-8 text-[#D50000] mx-auto mb-1" />
                      <span className="capitalize font-medium">{shipment.mode}</span>
                    </div>
                    {shipment.eta && (
                      <div className="text-center">
                        <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                        <span className="font-medium">ETA: {format(new Date(shipment.eta), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#D50000]" />
                    <span className="font-semibold">{shipment.origin}</span>
                  </div>
                  <div className="flex-1 border-t-2 border-dashed border-gray-300" />
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span className="font-semibold">{shipment.destination}</span>
                  </div>
                </div>

                {shipment.vessel_flight_info && (
                  <p className="mt-4 text-sm text-gray-500">
                    <span className="font-medium">Vessel/Flight:</span> {shipment.vessel_flight_info}
                  </p>
                )}
              </div>

              {/* Timeline */}
              <div className="bg-white border rounded-2xl p-8">
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-8">Shipment Timeline</h3>
                <div className="space-y-0">
                  {statusOrder.map((st, idx) => {
                    const isCompleted = idx <= currentStatusIdx;
                    const isCurrent = idx === currentStatusIdx;
                    const historyEntry = shipment.status_history?.find(h => h.status === st);
                    return (
                      <div key={st} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                            isCurrent ? 'bg-[#D50000] border-[#D50000] text-white' :
                            isCompleted ? 'bg-green-500 border-green-500 text-white' :
                            'bg-white border-gray-200 text-gray-300'
                          }`}>
                            {isCompleted ? <Check className="w-4 h-4" /> : <span className="text-xs">{idx + 1}</span>}
                          </div>
                          {idx < statusOrder.length - 1 && (
                            <div className={`w-0.5 h-12 ${isCompleted ? 'bg-green-300' : 'bg-gray-200'}`} />
                          )}
                        </div>
                        <div className="pb-12">
                          <p className={`font-semibold text-sm ${isCompleted ? 'text-[#1A1A1A]' : 'text-gray-400'}`}>
                            {statusLabels[st]}
                          </p>
                          {historyEntry && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {historyEntry.timestamp && format(new Date(historyEntry.timestamp), 'MMM d, yyyy HH:mm')}
                              {historyEntry.note && ` — ${historyEntry.note}`}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Documents */}
              {shipment.document_urls?.length > 0 && (
                <div className="bg-white border rounded-2xl p-8">
                  <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Documents</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {shipment.document_urls.map((doc, i) => (
                      <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-[#F2F2F2] rounded-xl hover:bg-gray-200 transition-colors">
                        <FileText className="w-5 h-5 text-[#D50000]" />
                        <div>
                          <p className="font-medium text-sm">{doc.name || `Document ${i + 1}`}</p>
                          <p className="text-xs text-gray-500">{doc.type || 'Document'}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Operations Notes */}
              {shipment.operations_notes && (
                <div className="bg-white border rounded-2xl p-8">
                  <h3 className="text-lg font-bold text-[#1A1A1A] mb-3">Notes</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{shipment.operations_notes}</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}