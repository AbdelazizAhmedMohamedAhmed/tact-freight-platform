import React from 'react';
import { format } from 'date-fns';
import { CheckCircle2, Clock } from 'lucide-react';

const statusSteps = [
  { key: 'booking_confirmed', label: 'Booking Confirmed' },
  { key: 'cargo_received', label: 'Cargo Received' },
  { key: 'export_clearance', label: 'Export Clearance' },
  { key: 'departed_origin', label: 'Departed' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'arrived_destination', label: 'Arrived' },
  { key: 'customs_clearance', label: 'Customs Clearance' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

export default function ShipmentTimeline({ shipment, showAllSteps = false }) {
  if (!shipment) return null;

  const statusHistory = shipment.status_history || [];
  const currentStatusIndex = statusSteps.findIndex(s => s.key === shipment.status);

  // Group history by status
  const historyByStatus = {};
  statusHistory.forEach(entry => {
    if (!historyByStatus[entry.status]) {
      historyByStatus[entry.status] = [];
    }
    historyByStatus[entry.status].push(entry);
  });

  const displaySteps = showAllSteps ? statusSteps : statusSteps.slice(0, currentStatusIndex + 1);

  return (
    <div className="space-y-6">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-3.5 top-8 bottom-0 w-0.5 bg-gray-200" />

        {/* Timeline steps */}
        <div className="space-y-6">
          {displaySteps.map((step, idx) => {
            const isCompleted = currentStatusIndex >= idx;
            const isCurrent = currentStatusIndex === idx;
            const history = historyByStatus[step.key] || [];
            const latestEntry = history[history.length - 1];

            return (
              <div key={step.key} className="relative pl-10">
                {/* Timeline dot */}
                <div
                  className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? 'bg-[#D50000] text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </div>

                {/* Content */}
                <div
                  className={`pb-4 ${
                    isCurrent
                      ? 'bg-blue-50 border border-blue-200 rounded-lg p-3'
                      : ''
                  }`}
                >
                  <h4
                    className={`font-semibold text-sm ${
                      isCompleted ? 'text-[#1A1A1A]' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                    {isCurrent && (
                      <span className="ml-2 inline-block px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                        Current
                      </span>
                    )}
                  </h4>

                  {latestEntry && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-600">
                        {format(
                          new Date(latestEntry.timestamp),
                          'MMM d, yyyy h:mm a'
                        )}
                      </p>
                      {latestEntry.updated_by && (
                        <p className="text-xs text-gray-500">
                          By: {latestEntry.updated_by}
                        </p>
                      )}
                      {latestEntry.note && (
                        <p className="text-xs text-gray-600 mt-2 bg-white/50 p-2 rounded">
                          {latestEntry.note}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full history log */}
      {statusHistory.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-3">Full Status History</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {statusHistory.map((entry, idx) => (
              <div
                key={idx}
                className="text-xs bg-white rounded p-2 border-l-2 border-[#D50000]"
              >
                <div className="flex items-start justify-between">
                  <span className="font-medium text-gray-900">
                    {statusSteps.find(s => s.key === entry.status)?.label ||
                      entry.status}
                  </span>
                  <span className="text-gray-500">
                    {format(new Date(entry.timestamp), 'MMM d, h:mm a')}
                  </span>
                </div>
                {entry.updated_by && (
                  <p className="text-gray-600">By: {entry.updated_by}</p>
                )}
                {entry.note && (
                  <p className="text-gray-600 mt-1 italic">{entry.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}