import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Ship, Plane, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { logShipmentAction } from '@/components/utils/activityLogger';
import { sendStatusNotification } from '@/components/utils/notificationService';

export default function CreateShipment() {
  const [rfq, setRfq] = useState(null);
  const [created, setCreated] = useState(false);
  const [trackingNum, setTrackingNum] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    mode: '', origin: '', destination: '', eta: '',
    vessel_flight_info: '', cargo_description: '', weight_kg: '',
    volume_cbm: '', operations_notes: '', client_email: '', company_name: '',
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rfqId = params.get('rfq_id');
    if (rfqId) {
      base44.entities.RFQ.filter({ id: rfqId }).then(results => {
        if (results.length > 0) {
          const r = results[0];
          setRfq(r);
          setForm({
            mode: r.mode || '', origin: r.origin || '', destination: r.destination || '',
            eta: '', vessel_flight_info: '', cargo_description: r.commodity_description || '',
            weight_kg: r.weight_kg || '', volume_cbm: r.volume_cbm || '',
            operations_notes: '', client_email: r.client_email || r.email || '',
            company_name: r.company_name || '',
          });
        }
      });
    }

    // Generate tracking number
    const yr = String(new Date().getFullYear()).slice(-2);
    const seq = String(Math.floor(10000 + Math.random() * 90000));
    setTrackingNum(`TF-${yr}-${seq}`);
  }, []);

  const handleCreate = async () => {
    setSaving(true);
    const now = new Date().toISOString();
    const newShipment = await base44.entities.Shipment.create({
      tracking_number: trackingNum,
      rfq_id: rfq?.id || '',
      status: 'booking_confirmed',
      mode: form.mode,
      origin: form.origin,
      destination: form.destination,
      eta: form.eta,
      vessel_flight_info: form.vessel_flight_info,
      client_email: form.client_email,
      company_name: form.company_name,
      cargo_description: form.cargo_description,
      weight_kg: Number(form.weight_kg) || 0,
      volume_cbm: Number(form.volume_cbm) || 0,
      operations_notes: form.operations_notes,
      document_urls: [],
      status_history: [{ status: 'booking_confirmed', timestamp: now, note: 'Shipment created' }],
    });

    await logShipmentAction(
      newShipment,
      'shipment_created',
      `Shipment ${trackingNum} created${rfq ? ` from RFQ ${rfq.reference_number}` : ''}`
    );

    if (form.client_email) {
      await base44.integrations.Core.SendEmail({
        to: form.client_email,
        subject: `Shipment Created - ${trackingNum}`,
        body: `Dear Customer,\n\nYour shipment has been created.\n\nTracking Number: ${trackingNum}\nMode: ${form.mode}\nOrigin: ${form.origin}\nDestination: ${form.destination}\n\nTrack your shipment at any time using your tracking number.\n\nBest regards,\nTact Freight Operations`,
      });

      await base44.entities.Notification.create({
        type: 'shipment_update',
        title: 'Shipment Created',
        message: `Your shipment ${trackingNum} has been created`,
        recipient_email: form.client_email,
        entity_type: 'shipment',
        entity_id: newShipment.id,
        entity_reference: trackingNum,
        action_url: '/ClientShipments',
      });
    }

    setCreated(true);
    setSaving(false);
  };

  if (created) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Shipment Created!</h2>
          <div className="mt-4 bg-gray-100 rounded-xl py-3 px-6 inline-block">
            <span className="font-mono font-bold text-[#D50000] text-xl">{trackingNum}</span>
          </div>
          <p className="text-gray-500 text-sm mt-4">Client has been notified via email.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Create Shipment</h1>
        <p className="text-gray-500 text-sm mt-1">
          {rfq ? `From RFQ: ${rfq.reference_number}` : 'Create a new shipment record'}
        </p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm space-y-6">
        <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Tracking Number</p>
            <p className="text-xl font-mono font-bold text-[#D50000]">{trackingNum}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Mode *</Label>
            <Select value={form.mode} onValueChange={v => set('mode', v)}>
              <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sea"><div className="flex items-center gap-2"><Ship className="w-4 h-4" /> Sea</div></SelectItem>
                <SelectItem value="air"><div className="flex items-center gap-2"><Plane className="w-4 h-4" /> Air</div></SelectItem>
                <SelectItem value="inland"><div className="flex items-center gap-2"><Truck className="w-4 h-4" /> Inland</div></SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>ETA</Label><Input type="date" className="h-12" value={form.eta} onChange={e => set('eta', e.target.value)} /></div>
          <div className="space-y-2"><Label>Origin *</Label><Input className="h-12" value={form.origin} onChange={e => set('origin', e.target.value)} /></div>
          <div className="space-y-2"><Label>Destination *</Label><Input className="h-12" value={form.destination} onChange={e => set('destination', e.target.value)} /></div>
          <div className="space-y-2"><Label>Client Email</Label><Input className="h-12" value={form.client_email} onChange={e => set('client_email', e.target.value)} /></div>
          <div className="space-y-2"><Label>Company Name</Label><Input className="h-12" value={form.company_name} onChange={e => set('company_name', e.target.value)} /></div>
          <div className="space-y-2"><Label>Weight (KG)</Label><Input type="number" className="h-12" value={form.weight_kg} onChange={e => set('weight_kg', e.target.value)} /></div>
          <div className="space-y-2"><Label>Volume (CBM)</Label><Input type="number" className="h-12" value={form.volume_cbm} onChange={e => set('volume_cbm', e.target.value)} /></div>
        </div>
        <div className="space-y-2"><Label>Vessel / Flight Info</Label><Input className="h-12" value={form.vessel_flight_info} onChange={e => set('vessel_flight_info', e.target.value)} /></div>
        <div className="space-y-2"><Label>Cargo Description</Label><Textarea value={form.cargo_description} onChange={e => set('cargo_description', e.target.value)} /></div>
        <div className="space-y-2"><Label>Operations Notes</Label><Textarea value={form.operations_notes} onChange={e => set('operations_notes', e.target.value)} /></div>

        <Button onClick={handleCreate} disabled={saving || !form.mode || !form.origin || !form.destination} className="bg-[#D50000] hover:bg-[#B00000] h-12 px-10 font-bold">
          {saving ? 'Creating...' : 'Create Shipment'}
        </Button>
      </div>
    </div>
  );
}