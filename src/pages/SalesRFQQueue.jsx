import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import RFQTable from '../components/portal/RFQTable';
import RFQDetailModal from '../components/portal/RFQDetailModal';
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export default function SalesRFQQueue() {
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [search, setSearch] = useState('');

  const { data: rfqs = [], isLoading, refetch } = useQuery({
    queryKey: ['sales-rfq-queue'],
    queryFn: () => base44.entities.RFQ.list('-created_date', 200),
  });

  const filtered = rfqs.filter(r =>
    r.reference_number?.toLowerCase().includes(search.toLowerCase()) ||
    r.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.origin?.toLowerCase().includes(search.toLowerCase()) ||
    r.destination?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">RFQ Queue</h1>
          <p className="text-gray-500 text-sm mt-1">All quotation requests</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {isLoading ? <Skeleton className="h-48 rounded-2xl" /> : <RFQTable rfqs={filtered} onView={setSelectedRFQ} />}

      <RFQDetailModal rfq={selectedRFQ} open={!!selectedRFQ} onClose={() => setSelectedRFQ(null)} role="sales" onUpdate={refetch} />
    </div>
  );
}