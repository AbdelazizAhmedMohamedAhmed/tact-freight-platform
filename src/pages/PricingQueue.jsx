import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import RFQTable from '../components/portal/RFQTable';
import RFQDetailModal from '../components/portal/RFQDetailModal';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function PricingQueue() {
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [filter, setFilter] = useState('pricing_review');

  const { data: rfqs = [], isLoading, refetch } = useQuery({
    queryKey: ['pricing-queue'],
    queryFn: () => base44.entities.RFQ.list('-created_date', 200),
  });

  const filtered = filter === 'all' ? rfqs : rfqs.filter(r => r.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Pricing Queue</h1>
        <p className="text-gray-500 text-sm mt-1">All RFQs requiring pricing</p>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="pricing_review">Pending</TabsTrigger>
          <TabsTrigger value="quoted">Quoted</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? <Skeleton className="h-48 rounded-2xl" /> : <RFQTable rfqs={filtered} onView={setSelectedRFQ} />}

      <RFQDetailModal rfq={selectedRFQ} open={!!selectedRFQ} onClose={() => setSelectedRFQ(null)} role="pricing" onUpdate={refetch} />
    </div>
  );
}