import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import RFQTable from '../components/portal/RFQTable';
import RFQDetailModal from '../components/portal/RFQDetailModal';
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminRFQs() {
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const { data: rfqs = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-all-rfqs'],
    queryFn: () => base44.entities.RFQ.list('-created_date', 500),
  });

  let filtered = filter === 'all' ? rfqs : rfqs.filter(r => r.status === filter);
  if (search) {
    filtered = filtered.filter(r =>
      r.reference_number?.toLowerCase().includes(search.toLowerCase()) ||
      r.company_name?.toLowerCase().includes(search.toLowerCase())
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">All RFQs</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all quotation requests</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All ({rfqs.length})</TabsTrigger>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
          <TabsTrigger value="sales_review">Sales Review</TabsTrigger>
          <TabsTrigger value="pricing_review">Pricing</TabsTrigger>
          <TabsTrigger value="quoted">Quoted</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? <Skeleton className="h-48 rounded-2xl" /> : <RFQTable rfqs={filtered} onView={setSelectedRFQ} />}

      <RFQDetailModal rfq={selectedRFQ} open={!!selectedRFQ} onClose={() => setSelectedRFQ(null)} role="sales" onUpdate={refetch} />
    </div>
  );
}