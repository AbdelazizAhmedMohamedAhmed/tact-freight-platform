import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import StatsCard from '../components/portal/StatsCard';
import RFQTable from '../components/portal/RFQTable';
import RFQDetailModal from '../components/portal/RFQDetailModal';
import { Button } from "@/components/ui/button";
import { FileText, Ship, Truck, Plus, ArrowRight } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientDashboard() {
  const [user, setUser] = useState(null);
  const [selectedRFQ, setSelectedRFQ] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: rfqs = [], isLoading: rfqLoading, refetch: refetchRFQs } = useQuery({
    queryKey: ['client-rfqs', user?.email],
    queryFn: () => base44.entities.RFQ.filter({ client_email: user.email }, '-created_date', 50),
    enabled: !!user?.email,
  });

  const { data: shipments = [], isLoading: shipLoading } = useQuery({
    queryKey: ['client-shipments', user?.email],
    queryFn: () => base44.entities.Shipment.filter({ client_email: user.email }, '-created_date', 50),
    enabled: !!user?.email,
  });

  if (!user) return <div className="flex items-center justify-center h-96"><Skeleton className="w-64 h-8" /></div>;

  const activeRFQs = rfqs.filter(r => !['accepted', 'rejected', 'cancelled'].includes(r.status));
  const activeShipments = shipments.filter(s => s.status !== 'delivered');

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
        <StatsCard title="Total RFQs" value={rfqs.length} icon={FileText} />
        <StatsCard title="Active RFQs" value={activeRFQs.length} icon={FileText} />
        <StatsCard title="Total Shipments" value={shipments.length} icon={Ship} />
        <StatsCard title="In Transit" value={activeShipments.length} icon={Truck} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#1A1A1A]">Recent RFQs</h2>
          <Link to={createPageUrl('ClientRFQs')} className="text-[#D50000] text-sm font-medium flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {rfqLoading ? <Skeleton className="h-48 rounded-2xl" /> : (
          <RFQTable rfqs={rfqs.slice(0, 5)} onView={setSelectedRFQ} />
        )}
      </div>

      <RFQDetailModal rfq={selectedRFQ} open={!!selectedRFQ} onClose={() => setSelectedRFQ(null)} role="client" onUpdate={refetchRFQs} />
    </div>
  );
}