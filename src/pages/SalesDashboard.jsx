import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import StatsCard from '../components/portal/StatsCard';
import RFQTable from '../components/portal/RFQTable';
import RFQDetailModal from '../components/portal/RFQDetailModal';
import { FileText, Clock, DollarSign, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function SalesDashboard() {
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [filter, setFilter] = useState('all');

  const { data: rfqs = [], isLoading, refetch } = useQuery({
    queryKey: ['sales-rfqs'],
    queryFn: () => base44.entities.RFQ.list('-created_date', 100),
  });

  const submitted = rfqs.filter(r => r.status === 'submitted');
  const inReview = rfqs.filter(r => ['sales_review', 'pricing_review'].includes(r.status));
  const quoted = rfqs.filter(r => r.status === 'quoted');
  const accepted = rfqs.filter(r => r.status === 'accepted');

  const filtered = filter === 'all' ? rfqs :
    filter === 'new' ? submitted :
    filter === 'review' ? inReview :
    filter === 'quoted' ? quoted : rfqs;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Sales Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Review and manage incoming RFQs</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="New RFQs" value={submitted.length} icon={FileText} />
        <StatsCard title="In Review" value={inReview.length} icon={Clock} />
        <StatsCard title="Quoted" value={quoted.length} icon={DollarSign} />
        <StatsCard title="Accepted" value={accepted.length} icon={CheckCircle2} />
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({rfqs.length})</TabsTrigger>
          <TabsTrigger value="new">New ({submitted.length})</TabsTrigger>
          <TabsTrigger value="review">In Review ({inReview.length})</TabsTrigger>
          <TabsTrigger value="quoted">Quoted ({quoted.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? <Skeleton className="h-48 rounded-2xl" /> : <RFQTable rfqs={filtered} onView={setSelectedRFQ} />}

      <RFQDetailModal rfq={selectedRFQ} open={!!selectedRFQ} onClose={() => setSelectedRFQ(null)} role="sales" onUpdate={refetch} />
    </div>
  );
}