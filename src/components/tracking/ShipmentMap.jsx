import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Ship, MapPin, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Location coordinates database (simplified for demo)
const locationCoords = {
  'Cairo, Egypt': [30.0444, 31.2357],
  'Alexandria, Egypt': [31.2001, 29.9187],
  'Dubai, UAE': [25.2048, 55.2708],
  'Jeddah, Saudi Arabia': [21.5433, 39.1728],
  'Shanghai, China': [31.2304, 121.4737],
  'Rotterdam, Netherlands': [51.9244, 4.4777],
  'Hamburg, Germany': [53.5511, 9.9937],
  'Singapore': [1.3521, 103.8198],
  'Los Angeles, USA': [34.0522, -118.2437],
  'New York, USA': [40.7128, -74.0060],
};

const getCoordinates = (location) => {
  const exactMatch = locationCoords[location];
  if (exactMatch) return exactMatch;
  
  // Try to find partial match
  for (const [key, coords] of Object.entries(locationCoords)) {
    if (location.includes(key.split(',')[0]) || key.includes(location.split(',')[0])) {
      return coords;
    }
  }
  
  // Default fallback
  return [30.0444, 31.2357];
};

const getCurrentPosition = (originCoords, destCoords, progress) => {
  const lat = originCoords[0] + (destCoords[0] - originCoords[0]) * progress;
  const lng = originCoords[1] + (destCoords[1] - originCoords[1]) * progress;
  return [lat, lng];
};

const statusProgress = {
  booking_confirmed: 0,
  cargo_received: 0.1,
  customs_export: 0.2,
  departed_origin: 0.3,
  in_transit: 0.5,
  arrived_destination: 0.7,
  customs_clearance: 0.8,
  out_for_delivery: 0.9,
  delivered: 1.0,
};

export default function ShipmentMap({ shipment }) {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Ensure Leaflet icons work properly
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
    setMapReady(true);
  }, []);

  if (!mapReady) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-2xl flex items-center justify-center">
        <p className="text-gray-400">Loading map...</p>
      </div>
    );
  }

  const originCoords = getCoordinates(shipment.origin);
  const destCoords = getCoordinates(shipment.destination);
  const progress = statusProgress[shipment.status] || 0;
  const currentCoords = getCurrentPosition(originCoords, destCoords, progress);
  const center = [(originCoords[0] + destCoords[0]) / 2, (originCoords[1] + destCoords[1]) / 2];

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-lg border-2 border-gray-200">
      <MapContainer
        center={center}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Route line */}
        <Polyline 
          positions={[originCoords, destCoords]} 
          color="#D50000" 
          weight={3}
          opacity={0.6}
          dashArray="10, 10"
        />

        {/* Origin marker */}
        <Marker position={originCoords}>
          <Popup>
            <div className="text-center p-2">
              <MapPin className="w-5 h-5 text-[#D50000] mx-auto mb-1" />
              <p className="font-bold text-sm">Origin</p>
              <p className="text-xs text-gray-600">{shipment.origin}</p>
            </div>
          </Popup>
        </Marker>

        {/* Destination marker */}
        <Marker position={destCoords}>
          <Popup>
            <div className="text-center p-2">
              <Navigation className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="font-bold text-sm">Destination</p>
              <p className="text-xs text-gray-600">{shipment.destination}</p>
            </div>
          </Popup>
        </Marker>

        {/* Current position marker (if in transit) */}
        {progress > 0 && progress < 1 && (
          <Marker position={currentCoords}>
            <Popup>
              <div className="text-center p-2">
                <Ship className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="font-bold text-sm">Current Position</p>
                <p className="text-xs text-gray-600 capitalize">{shipment.status.replace(/_/g, ' ')}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}