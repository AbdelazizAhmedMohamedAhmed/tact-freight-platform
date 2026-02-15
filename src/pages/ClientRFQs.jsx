import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import RFQTable from '../components/portal/RFQTable';
import RFQDetailModal from '../components/portal/RFQDetailModal';
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ClientRFQs() {
  const [user, setUser] = useState(null);
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: rfqs = [], isLoading, refetch } = useQuery({
    queryKey: ['client-rfqs-all', user?.email],
    queryFn: () => base44.entities.RFQ.filter({ client_email: user.email }, '-created_date', 100),
    enabled: !!user?.email,
  });

  const filtered = filter === 'all' ? rfqs : rfqs.filter(r => r.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">My RFQs</h1>
        <p className="text-gray-500 text-sm mt-1">View and manage all your quotation requests</p>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({rfqs.length})</TabsTrigger>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
          <TabsTrigger value="quoted">Quoted</TabsTrigger>
          <TabsTrigger value="sent_to_client">Pending Response</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? <Skeleton className="h-48 rounded-2xl" /> : <RFQTable rfqs={filtered} onView={setSelectedRFQ} />}

      <RFQDetailModal rfq={selectedRFQ} open={!!selectedRFQ} onClose={() => setSelectedRFQ(null)} role="client" onUpdate={refetch} />
    </div>
  );
}