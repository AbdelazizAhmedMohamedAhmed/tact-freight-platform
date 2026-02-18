import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Loader2, Search, Ship, Plane, Truck, AlertCircle } from 'lucide-react';
import StatusBadge from '../components/shared/StatusBadge';
import { format } from 'date-fns';

const modeIcons = { sea: Ship, air: Plane, inland: Truck };

const statusGroups = {
  active: ['booking_confirmed', 'cargo_received', 'export_clearance', 'departed_origin', 'in_transit', 'arrived_destination', 'customs_clearance', 'out_for_delivery'],
  delivered: ['delivered'],
  all: [],
};

export default function OperationsShipments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [selectedShipmentId, setSelectedShipmentId] = useState(null);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const userRole = user?.department || user?.role || 'user';

  const isClient = userRole === 'client';

  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ['operations_shipments'],
    queryFn: () => base44.entities.Shipment.list('-created_date', 100),
  });

  const selectedShipment = shipments.find(s => s.id === selectedShipmentId);

  const filteredShipments = shipments.filter(s => {
    const matchesSearch = !searchTerm || 
      s.tracking_number.includes(searchTerm) || 
      s.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && statusGroups[activeTab].includes(s.status);
  });

  const activeCounts = {
    active: shipments.filter(s => statusGroups.active.includes(s.status)).length,
    delivered: shipments.filter(s => s.status === 'delivered').length,
    all: shipments.length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Operations Shipments</h1>
          <p className="text-sm text-gray-600 mt-1">Manage and track all shipments</p>
        </div>
        <Link to={createPageUrl('CreateShipment')}>
          <Button className="bg-[#D50000] hover:bg-[#B00000]">
            + New Shipment
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search by tracking number or company..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">
            Active {activeCounts.active > 0 && <span className="ml-2 bg-[#D50000] text-white text-xs px-2 py-0.5 rounded-full">{activeCounts.active}</span>}
          </TabsTrigger>
          <TabsTrigger value="delivered">
            Delivered {activeCounts.delivered > 0 && <span className="ml-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">{activeCounts.delivered}</span>}
          </TabsTrigger>
          <TabsTrigger value="all">
            All {activeCounts.all > 0 && <span className="ml-2 bg-gray-600 text-white text-xs px-2 py-0.5 rounded-full">{activeCounts.all}</span>}
          </TabsTrigger>
        </TabsList>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#D50000]" />
          </div>
        ) : filteredShipments.length === 0 ? (
          <Card className="bg-gray-50">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">No shipments found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filteredShipments.map(shipment => {
              const ModeIcon = modeIcons[shipment.mode] || Ship;
              return (
                <div
                   key={shipment.id}
                   onClick={() => userRole === 'admin' && setSelectedShipmentId(shipment.id)}
                 >
                   <Link
                     to={userRole === 'admin' ? '#' : createPageUrl(`OperationsShipmentDetail?id=${shipment.id}`)}
                   >
                     <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono font-semibold text-[#D50000] text-lg">
                              {shipment.tracking_number}
                            </span>
                            <StatusBadge status={shipment.status} />
                          </div>
                          <p className="text-sm text-gray-600">
                            {shipment.company_name}
                          </p>
                        </div>
                        <ModeIcon className="w-6 h-6 text-[#D50000] flex-shrink-0" />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs">Route</p>
                          <p className="font-medium">{shipment.origin} → {shipment.destination}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">BL/AWB</p>
                          <p className="font-medium">{shipment.bl_number || 'Pending'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Weight</p>
                          <p className="font-medium">
                            {shipment.actual_weight_kg || shipment.weight_kg || 'N/A'} KG
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Updated</p>
                          <p className="font-medium">
                            {format(new Date(shipment.updated_date), 'MMM d')}
                          </p>
                        </div>
                      </div>

                      {/* ETA Info */}
                      {shipment.eta && (
                        <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 text-xs">
                          <p className="text-blue-900">
                            ETA: <span className="font-semibold">{format(new Date(shipment.eta), 'MMM d, yyyy')}</span>
                          </p>
                        </div>
                      )}
                      </CardContent>
                      </Card>
                      </Link>
                      </div>
                      );
                      })}
                      </div>
                      )}
                      </Tabs>

                      {/* Admin Shipment Detail Modal */}
                      {userRole === 'admin' && selectedShipmentId && selectedShipment && (
                      <div 
                      className="fixed inset-0 bg-black/50 z-50 overflow-auto"
                      onClick={() => setSelectedShipmentId(null)}
                      >
                      <div 
                      className="min-h-screen w-full max-w-6xl mx-auto p-4 py-8"
                      onClick={e => e.stopPropagation()}
                      >
                      <div className="bg-white rounded-2xl shadow-2xl">
                      <div className="p-6 border-b flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-[#1A1A1A]">{selectedShipment.tracking_number}</h2>
                      <Button 
                      variant="ghost" 
                      onClick={() => setSelectedShipmentId(null)}
                      className="text-gray-500 hover:text-gray-700"
                      >
                      ✕
                      </Button>
                      </div>
                      <div className="p-6">
                      <iframe 
                      src={createPageUrl(`OperationsShipmentDetail?id=${selectedShipmentId}`)}
                      className="w-full h-[calc(100vh-200px)] border-0 rounded-lg"
                      title="Shipment Details"
                      />
                      </div>
                      </div>
                      </div>
                      </div>
                      )}
                      </div>
                      );
                      }