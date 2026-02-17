import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import ClientShipmentCard from '../components/client/ClientShipmentCard';
import UploadDocumentModal from '../components/client/UploadDocumentModal';
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ClientShipments() {
  const [user, setUser] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [uploadEntity, setUploadEntity] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setCompanyId(u.company_id || null);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: shipments = [], isLoading, refetch } = useQuery({
    queryKey: ['client-shipments-all', companyId, user?.email],
    queryFn: () => companyId
      ? base44.entities.Shipment.filter({ company_id: companyId }, '-created_date', 100)
      : base44.entities.Shipment.filter({ client_email: user.email }, '-created_date', 100),
    enabled: !!user,
  });

  const filtered = filter === 'all' ? shipments : 
    filter === 'active' ? shipments.filter(s => s.status !== 'delivered') :
    shipments.filter(s => s.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">My Shipments</h1>
        <p className="text-gray-500 text-sm mt-1">Track and monitor all your shipments</p>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({shipments.length})</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="in_transit">In Transit</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center">
          <p className="text-gray-500">No shipments found in this category</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(shipment => (
            <ClientShipmentCard
              key={shipment.id}
              shipment={shipment}
              onUploadDocs={() => setUploadEntity(shipment)}
            />
          ))}
        </div>
      )}

      <UploadDocumentModal
        entity={uploadEntity}
        entityType="shipment"
        open={!!uploadEntity}
        onClose={() => setUploadEntity(null)}
        onUpdate={refetch}
      />
    </div>
  );
}