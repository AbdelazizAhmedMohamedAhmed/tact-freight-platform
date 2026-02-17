import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Ship, Plane, Truck, Package } from 'lucide-react';
import { logRFQAction } from '@/components/utils/activityLogger';

const generateRefNumber = () => {
  const year = new Date().getFullYear();
  const rand = String(Math.floor(Math.random() * 99999)).padStart(5, '0');
  return `RFQ-${year}-${rand}`;
};

export default function ClientCreateRFQ() {
  const [user, setUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
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

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const isValid = form.origin && form.destination && form.mode && form.cargo_type && form.commodity_description;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || !user) return;
    setSubmitting(true);

    const ref = generateRefNumber();
    const rfq = await base44.entities.RFQ.create({
      reference_number: ref,
      status: 'submitted',
      company_name: user.full_name || user.email,
      contact_person: user.full_name || '',
      email: user.email,
      client_email: user.email,
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

    await logRFQAction(rfq, 'rfq_created', `New RFQ ${ref} submitted by client ${user.email}`);

    // Notify sales team
    const { notifyRFQCreated } = await import('@/components/utils/notificationEngine');
    await notifyRFQCreated(rfq);

    setSuccess(ref);
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-12 pb-12 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
            <h2 className="text-2xl font-bold text-[#1A1A1A]">RFQ Submitted!</h2>
            <p className="text-gray-600">Your request has been received. Our sales team will review it shortly.</p>
            <p className="font-mono font-bold text-[#D50000] text-lg">{success}</p>
            <Button 
              onClick={() => { setSuccess(null); setForm({ origin: '', destination: '', mode: '', cargo_type: '', weight_kg: '', volume_cbm: '', commodity_description: '', preferred_shipping_date: '', incoterm: '', num_packages: '', is_hazardous: false }); }}
              className="bg-[#D50000] hover:bg-[#B00000]"
            >
              Submit Another RFQ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">New Quote Request</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details below and our team will get back to you with a quote.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
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
              <Label>Desired Delivery Date</Label>
              <Input type="date" value={form.preferred_shipping_date} onChange={e => set('preferred_shipping_date', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={submitting || !isValid}
          className="w-full h-12 bg-[#D50000] hover:bg-[#B00000] text-base font-semibold"
        >
          {submitting ? 'Submitting...' : 'Submit Quote Request'}
        </Button>
      </form>
    </div>
  );
}