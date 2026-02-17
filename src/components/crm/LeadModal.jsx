import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LeadModal({ lead, onSave, onClose }) {
  const [form, setForm] = useState({
    company_name: lead?.company_name || '',
    contact_person: lead?.contact_person || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    country: lead?.country || '',
    industry: lead?.industry || '',
    source: lead?.source || 'website',
    stage: lead?.stage || 'new',
    value_usd: lead?.value_usd || '',
    notes: lead?.notes || '',
    assigned_to_name: lead?.assigned_to_name || '',
    assigned_to: lead?.assigned_to || '',
    follow_up_date: lead?.follow_up_date || '',
    lost_reason: lead?.lost_reason || '',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.company_name || !form.contact_person || !form.email) return;
    onSave({ ...form, ...(lead?.id ? { id: lead.id } : {}), value_usd: form.value_usd ? parseFloat(form.value_usd) : undefined });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lead ? 'Edit Lead' : 'New Lead'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <Label>Company Name <span className="text-red-500">*</span></Label>
              <Input value={form.company_name} onChange={e => set('company_name', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Contact Person <span className="text-red-500">*</span></Label>
              <Input value={form.contact_person} onChange={e => set('contact_person', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Email <span className="text-red-500">*</span></Label>
              <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Country</Label>
              <Input value={form.country} onChange={e => set('country', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Industry</Label>
              <Input value={form.industry} onChange={e => set('industry', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Source</Label>
              <Select value={form.source} onValueChange={v => set('source', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['website','referral','cold_call','linkedin','exhibition','other'].map(s => (
                    <SelectItem key={s} value={s}>{s.replace('_',' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Stage</Label>
              <Select value={form.stage} onValueChange={v => set('stage', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['new','contacted','qualified','proposal_sent','won','lost'].map(s => (
                    <SelectItem key={s} value={s}>{s.replace('_',' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Estimated Value (USD)</Label>
              <Input type="number" value={form.value_usd} onChange={e => set('value_usd', e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1">
              <Label>Follow-up Date</Label>
              <Input type="date" value={form.follow_up_date} onChange={e => set('follow_up_date', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Assigned To (Name)</Label>
              <Input value={form.assigned_to_name} onChange={e => set('assigned_to_name', e.target.value)} placeholder="Sales rep name" />
            </div>
            <div className="space-y-1">
              <Label>Assigned To (Email)</Label>
              <Input value={form.assigned_to} onChange={e => set('assigned_to', e.target.value)} placeholder="rep@company.com" />
            </div>
            {form.stage === 'lost' && (
              <div className="col-span-2 space-y-1">
                <Label>Lost Reason</Label>
                <Input value={form.lost_reason} onChange={e => set('lost_reason', e.target.value)} placeholder="Why was this lead lost?" />
              </div>
            )}
            <div className="col-span-2 space-y-1">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="Add notes..." />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} className="bg-[#D50000] hover:bg-[#B00000]">
              {lead ? 'Save Changes' : 'Create Lead'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}