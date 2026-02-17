import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Star, Globe, Mail, Phone, Pencil, Trash2, Ship, Plane, Truck } from 'lucide-react';
import PartnerModal from '../components/bizdev/PartnerModal';

const typeColors = {
  agent: 'bg-blue-100 text-blue-700',
  supplier: 'bg-orange-100 text-orange-700',
  'co-loader': 'bg-purple-100 text-purple-700',
  customs_broker: 'bg-green-100 text-green-700',
  trucking: 'bg-yellow-100 text-yellow-700',
  warehouse: 'bg-pink-100 text-pink-700',
  other: 'bg-gray-100 text-gray-600',
};

const modeIcons = { sea: Ship, air: Plane, inland: Truck };

export default function BizDevPartners() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['partners'],
    queryFn: () => base44.entities.Partner.list('-created_date', 200),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => data.id
      ? base44.entities.Partner.update(data.id, data)
      : base44.entities.Partner.create(data),
    onSuccess: () => { qc.invalidateQueries(['partners']); setShowModal(false); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Partner.delete(id),
    onSuccess: () => qc.invalidateQueries(['partners']),
  });

  const filtered = partners.filter(p => {
    const matchSearch = !search || p.company_name?.toLowerCase().includes(search.toLowerCase()) || p.region?.toLowerCase().includes(search.toLowerCase()) || p.country?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || p.type === filterType;
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const renderStars = (rating) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-0.5">
        {[1,2,3,4,5].map(i => (
          <Star key={i} className={`w-3 h-3 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Partners & Agents</h1>
          <p className="text-gray-500 text-sm mt-0.5">{partners.length} total · {partners.filter(p => p.status === 'active').length} active</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input className="pl-9 w-48" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
            <option value="all">All Types</option>
            <option value="agent">Agent</option>
            <option value="supplier">Supplier</option>
            <option value="co-loader">Co-loader</option>
            <option value="customs_broker">Customs Broker</option>
            <option value="trucking">Trucking</option>
            <option value="warehouse">Warehouse</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
          <Button onClick={() => { setEditing(null); setShowModal(true); }} className="bg-[#D50000] hover:bg-[#B00000]">
            <Plus className="w-4 h-4 mr-1" /> Add Partner
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No partners found.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(partner => (
            <Card key={partner.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[#1A1A1A] text-sm">{partner.company_name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge className={`${typeColors[partner.type] || 'bg-gray-100 text-gray-600'} text-xs`}>{partner.type?.replace('_', ' ')}</Badge>
                      <Badge className={`text-xs ${partner.status === 'active' ? 'bg-green-100 text-green-700' : partner.status === 'inactive' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{partner.status}</Badge>
                    </div>
                  </div>
                  {renderStars(partner.rating)}
                </div>

                <div className="space-y-1 text-xs text-gray-600">
                  {(partner.region || partner.country) && <div className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> {[partner.region, partner.country].filter(Boolean).join(' · ')}</div>}
                  {partner.contact_person && <div className="flex items-center gap-1.5"><span className="w-3 h-3 flex items-center justify-center font-bold">👤</span> {partner.contact_person}</div>}
                  {partner.email && <div className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {partner.email}</div>}
                  {partner.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {partner.phone}</div>}
                </div>

                {partner.modes?.length > 0 && (
                  <div className="flex gap-2">
                    {partner.modes.map(m => {
                      const Icon = modeIcons[m];
                      return Icon ? <div key={m} title={m} className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center"><Icon className="w-3 h-3 text-gray-600" /></div> : null;
                    })}
                  </div>
                )}

                {partner.notes && <p className="text-xs text-gray-500 line-clamp-2">{partner.notes}</p>}

                <div className="flex items-center gap-2 pt-1">
                  <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => { setEditing(partner); setShowModal(true); }}>
                    <Pencil className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 hover:bg-red-50" onClick={() => deleteMutation.mutate(partner.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <PartnerModal
          partner={editing}
          onSave={(data) => saveMutation.mutate(data)}
          onClose={() => { setShowModal(false); setEditing(null); }}
        />
      )}
    </div>
  );
}