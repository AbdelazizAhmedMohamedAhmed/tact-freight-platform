import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PartnerModal({ partner, onSave, onClose }) {
  const [form, setForm] = useState({
    company_name: partner?.company_name || '',
    type: partner?.type || 'agent',
    region: partner?.region || '',
    country: partner?.country || '',
    contact_person: partner?.contact_person || '',
    email: partner?.email || '',
    phone: partner?.phone || '',
    status: partner?.status || 'active',
    rating: partner?.rating || '',
    notes: partner?.notes || '',
    contract_url: partner?.contract_url || '',
    modes: partner?.modes || [],
    services: partner?.services || [],
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const toggleMode = (m) => {
    setForm(p => ({
      ...p,
      modes: p.modes.includes(m) ? p.modes.filter(x => x !== m) : [...p.modes, m]
    }));
  };

  const handleSave = () => {
    if (!form.company_name) return;
    onSave({ ...form, ...(partner?.id ? { id: partner.id } : {}), rating: form.rating ? parseInt(form.rating) : undefined });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{partner ? 'Edit Partner' : 'New Partner / Agent'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <Label>Company Name <span className="text-red-500">*</span></Label>
              <Input value={form.company_name} onChange={e => set('company_name', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => set('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['agent','supplier','co-loader','customs_broker','trucking','warehouse','other'].map(t => (
                    <SelectItem key={t} value={t}>{t.replace('_',' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => set('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Region</Label>
              <Input value={form.region} onChange={e => set('region', e.target.value)} placeholder="e.g. Middle East, Europe" />
            </div>
            <div className="space-y-1">
              <Label>Country</Label>
              <Input value={form.country} onChange={e => set('country', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Contact Person</Label>
              <Input value={form.contact_person} onChange={e => set('contact_person', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Rating (1–5)</Label>
              <Select value={String(form.rating)} onValueChange={v => set('rating', v)}>
                <SelectTrigger><SelectValue placeholder="Select rating" /></SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5].map(r => <SelectItem key={r} value={String(r)}>{'★'.repeat(r)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Modes Covered</Label>
              <div className="flex gap-3">
                {['sea','air','inland'].map(m => (
                  <label key={m} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.modes.includes(m)} onChange={() => toggleMode(m)} className="accent-[#D50000]" />
                    <span className="text-sm capitalize">{m}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Contract URL</Label>
              <Input value={form.contract_url} onChange={e => set('contract_url', e.target.value)} placeholder="https://..." />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} className="bg-[#D50000] hover:bg-[#B00000]">
              {partner ? 'Save Changes' : 'Add Partner'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}