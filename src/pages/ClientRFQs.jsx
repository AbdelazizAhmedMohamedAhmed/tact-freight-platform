import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import ClientRFQCard from '../components/client/ClientRFQCard';
import RFQDetailModal from '../components/portal/RFQDetailModal';
import UploadDocumentModal from '../components/client/UploadDocumentModal';
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { createPageUrl } from '../utils';

export default function ClientRFQs() {
  const [user, setUser] = useState(null);
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [uploadEntity, setUploadEntity] = useState(null);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">My RFQs</h1>
          <p className="text-gray-500 text-sm mt-1">View and manage all your quotation requests</p>
        </div>
        <Link to={createPageUrl('RequestQuote')}>
          <Button className="bg-[#D50000] hover:bg-[#B00000]">
            <Plus className="w-4 h-4 mr-2" /> New RFQ
          </Button>
        </Link>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({rfqs.length})</TabsTrigger>
          <TabsTrigger value="submitted">In Review</TabsTrigger>
          <TabsTrigger value="quoted">Quoted</TabsTrigger>
          <TabsTrigger value="sent_to_client">Pending Response</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="won">Won</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center">
          <p className="text-gray-500">No RFQs found in this category</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(rfq => (
            <ClientRFQCard
              key={rfq.id}
              rfq={rfq}
              onViewDetails={() => setSelectedRFQ(rfq)}
              onUploadDocs={() => setUploadEntity(rfq)}
            />
          ))}
        </div>
      )}

      <RFQDetailModal rfq={selectedRFQ} open={!!selectedRFQ} onClose={() => setSelectedRFQ(null)} role="client" onUpdate={refetch} />
      
      <UploadDocumentModal
        entity={uploadEntity}
        entityType="rfq"
        open={!!uploadEntity}
        onClose={() => setUploadEntity(null)}
        onUpdate={refetch}
      />
    </div>
  );
}