import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CompanyModal({ company, onSave, onClose }) {
  const [form, setForm] = useState({
    name: company?.name || '',
    industry: company?.industry || '',
    type: company?.type || 'prospect',
    country: company?.country || '',
    city: company?.city || '',
    website: company?.website || '',
    phone: company?.phone || '',
    email: company?.email || '',
    address: company?.address || '',
    account_manager: company?.account_manager || '',
    annual_revenue_usd: company?.annual_revenue_usd || '',
    notes: company?.notes || '',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.name) return;
    onSave({ ...form, ...(company?.id ? { id: company.id } : {}), annual_revenue_usd: form.annual_revenue_usd ? parseFloat(form.annual_revenue_usd) : undefined });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{company ? 'Edit Company' : 'New Company'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <Label>Company Name <span className="text-red-500">*</span></Label>
              <Input value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => set('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['client','prospect','partner','supplier','agent'].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Industry</Label>
              <Input value={form.industry} onChange={e => set('industry', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Country</Label>
              <Input value={form.country} onChange={e => set('country', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>City</Label>
              <Input value={form.city} onChange={e => set('city', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Website</Label>
              <Input value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Address</Label>
              <Input value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Account Manager</Label>
              <Input value={form.account_manager} onChange={e => set('account_manager', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Annual Revenue (USD)</Label>
              <Input type="number" value={form.annual_revenue_usd} onChange={e => set('annual_revenue_usd', e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} className="bg-[#D50000] hover:bg-[#B00000]">
              {company ? 'Save Changes' : 'Create Company'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}