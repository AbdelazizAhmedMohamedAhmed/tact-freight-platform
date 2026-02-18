import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Ship, Plane, Truck, Package, Plus, X, AlertTriangle, Thermometer, Info } from 'lucide-react';
import { logRFQAction } from '@/components/utils/activityLogger';
import CargoLinesEditor from '@/components/rfq/CargoLinesEditor';

const generateRefNumber = () => {
  const year = new Date().getFullYear();
  const rand = String(Math.floor(Math.random() * 99999)).padStart(5, '0');
  return `RFQ-${year}-${rand}`;
};

const needsCargoLines = (mode, cargoType) =>
  mode === 'air' || (mode === 'sea' && cargoType === 'LCL') || cargoType === 'Break Bulk';

export default function ClientCreateRFQ() {
  const [user, setUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [containers, setContainers] = useState([]);
  const [currentContainer, setCurrentContainer] = useState({ type: '', quantity: '' });
  const [cargoLines, setCargoLines] = useState([]);
  const [form, setForm] = useState({
    origin: '',
    destination: '',
    mode: '',
    cargo_type: '',
    weight_kg: '',
    volume_cbm: '',
    commodity_description: '',
    hs_code: '',
    preferred_shipping_date: '',
    incoterm: '',
    num_packages: '',
    is_hazardous: false,
    un_number: '',
    imdg_class: '',
    requires_temperature_control: false,
    temperature_range: '',
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const showCargoLines = needsCargoLines(form.mode, form.cargo_type);
  const showContainers = form.mode === 'sea' && form.cargo_type === 'FCL';

  const isValid = form.origin && form.destination && form.mode && form.cargo_type && form.commodity_description &&
    (!showContainers || containers.length > 0) &&
    (!showCargoLines || cargoLines.length > 0);

  const getTotalsFromLines = () => {
    let totalVol = 0, totalWgt = 0;
    cargoLines.forEach(l => {
      const qty = parseFloat(l.quantity) || 0;
      const wpu = parseFloat(l.weight_per_unit_kg) || 0;
      const len = parseFloat(l.length_cm) || 0;
      const wid = parseFloat(l.width_cm) || 0;
      const hgt = parseFloat(l.height_cm) || 0;
      totalWgt += qty * wpu;
      if (len && wid && hgt) totalVol += ((len * wid * hgt) / 1_000_000) * qty;
    });
    const chargeableWeight = form.mode === 'air' ? Math.max(totalWgt, totalVol * 167) : null;
    return { totalVol, totalWgt, chargeableWeight };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || !user) return;
    setSubmitting(true);

    const { totalVol, totalWgt, chargeableWeight } = getTotalsFromLines();

    const cleanLines = cargoLines.map(({ id, ...rest }) => ({
      ...rest,
      quantity: Number(rest.quantity) || 0,
      length_cm: Number(rest.length_cm) || 0,
      width_cm: Number(rest.width_cm) || 0,
      height_cm: Number(rest.height_cm) || 0,
      weight_per_unit_kg: Number(rest.weight_per_unit_kg) || 0,
      total_weight_kg: (Number(rest.quantity) || 0) * (Number(rest.weight_per_unit_kg) || 0),
      total_volume_cbm: Number(rest.quantity) > 0 && Number(rest.length_cm) > 0
        ? ((Number(rest.length_cm) * Number(rest.width_cm) * Number(rest.height_cm)) / 1_000_000) * Number(rest.quantity)
        : 0,
    }));

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
      incoterm: form.incoterm || undefined,
      commodity_description: form.commodity_description,
      hs_code: form.hs_code || undefined,
      weight_kg: showCargoLines && totalWgt > 0 ? totalWgt : (form.weight_kg ? parseFloat(form.weight_kg) : undefined),
      volume_cbm: showCargoLines && totalVol > 0 ? totalVol : (form.volume_cbm ? parseFloat(form.volume_cbm) : undefined),
      chargeable_weight_kg: chargeableWeight || undefined,
      num_packages: form.num_packages ? parseInt(form.num_packages) : undefined,
      preferred_shipping_date: form.preferred_shipping_date || undefined,
      is_hazardous: form.is_hazardous,
      un_number: form.is_hazardous ? form.un_number : undefined,
      imdg_class: form.is_hazardous ? form.imdg_class : undefined,
      requires_temperature_control: form.requires_temperature_control,
      temperature_range: form.requires_temperature_control ? form.temperature_range : undefined,
      containers: containers.length > 0 ? containers : undefined,
      cargo_lines: cleanLines.length > 0 ? cleanLines : undefined,
    });

    await logRFQAction(rfq, 'rfq_created', `New RFQ ${ref} submitted by client ${user.email}`);
    const { notifyRFQCreated } = await import('@/components/utils/notificationEngine');
    await notifyRFQCreated(rfq);

    setSuccess(ref);
    setSubmitting(false);
  };

  const resetForm = () => {
    setSuccess(null);
    setForm({ origin: '', destination: '', mode: '', cargo_type: '', weight_kg: '', volume_cbm: '', commodity_description: '', hs_code: '', preferred_shipping_date: '', incoterm: '', num_packages: '', is_hazardous: false, un_number: '', imdg_class: '', requires_temperature_control: false, temperature_range: '' });
    setCargoLines([]);
    setContainers([]);
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-12 pb-12 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
            <h2 className="text-2xl font-bold text-[#1A1A1A]">RFQ Submitted!</h2>
            <p className="text-gray-600">Your request has been received. Our team will review it shortly.</p>
            <p className="font-mono font-bold text-[#D50000] text-lg">{success}</p>
            <Button onClick={resetForm} className="bg-[#D50000] hover:bg-[#B00000]">Submit Another RFQ</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">New Quote Request</h1>
        <p className="text-gray-500 text-sm mt-1">The more detail you provide, the more accurate our quote will be.</p>
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
                <Select value={form.mode} onValueChange={v => { set('mode', v); set('cargo_type', ''); setCargoLines([]); setContainers([]); }}>
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
            <div className="space-y-2">
              <Label>Preferred Shipping Date</Label>
              <Input type="date" value={form.preferred_shipping_date} onChange={e => set('preferred_shipping_date', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Cargo Type */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Package className="w-4 h-4" /> Cargo Type & Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Cargo Type <span className="text-[#D50000]">*</span></Label>
              <Select value={form.cargo_type} onValueChange={v => { set('cargo_type', v); setCargoLines([]); setContainers([]); }}>
                <SelectTrigger><SelectValue placeholder="Select cargo type" /></SelectTrigger>
                <SelectContent>
                  {form.mode === 'sea' && <>
                    <SelectItem value="FCL">FCL — Full Container Load</SelectItem>
                    <SelectItem value="LCL">LCL — Less than Container Load</SelectItem>
                    <SelectItem value="Break Bulk">Break Bulk</SelectItem>
                  </>}
                  {form.mode === 'air' && <>
                    <SelectItem value="General Cargo">General Cargo</SelectItem>
                    <SelectItem value="Express">Express</SelectItem>
                  </>}
                  {form.mode === 'inland' && <>
                    <SelectItem value="FTL">FTL — Full Truck Load</SelectItem>
                    <SelectItem value="LTL">LTL — Less than Truck Load</SelectItem>
                  </>}
                  {!form.mode && ['FCL','LCL','Break Bulk','Other'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* FCL containers */}
            {showContainers && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Container Details <span className="text-[#D50000]">*</span></Label>
                <div className="grid grid-cols-3 gap-3">
                  <Select value={currentContainer.type} onValueChange={v => setCurrentContainer(p => ({ ...p, type: v }))}>
                    <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      {['20ft STD','40ft STD','40ft HC','45ft HC','20ft Reefer','40ft Reefer','20ft OT','40ft OT','20ft FR','40ft FR','20ft Tank'].map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input type="number" min="1" value={currentContainer.quantity} onChange={e => setCurrentContainer(p => ({ ...p, quantity: e.target.value }))} placeholder="Qty" />
                  <Button type="button" onClick={() => {
                    if (currentContainer.type && currentContainer.quantity) {
                      setContainers(p => [...p, { type: currentContainer.type, quantity: Number(currentContainer.quantity) }]);
                      setCurrentContainer({ type: '', quantity: '' });
                    }
                  }} disabled={!currentContainer.type || !currentContainer.quantity} className="bg-[#D50000] hover:bg-[#B00000]">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {containers.length > 0 && (
                  <div className="space-y-2">
                    {containers.map((c, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border text-sm">
                        <span className="font-medium">{c.quantity}× {c.type}</span>
                        <button type="button" onClick={() => setContainers(p => p.filter((_, idx) => idx !== i))} className="text-red-500"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* LCL / Air: per-line dimensions */}
            {showCargoLines && (
              <CargoLinesEditor lines={cargoLines} onChange={setCargoLines} mode={form.mode} />
            )}

            {/* Non-LCL/Air: simple totals */}
            {!showCargoLines && !showContainers && form.cargo_type && (
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
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Commodity Description <span className="text-[#D50000]">*</span></Label>
                <Textarea value={form.commodity_description} onChange={e => set('commodity_description', e.target.value)} placeholder="Describe the goods in detail..." rows={3} required />
              </div>
              <div className="space-y-2">
                <Label>HS / Tariff Code</Label>
                <Input value={form.hs_code} onChange={e => set('hs_code', e.target.value)} placeholder="e.g. 8471.30" />
                <p className="text-xs text-gray-400">Helps with customs pre-clearance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Special Requirements */}
        <Card>
          <CardHeader><CardTitle className="text-base">Special Requirements</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* Hazardous */}
            <div className="flex items-center justify-between rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium text-sm">Hazardous / Dangerous Goods</p>
                  <p className="text-xs text-gray-500">IMDG / IATA classified cargo</p>
                </div>
              </div>
              <Switch checked={form.is_hazardous} onCheckedChange={v => set('is_hazardous', v)} />
            </div>
            {form.is_hazardous && (
              <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-orange-300">
                <div className="space-y-1">
                  <Label className="text-xs">UN Number</Label>
                  <Input placeholder="e.g. UN1263" value={form.un_number} onChange={e => set('un_number', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{form.mode === 'air' ? 'IATA Class' : 'IMDG Class'}</Label>
                  <Input placeholder="e.g. Class 3 - Flammable" value={form.imdg_class} onChange={e => set('imdg_class', e.target.value)} />
                </div>
              </div>
            )}

            {/* Temperature */}
            <div className="flex items-center justify-between rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <Thermometer className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">Temperature Controlled</p>
                  <p className="text-xs text-gray-500">Pharma, food, chemicals</p>
                </div>
              </div>
              <Switch checked={form.requires_temperature_control} onCheckedChange={v => set('requires_temperature_control', v)} />
            </div>
            {form.requires_temperature_control && (
              <div className="pl-4 border-l-2 border-blue-300 space-y-1">
                <Label className="text-xs">Required Temperature Range</Label>
                <Input className="max-w-xs" placeholder="e.g. 2–8°C or -20°C" value={form.temperature_range} onChange={e => set('temperature_range', e.target.value)} />
              </div>
            )}
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