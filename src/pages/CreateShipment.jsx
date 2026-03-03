import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Ship, Plane, Truck, AlertTriangle, User, Building2, Mail, Phone, Package, Weight, Box, MapPin, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { logShipmentAction } from '@/components/utils/activityLogger';
import { sendStatusNotification } from '@/components/utils/notificationService';

export default function CreateShipment() {
  const [rfq, setRfq] = useState(null);
  const [created, setCreated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingShipment, setExistingShipment] = useState(null);
  const [form, setForm] = useState({
    tracking_number: '', mode: '', origin: '', destination: '', eta: '',
    vessel_flight_info: '', cargo_description: '', weight_kg: '',
    volume_cbm: '', operations_notes: '', client_email: '', company_name: '',
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rfqId = params.get('rfq_id');
    if (rfqId) {
      base44.entities.RFQ.filter({ id: rfqId }).then(async results => {
        if (results.length > 0) {
          const r = results[0];
          setRfq(r);
          setForm(prev => ({
            ...prev,
            mode: r.mode || '', origin: r.origin || '', destination: r.destination || '',
            cargo_description: r.commodity_description || '',
            weight_kg: r.weight_kg || '', volume_cbm: r.volume_cbm || '',
            client_email: r.client_email || r.email || '',
            company_name: r.company_name || '',
          }));
          // Check if shipment already exists for this RFQ
          const existing = await base44.entities.Shipment.filter({ rfq_id: rfqId }, '-created_date', 1);
          if (existing.length > 0) {
            setExistingShipment(existing[0]);
          }
        }
      });
    }
  }, []);

  const handleCreate = async () => {
    setSaving(true);
    const now = new Date().toISOString();
    const newShipment = await base44.entities.Shipment.create({
      tracking_number: form.tracking_number,
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
      `Shipment ${form.tracking_number} created${rfq ? ` from RFQ ${rfq.reference_number}` : ''}`
    );

    if (form.client_email) {
      await base44.integrations.Core.SendEmail({
        to: form.client_email,
        subject: `Shipment Created - ${form.tracking_number}`,
        body: `Dear Customer,\n\nYour shipment has been created.\n\nTracking Number: ${form.tracking_number}\nMode: ${form.mode}\nOrigin: ${form.origin}\nDestination: ${form.destination}\n\nTrack your shipment at any time using your tracking number.\n\nBest regards,\nTact Freight Operations`,
      });

      await base44.entities.Notification.create({
        type: 'shipment_update',
        title: 'Shipment Created',
        message: `Your shipment ${form.tracking_number} has been created`,
        recipient_email: form.client_email,
        entity_type: 'shipment',
        entity_id: newShipment.id,
        entity_reference: form.tracking_number,
        action_url: '/ClientShipments',
      });
    }

    setCreated(true);
    setSaving(false);
  };

  if (existingShipment) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ship className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold">Shipment Already Exists</h2>
          <p className="text-gray-500 text-sm mt-2">A shipment has already been created from this RFQ.</p>
          <div className="mt-4 bg-gray-100 rounded-xl py-3 px-6 inline-block">
            <span className="font-mono font-bold text-[#D50000] text-xl">{existingShipment.tracking_number || '(No tracking yet)'}</span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (created) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Shipment Created!</h2>
          <div className="mt-4 bg-gray-100 rounded-xl py-3 px-6 inline-block">
            <span className="font-mono font-bold text-[#D50000] text-xl">{form.tracking_number}</span>
          </div>
          <p className="text-gray-500 text-sm mt-4">Client has been notified via email.</p>
        </motion.div>
      </div>
    );
  }

  const modeIcon = { sea: <Ship className="w-4 h-4" />, air: <Plane className="w-4 h-4" />, inland: <Truck className="w-4 h-4" /> };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Create Shipment</h1>
        <p className="text-gray-500 text-sm mt-1">
          {rfq ? `From RFQ: ${rfq.reference_number}` : 'Create a new shipment record'}
        </p>
      </div>

      {/* RFQ & Client Summary Panel */}
      {rfq && (
        <div className="grid sm:grid-cols-2 gap-4">
          {/* RFQ Details */}
          <div className="bg-white rounded-2xl shadow-sm p-5 border-l-4 border-[#D50000]">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> RFQ Details</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Reference</span>
                <span className="font-bold text-[#D50000]">{rfq.reference_number}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Mode</span>
                <Badge variant="outline" className="flex items-center gap-1 capitalize">
                  {modeIcon[rfq.mode]} {rfq.mode}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Route</span>
                <span className="text-sm font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" /> {rfq.origin} <ChevronRight className="w-3 h-3 text-gray-300" /> {rfq.destination}
                </span>
              </div>
              {rfq.cargo_type && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Cargo Type</span>
                  <span className="text-sm font-medium">{rfq.cargo_type}</span>
                </div>
              )}
              {rfq.incoterm && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Incoterm</span>
                  <Badge className="bg-gray-100 text-gray-700">{rfq.incoterm}</Badge>
                </div>
              )}
              {(rfq.weight_kg || rfq.volume_cbm) && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Cargo</span>
                  <span className="text-sm font-medium text-gray-700">
                    {rfq.weight_kg ? `${rfq.weight_kg} kg` : ''}{rfq.weight_kg && rfq.volume_cbm ? ' · ' : ''}{rfq.volume_cbm ? `${rfq.volume_cbm} CBM` : ''}
                  </span>
                </div>
              )}
              {rfq.quotation_amount && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Quoted</span>
                  <span className="text-sm font-bold text-green-700">{rfq.quotation_currency || 'USD'} {rfq.quotation_amount.toLocaleString()}</span>
                </div>
              )}
              {rfq.commodity_description && (
                <div className="pt-2 border-t mt-2">
                  <p className="text-xs text-gray-500 mb-1">Commodity</p>
                  <p className="text-sm text-gray-700">{rfq.commodity_description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Client Details */}
          <div className="bg-white rounded-2xl shadow-sm p-5 border-l-4 border-blue-400">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Client Details</p>
            <div className="space-y-2">
              {rfq.company_name && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="font-semibold text-gray-800">{rfq.company_name}</span>
                </div>
              )}
              {rfq.contact_person && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-700">{rfq.contact_person}</span>
                </div>
              )}
              {(rfq.client_email || rfq.email) && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-600">{rfq.client_email || rfq.email}</span>
                </div>
              )}
              {rfq.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-600">{rfq.phone}</span>
                </div>
              )}
              {rfq.preferred_shipping_date && (
                <div className="flex items-center justify-between pt-2 border-t mt-2">
                  <span className="text-sm text-gray-500">Preferred Ship Date</span>
                  <span className="text-sm font-medium">{rfq.preferred_shipping_date}</span>
                </div>
              )}
              {rfq.is_hazardous && (
                <div className="flex items-center gap-2 bg-red-50 rounded-lg px-3 py-2 mt-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="text-sm font-medium text-red-700">Hazardous Cargo {rfq.un_number ? `· UN ${rfq.un_number}` : ''}</span>
                </div>
              )}
              {rfq.requires_temperature_control && (
                <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
                  <span className="text-sm font-medium text-blue-700">🌡️ Temperature Control {rfq.temperature_range ? `· ${rfq.temperature_range}` : ''}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-8 shadow-sm space-y-6">
        <div className="bg-gray-50 rounded-xl p-4">
          <Label className="text-sm text-gray-500 font-medium">Tracking Number *</Label>
          <Input
            className="mt-1 h-12 font-mono font-bold text-[#D50000] text-lg"
            value={form.tracking_number}
            onChange={e => set('tracking_number', e.target.value)}
            placeholder="e.g. TF-26-00001"
          />
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

        <Button onClick={handleCreate} disabled={saving || !form.tracking_number || !form.mode || !form.origin || !form.destination} className="bg-[#D50000] hover:bg-[#B00000] h-12 px-10 font-bold">
          {saving ? 'Creating...' : 'Create Shipment'}
        </Button>
      </div>
    </div>
  );
}