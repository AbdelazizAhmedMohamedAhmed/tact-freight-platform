import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from '@/api/base44Client';
import { logActivity } from '@/components/utils/activityLogger';

export default function ClientManagementModal({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    industry: '',
    country: '',
    city: '',
    address: '',
    phone: '',
    website: '',
    email: '',
  });

  const handleSubmit = async () => {
    if (!form.name || !form.email) return;
    setLoading(true);
    try {
      const company = await base44.entities.ClientCompany.create({
        name: form.name,
        industry: form.industry,
        country: form.country,
        city: form.city,
        address: form.address,
        phone: form.phone,
        website: form.website,
        primary_contact_email: form.email,
        member_emails: [form.email],
      });

      await logActivity({
        action: `New client company created: ${form.name}`,
        action_type: 'system_action',
        entity_type: 'system',
        details: `Client ${form.name} (${form.email}) added to system`,
      });

      setForm({
        name: '',
        industry: '',
        country: '',
        city: '',
        address: '',
        phone: '',
        website: '',
        email: '',
      });
      onSuccess?.();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Company Name *</Label>
            <Input 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})}
              placeholder="Client company name"
            />
          </div>

          <div className="space-y-2">
            <Label>Email *</Label>
            <Input 
              type="email"
              value={form.email} 
              onChange={e => setForm({...form, email: e.target.value})}
              placeholder="primary@company.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Country</Label>
              <Input 
                value={form.country} 
                onChange={e => setForm({...form, country: e.target.value})}
                placeholder="Country"
              />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input 
                value={form.city} 
                onChange={e => setForm({...form, city: e.target.value})}
                placeholder="City"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Industry</Label>
            <Input 
              value={form.industry} 
              onChange={e => setForm({...form, industry: e.target.value})}
              placeholder="e.g., Manufacturing"
            />
          </div>

          <div className="space-y-2">
            <Label>Phone</Label>
            <Input 
              value={form.phone} 
              onChange={e => setForm({...form, phone: e.target.value})}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="space-y-2">
            <Label>Website</Label>
            <Input 
              value={form.website} 
              onChange={e => setForm({...form, website: e.target.value})}
              placeholder="https://company.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <Textarea 
              value={form.address} 
              onChange={e => setForm({...form, address: e.target.value})}
              placeholder="Full address"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !form.name || !form.email}
            className="bg-[#D50000] hover:bg-[#B00000]"
          >
            {loading ? 'Adding...' : 'Add Client'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}