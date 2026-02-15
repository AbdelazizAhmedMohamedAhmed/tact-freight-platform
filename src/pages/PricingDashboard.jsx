import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import StatsCard from '../components/portal/StatsCard';
import RFQTable from '../components/portal/RFQTable';
import RFQDetailModal from '../components/portal/RFQDetailModal';
import { DollarSign, Clock, CheckCircle2, FileText } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export default function PricingDashboard() {
  const [selectedRFQ, setSelectedRFQ] = useState(null);

  const { data: rfqs = [], isLoading, refetch } = useQuery({
    queryKey: ['pricing-rfqs'],
    queryFn: () => base44.entities.RFQ.list('-created_date', 100),
  });

  const pendingPricing = rfqs.filter(r => r.status === 'pricing_review');
  const quoted = rfqs.filter(r => r.status === 'quoted');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Pricing Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Prepare and submit quotations</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatsCard title="Pending Pricing" value={pendingPricing.length} icon={Clock} />
        <StatsCard title="Quoted" value={quoted.length} icon={DollarSign} />
        <StatsCard title="Total RFQs" value={rfqs.length} icon={FileText} />
      </div>

      <div>
        <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Pending Pricing ({pendingPricing.length})</h2>
        {isLoading ? <Skeleton className="h-48 rounded-2xl" /> : <RFQTable rfqs={pendingPricing} onView={setSelectedRFQ} />}
      </div>

      <RFQDetailModal rfq={selectedRFQ} open={!!selectedRFQ} onClose={() => setSelectedRFQ(null)} role="pricing" onUpdate={refetch} />
    </div>
  );
}