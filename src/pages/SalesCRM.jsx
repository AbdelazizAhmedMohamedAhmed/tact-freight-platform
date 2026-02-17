import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter } from 'lucide-react';
import LeadKanban from '../components/crm/LeadKanban';
import LeadModal from '../components/crm/LeadModal';
import LeadTable from '../components/crm/LeadTable';

const STAGES = ['new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost'];

export default function SalesCRM() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [view, setView] = useState('kanban');
  const [editingLead, setEditingLead] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list('-created_date', 200),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => data.id
      ? base44.entities.Lead.update(data.id, data)
      : base44.entities.Lead.create(data),
    onSuccess: () => { qc.invalidateQueries(['leads']); setShowModal(false); setEditingLead(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Lead.delete(id),
    onSuccess: () => qc.invalidateQueries(['leads']),
  });

  const updateStage = useMutation({
    mutationFn: ({ id, stage }) => base44.entities.Lead.update(id, { stage }),
    onSuccess: () => qc.invalidateQueries(['leads']),
  });

  const filtered = leads.filter(l =>
    !search ||
    l.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.contact_person?.toLowerCase().includes(search.toLowerCase()) ||
    l.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => { setEditingLead(null); setShowModal(true); };
  const openEdit = (lead) => { setEditingLead(lead); setShowModal(true); };

  const stageCounts = STAGES.reduce((acc, s) => {
    acc[s] = leads.filter(l => l.stage === s).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">CRM — Leads Pipeline</h1>
          <p className="text-gray-500 text-sm mt-0.5">{leads.length} total leads · {stageCounts.won || 0} won · {stageCounts.lost || 0} lost</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input className="pl-9 w-56" placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex rounded-lg border overflow-hidden">
            <button onClick={() => setView('kanban')} className={`px-3 py-1.5 text-sm font-medium ${view === 'kanban' ? 'bg-[#1A1A1A] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Board</button>
            <button onClick={() => setView('table')} className={`px-3 py-1.5 text-sm font-medium ${view === 'table' ? 'bg-[#1A1A1A] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Table</button>
          </div>
          <Button onClick={openNew} className="bg-[#D50000] hover:bg-[#B00000]">
            <Plus className="w-4 h-4 mr-1" /> New Lead
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Loading leads...</div>
      ) : view === 'kanban' ? (
        <LeadKanban leads={filtered} onEdit={openEdit} onStageChange={(id, stage) => updateStage.mutate({ id, stage })} />
      ) : (
        <LeadTable leads={filtered} onEdit={openEdit} onDelete={(id) => deleteMutation.mutate(id)} />
      )}

      {showModal && (
        <LeadModal
          lead={editingLead}
          onSave={(data) => saveMutation.mutate(data)}
          onClose={() => { setShowModal(false); setEditingLead(null); }}
        />
      )}
    </div>
  );
}