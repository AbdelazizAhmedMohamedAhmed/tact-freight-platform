import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import StatsCard from '../components/portal/StatsCard';
import ClientRFQCard from '../components/client/ClientRFQCard';
import ClientShipmentCard from '../components/client/ClientShipmentCard';
import RFQDetailModal from '../components/portal/RFQDetailModal';
import UploadDocumentModal from '../components/client/UploadDocumentModal';
import { Button } from "@/components/ui/button";
import { FileText, Ship, Truck, Plus, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [uploadEntity, setUploadEntity] = useState(null);
  const [uploadType, setUploadType] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: rfqs = [], isLoading: rfqLoading, refetch: refetchRFQs } = useQuery({
    queryKey: ['client-rfqs', user?.email],
    queryFn: () => base44.entities.RFQ.filter({ client_email: user.email }, '-created_date', 50),
    enabled: !!user?.email,
  });

  const { data: shipments = [], isLoading: shipLoading, refetch: refetchShipments } = useQuery({
    queryKey: ['client-shipments', user?.email],
    queryFn: () => base44.entities.Shipment.filter({ client_email: user.email }, '-created_date', 50),
    enabled: !!user?.email,
  });

  // Redirect to first active shipment if any exist
  useEffect(() => {
    if (shipments.length > 0 && !shipLoading) {
      const activeShipment = shipments.find(s => s.status !== 'delivered');
      if (activeShipment) {
        navigate(createPageUrl(`ClientShipments?ship=${activeShipment.id}`));
      }
    }
  }, [shipments, shipLoading, navigate]);

  if (!user) return <div className="flex items-center justify-center h-96"><Skeleton className="w-64 h-8" /></div>;

  const activeRFQs = rfqs.filter(r => !['accepted', 'rejected', 'cancelled', 'won', 'lost'].includes(r.status));
  const activeShipments = shipments.filter(s => s.status !== 'delivered');
  const pendingResponse = rfqs.filter(r => r.status === 'sent_to_client').length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Welcome, {user.full_name || 'Client'}</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your shipments and quotation requests</p>
        </div>
        <Link to={createPageUrl('RequestQuote')}>
          <Button className="bg-[#D50000] hover:bg-[#B00000]">
            <Plus className="w-4 h-4 mr-2" /> New RFQ
          </Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total RFQs" value={rfqs.length} icon={FileText} iconColor="text-blue-600" />
        <StatsCard title="Pending Response" value={pendingResponse} icon={Clock} iconColor="text-orange-600" />
        <StatsCard title="Active Shipments" value={activeShipments.length} icon={Truck} iconColor="text-purple-600" />
        <StatsCard title="Delivered" value={shipments.filter(s => s.status === 'delivered').length} icon={CheckCircle} iconColor="text-green-600" />
      </div>

      {/* Pending Actions Alert */}
      {pendingResponse > 0 && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-orange-600" />
            <div className="flex-1">
              <p className="font-semibold text-orange-900">Action Required</p>
              <p className="text-sm text-orange-700">You have {pendingResponse} quotation{pendingResponse !== 1 ? 's' : ''} awaiting your response</p>
            </div>
            <Link to={createPageUrl('ClientRFQs')}>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700">Review Now</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Recent RFQs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#1A1A1A]">Recent RFQs</h2>
          <Link to={createPageUrl('ClientRFQs')} className="text-[#D50000] text-sm font-medium flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {rfqLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rfqs.slice(0, 3).map(rfq => (
              <ClientRFQCard
                key={rfq.id}
                rfq={rfq}
                onViewDetails={() => setSelectedRFQ(rfq)}
                onUploadDocs={() => { setUploadEntity(rfq); setUploadType('rfq'); }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Shipments */}
      {shipments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1A1A1A]">Active Shipments</h2>
            <Link to={createPageUrl('ClientShipments')} className="text-[#D50000] text-sm font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {shipLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeShipments.slice(0, 3).map(shipment => (
                <ClientShipmentCard
                  key={shipment.id}
                  shipment={shipment}
                  onUploadDocs={() => { setUploadEntity(shipment); setUploadType('shipment'); }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <RFQDetailModal rfq={selectedRFQ} open={!!selectedRFQ} onClose={() => setSelectedRFQ(null)} role="client" onUpdate={refetchRFQs} />
      
      <UploadDocumentModal
        entity={uploadEntity}
        entityType={uploadType}
        open={!!uploadEntity}
        onClose={() => { setUploadEntity(null); setUploadType(null); }}
        onUpdate={() => {
          if (uploadType === 'rfq') refetchRFQs();
          else refetchShipments();
        }}
      />
    </div>
  );
}