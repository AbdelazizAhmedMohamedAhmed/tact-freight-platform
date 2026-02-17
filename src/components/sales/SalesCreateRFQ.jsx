import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useQuery } from '@tanstack/react-query';
import { Ship, Plane, Truck, Package, Plus } from 'lucide-react';
import ClientManagementModal from './ClientManagementModal';
import { logRFQAction } from '../utils/activityLogger';

const generateRefNumber = () => {
  const year = new Date().getFullYear();
  const rand = String(Math.floor(Math.random() * 99999)).padStart(5, '0');
  return `RFQ-${year}-${rand}`;
};

export default function SalesCreateRFQ() {
  const [user, setUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [selectedClient, setSelectedClient] = useState('');
  const [showNewClient, setShowNewClient] = useState(false);
  const [form, setForm] = useState({
    origin: '',
    destination: '',
    mode: '',
    cargo_type: '',
    weight_kg: '',
    volume_cbm: '',
    commodity_description: '',
    preferred_shipping_date: '',
    incoterm: '',
    num_packages: '',
    is_hazardous: false,
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: clients = [], refetch: refetchClients } = useQuery({
    queryKey: ['sales-clients'],
    queryFn: () => base44.entities.ClientCompany.list('-created_date', 500),
  });

  const selectedClientData = clients.find(c => c.id === selectedClient);
  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const isValid = form.origin && form.destination && form.mode && form.cargo_type && form.commodity_description && selectedClient;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || !user || !selectedClientData) return;
    setSubmitting(true);

    try {
      const ref = generateRefNumber();
      const rfq = await base44.entities.RFQ.create({
        reference_number: ref,
        status: 'submitted',
        company_name: selectedClientData.name,
        company_id: selectedClientData.id,
        contact_person: selectedClientData.primary_contact_email,
        email: selectedClientData.primary_contact_email,
        client_email: selectedClientData.primary_contact_email,
        origin: form.origin,
        destination: form.destination,
        mode: form.mode,
        cargo_type: form.cargo_type,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : undefined,
        volume_cbm: form.volume_cbm ? parseFloat(form.volume_cbm) : undefined,
        num_packages: form.num_packages ? parseInt(form.num_packages) : undefined,
        commodity_description: form.commodity_description,
        preferred_shipping_date: form.preferred_shipping_date || undefined,
        incoterm: form.incoterm || undefined,
        is_hazardous: form.is_hazardous,
      });

      await logRFQAction(rfq, 'rfq_created', `RFQ ${ref} created by sales for ${selectedClientData.name}`);

      // Notify team
      const { notifyRFQCreated } = await import('@/components/utils/notificationEngine');
      await notifyRFQCreated(rfq);

      setSuccess(ref);
      setSubmitting(false);
    } catch (err) {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-12 pb-12 space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
              <Package className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#1A1A1A]">RFQ Created!</h2>
            <p className="text-gray-600">Quotation request has been created and saved.</p>
            <p className="font-mono font-bold text-[#D50000] text-lg">{success}</p>
            <Button 
              onClick={() => { setSuccess(null); setSelectedClient(''); setForm({ origin: '', destination: '', mode: '', cargo_type: '', weight_kg: '', volume_cbm: '', commodity_description: '', preferred_shipping_date: '', incoterm: '', num_packages: '', is_hazardous: false }); }}
              className="bg-[#D50000] hover:bg-[#B00000]"
            >
              Create Another RFQ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Create Quote Request</h1>
        <p className="text-gray-500 text-sm mt-1">Create a new RFQ for a client</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Selection */}
        <Card>
          <CardHeader><CardTitle className="text-base">Select Client</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Client Company *</Label>
              <div className="flex gap-2">
                <Select value={selectedClient} onValueChange={setSelectedClient} required>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Select a client" /></SelectTrigger>
                  <SelectContent>
                    {clients.length === 0 ? (
                      <SelectItem disabled value="">No clients available</SelectItem>
                    ) : (
                      clients.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="icon" onClick={() => setShowNewClient(true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {selectedClientData && (
              <div className="bg-blue-50 p-3 rounded-lg text-sm">
                <p className="font-medium text-[#1A1A1A]">{selectedClientData.name}</p>
                <p className="text-gray-600">{selectedClientData.primary_contact_email}</p>
                {selectedClientData.country && <p className="text-gray-600">{selectedClientData.city}, {selectedClientData.country}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Route */}
        <Card>
          <CardHeader><CardTitle className="text-base">Route & Mode</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Origin <span className="text-[#D50000]">*</span></Label>
                <Input value={form.origin} onChange={e => set('origin', e.target.value)} placeholder="City, Country" required />
              </div>
              <div className="space-y-2">
                <Label>Destination <span className="text-[#D50000]">*</span></Label>
                <Input value={form.destination} onChange={e => set('destination', e.target.value)} placeholder="City, Country" required />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mode of Transport <span className="text-[#D50000]">*</span></Label>
                <Select value={form.mode} onValueChange={v => set('mode', v)} required>
                  <SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sea"><div className="flex items-center gap-2"><Ship className="w-4 h-4" /> Sea Freight</div></SelectItem>
                    <SelectItem value="air"><div className="flex items-center gap-2"><Plane className="w-4 h-4" /> Air Freight</div></SelectItem>
                    <SelectItem value="inland"><div className="flex items-center gap-2"><Truck className="w-4 h-4" /> Inland Transport</div></SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Incoterm</Label>
                <Select value={form.incoterm} onValueChange={v => set('incoterm', v)}>
                  <SelectTrigger><SelectValue placeholder="Select incoterm" /></SelectTrigger>
                  <SelectContent>
                    {['EXW','FCA','CPT','CIP','DAP','DPU','DDP','FAS','FOB','CFR','CIF'].map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cargo */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Package className="w-4 h-4" /> Cargo Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Cargo Type <span className="text-[#D50000]">*</span></Label>
              <Select value={form.cargo_type} onValueChange={v => set('cargo_type', v)} required>
                <SelectTrigger><SelectValue placeholder="Select cargo type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FCL">FCL (Full Container Load)</SelectItem>
                  <SelectItem value="LCL">LCL (Less than Container Load)</SelectItem>
                  <SelectItem value="Break Bulk">Break Bulk</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Total Weight (kg)</Label>
                <Input type="number" value={form.weight_kg} onChange={e => set('weight_kg', e.target.value)} placeholder="0" min="0" />
              </div>
              <div className="space-y-2">
                <Label>Total Volume (CBM)</Label>
                <Input type="number" value={form.volume_cbm} onChange={e => set('volume_cbm', e.target.value)} placeholder="0" min="0" step="0.01" />
              </div>
              <div className="space-y-2">
                <Label>No. of Packages</Label>
                <Input type="number" value={form.num_packages} onChange={e => set('num_packages', e.target.value)} placeholder="0" min="1" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Commodity Description <span className="text-[#D50000]">*</span></Label>
              <Textarea value={form.commodity_description} onChange={e => set('commodity_description', e.target.value)} placeholder="Describe the goods being shipped..." rows={3} required />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="hazardous"
                checked={form.is_hazardous}
                onChange={e => set('is_hazardous', e.target.checked)}
                className="w-4 h-4 accent-[#D50000]"
              />
              <Label htmlFor="hazardous" className="cursor-pointer">Hazardous / Dangerous Goods</Label>
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader><CardTitle className="text-base">Timing</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Desired Shipping Date</Label>
              <Input type="date" value={form.preferred_shipping_date} onChange={e => set('preferred_shipping_date', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={submitting || !isValid}
          className="w-full h-12 bg-[#D50000] hover:bg-[#B00000] text-base font-semibold"
        >
          {submitting ? 'Creating...' : 'Create Quote Request'}
        </Button>
      </form>

      <ClientManagementModal open={showNewClient} onClose={() => setShowNewClient(false)} onSuccess={() => {
        setShowNewClient(false);
        refetchClients();
      }} />
    </div>
  );
}