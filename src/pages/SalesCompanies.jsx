import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Building2, Globe, Mail, Phone, Pencil, Trash2 } from 'lucide-react';
import CompanyModal from '../components/crm/CompanyModal';

const typeColors = {
  client: 'bg-green-100 text-green-700',
  prospect: 'bg-blue-100 text-blue-700',
  partner: 'bg-purple-100 text-purple-700',
  supplier: 'bg-orange-100 text-orange-700',
  agent: 'bg-yellow-100 text-yellow-700',
};

export default function SalesCompanies() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => base44.entities.Company.list('-created_date', 200),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => data.id
      ? base44.entities.Company.update(data.id, data)
      : base44.entities.Company.create(data),
    onSuccess: () => { qc.invalidateQueries(['companies']); setShowModal(false); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Company.delete(id),
    onSuccess: () => qc.invalidateQueries(['companies']),
  });

  const filtered = companies.filter(c => {
    const matchSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.country?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || c.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Company Database</h1>
          <p className="text-gray-500 text-sm mt-0.5">{companies.length} companies</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input className="pl-9 w-48" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
            <option value="all">All Types</option>
            <option value="client">Client</option>
            <option value="prospect">Prospect</option>
            <option value="partner">Partner</option>
            <option value="supplier">Supplier</option>
            <option value="agent">Agent</option>
          </select>
          <Button onClick={() => { setEditing(null); setShowModal(true); }} className="bg-[#D50000] hover:bg-[#B00000]">
            <Plus className="w-4 h-4 mr-1" /> Add Company
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No companies found.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(company => (
            <Card key={company.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {company.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-[#1A1A1A] text-sm leading-tight">{company.name}</p>
                      {company.industry && <p className="text-xs text-gray-500">{company.industry}</p>}
                    </div>
                  </div>
                  <Badge className={`${typeColors[company.type] || 'bg-gray-100 text-gray-600'} text-xs flex-shrink-0`}>{company.type}</Badge>
                </div>
                <div className="space-y-1 text-xs text-gray-600">
                  {company.country && <div className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> {company.city ? `${company.city}, ` : ''}{company.country}</div>}
                  {company.email && <div className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {company.email}</div>}
                  {company.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {company.phone}</div>}
                </div>
                {company.notes && <p className="text-xs text-gray-500 line-clamp-2">{company.notes}</p>}
                <div className="flex items-center gap-2 pt-1">
                  <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => { setEditing(company); setShowModal(true); }}>
                    <Pencil className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 hover:bg-red-50" onClick={() => deleteMutation.mutate(company.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <CompanyModal
          company={editing}
          onSave={(data) => saveMutation.mutate(data)}
          onClose={() => { setShowModal(false); setEditing(null); }}
        />
      )}
    </div>
  );
}