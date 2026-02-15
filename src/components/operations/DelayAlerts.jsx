import React from 'react';
import { AlertTriangle, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DelayAlerts({ shipments }) {
  const delays = shipments.filter(s => {
    if (!s.eta) return false;
    const etaDate = new Date(s.eta);
    const today = new Date();
    const daysUntilETA = Math.floor((etaDate - today) / (1000 * 60 * 60 * 24));
    
    return daysUntilETA <= 1 && !['delivered', 'out_for_delivery'].includes(s.status);
  });

  const atCustoms = shipments.filter(s => s.status === 'customs_clearance');

  if (delays.length === 0 && atCustoms.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {delays.map((ship, i) => (
        <motion.div
          key={ship.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-900 text-sm">{ship.tracking_number}</p>
              <p className="text-red-700 text-sm mt-1">
                <Clock className="w-3 h-3 inline mr-1" />
                ETA: {new Date(ship.eta).toLocaleDateString()}
              </p>
              <p className="text-red-700 text-sm mt-0.5">
                <MapPin className="w-3 h-3 inline mr-1" />
                {ship.origin} → {ship.destination}
              </p>
            </div>
          </div>
        </motion.div>
      ))}

      {atCustoms.map((ship, i) => (
        <motion.div
          key={ship.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (delays.length + i) * 0.1 }}
          className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-orange-900 text-sm">{ship.tracking_number}</p>
              <p className="text-orange-700 text-sm mt-1">Pending customs clearance in {ship.destination}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}