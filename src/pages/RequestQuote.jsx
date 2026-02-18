import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Upload, Ship, Plane, Truck, ArrowRight, ArrowLeft, FileText, Plus, X, Thermometer, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logRFQAction } from '@/components/utils/activityLogger';
import CargoLinesEditor from '@/components/rfq/CargoLinesEditor';

const incoterms = ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF'];

const needsCargoLines = (mode, cargoType) =>
  mode === 'air' || (mode === 'sea' && cargoType === 'LCL') || cargoType === 'Break Bulk';

export default function RequestQuote() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState('');
  const [files, setFiles] = useState([]);
  const [containers, setContainers] = useState([]);
  const [currentContainer, setCurrentContainer] = useState({ type: '', quantity: '' });
  const [cargoLines, setCargoLines] = useState([]);

  const [form, setForm] = useState({
    company_name: '', contact_person: '', email: '', phone: '',
    mode: '', incoterm: '', origin: '', destination: '',
    cargo_type: '', weight_kg: '', volume_cbm: '', num_packages: '',
    commodity_description: '', hs_code: '',
    is_hazardous: false, un_number: '', imdg_class: '',
    requires_temperature_control: false, temperature_range: '',
    preferred_shipping_date: '',
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const showCargoLines = needsCargoLines(form.mode, form.cargo_type);
  const showContainers = form.mode === 'sea' && form.cargo_type === 'FCL';

  const handleFileUpload = async (e) => {
    const uploaded = [];
    for (const file of e.target.files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploaded.push(file_url);
    }
    setFiles(prev => [...prev, ...uploaded]);
  };

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

  const handleSubmit = async () => {
    setSubmitting(true);
    const year = new Date().getFullYear();
    const seq = String(Math.floor(10000 + Math.random() * 90000));
    const ref = `RFQ-${year}-${seq}`;

    let clientEmail = '';
    try { const user = await base44.auth.me(); clientEmail = user.email; } catch {}

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

    const newRFQ = await base44.entities.RFQ.create({
      ...form,
      reference_number: ref,
      status: 'submitted',
      weight_kg: showCargoLines && totalWgt > 0 ? totalWgt : (Number(form.weight_kg) || 0),
      volume_cbm: showCargoLines && totalVol > 0 ? totalVol : (Number(form.volume_cbm) || 0),
      chargeable_weight_kg: chargeableWeight || undefined,
      num_packages: Number(form.num_packages) || 0,
      containers: containers.length > 0 ? containers : undefined,
      cargo_lines: cleanLines.length > 0 ? cleanLines : undefined,
      document_urls: files,
      client_email: clientEmail || form.email,
      is_hazardous: form.is_hazardous,
      un_number: form.is_hazardous ? form.un_number : undefined,
      imdg_class: form.is_hazardous ? form.imdg_class : undefined,
      requires_temperature_control: form.requires_temperature_control,
      temperature_range: form.requires_temperature_control ? form.temperature_range : undefined,
      hs_code: form.hs_code || undefined,
    });

    await logRFQAction(newRFQ, 'rfq_created', `New RFQ submitted: ${ref} for ${form.company_name}`);

    await base44.integrations.Core.SendEmail({
      to: form.email,
      subject: `RFQ Received - ${ref}`,
      body: `Dear ${form.contact_person},\n\nThank you for your inquiry. Your RFQ has been received.\n\nReference: ${ref}\nMode: ${form.mode}\nOrigin: ${form.origin}\nDestination: ${form.destination}\n\nOur team will review and respond within 24 hours.\n\nBest regards,\nTact Freight Team`,
    });

    setRefNumber(ref);
    setSubmitted(true);
    setSubmitting(false);
  };

  const step2Valid = form.mode && form.origin && form.destination && form.cargo_type &&
    (!showContainers || containers.length > 0) &&
    (!showCargoLines || cargoLines.length > 0);

  if (submitted) {
    return (
      <section className="min-h-[80vh] flex items-center justify-center bg-white">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-lg px-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-[#1A1A1A]">RFQ Submitted!</h2>
          <p className="mt-4 text-gray-500">Your reference number is:</p>
          <div className="mt-3 bg-[#F2F2F2] rounded-xl py-4 px-8 inline-block">
            <span className="text-2xl font-mono font-bold text-[#D50000]">{refNumber}</span>
          </div>
          <p className="mt-6 text-gray-500 text-sm">A confirmation email has been sent. Our team will contact you within 24 hours.</p>
        </motion.div>
      </section>
    );
  }

  return (
    <div>
      <section className="relative py-24 bg-[#1A1A1A]">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1494412574643-ff11b0a5eb19?w=1920&q=80" alt="" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A] via-[#1A1A1A]/95 to-[#1A1A1A]/70" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <span className="text-[#D50000] text-sm font-semibold uppercase tracking-widest">Request for Quotation</span>
          <h1 className="text-4xl md:text-5xl font-black text-white mt-4">Get a Quote</h1>
          <p className="mt-4 text-white/60 max-w-lg">Fill in your shipment details and we'll provide a competitive quote.</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          {/* Progress */}
          <div className="flex items-center gap-4 mb-12">
            {[
              { n: 1, label: 'Contact' },
              { n: 2, label: 'Shipment' },
              { n: 3, label: 'Cargo' },
              { n: 4, label: 'Review' },
            ].map((s, i, arr) => (
              <React.Fragment key={s.n}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s.n ? 'bg-[#D50000] text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {s.n}
                  </div>
                  <span className={`text-xs hidden sm:block ${step >= s.n ? 'text-[#D50000] font-semibold' : 'text-gray-400'}`}>{s.label}</span>
                </div>
                {i < arr.length - 1 && <div className={`flex-1 h-1 rounded mb-4 ${step > s.n ? 'bg-[#D50000]' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: Contact */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h3 className="text-xl font-bold text-[#1A1A1A]">Shipper Information</h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label>Company Name *</Label><Input required className="h-12" value={form.company_name} onChange={e => set('company_name', e.target.value)} /></div>
                  <div className="space-y-2"><Label>Contact Person *</Label><Input required className="h-12" value={form.contact_person} onChange={e => set('contact_person', e.target.value)} /></div>
                  <div className="space-y-2"><Label>Email *</Label><Input required type="email" className="h-12" value={form.email} onChange={e => set('email', e.target.value)} /></div>
                  <div className="space-y-2"><Label>Phone</Label><Input className="h-12" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setStep(2)} disabled={!form.company_name || !form.contact_person || !form.email} className="bg-[#D50000] hover:bg-[#B00000] h-12 px-8">
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Route & Mode */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h3 className="text-xl font-bold text-[#1A1A1A]">Shipment Route & Mode</h3>

                <div className="grid sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Mode *</Label>
                    <Select value={form.mode} onValueChange={v => { set('mode', v); set('cargo_type', ''); setCargoLines([]); setContainers([]); }}>
                      <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
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
                      <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{incoterms.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Preferred Date</Label><Input type="date" className="h-12" value={form.preferred_shipping_date} onChange={e => set('preferred_shipping_date', e.target.value)} /></div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label>Origin *</Label><Input required className="h-12" placeholder="City, Country" value={form.origin} onChange={e => set('origin', e.target.value)} /></div>
                  <div className="space-y-2"><Label>Destination *</Label><Input required className="h-12" placeholder="City, Country" value={form.destination} onChange={e => set('destination', e.target.value)} /></div>
                </div>

                <div className="space-y-2">
                  <Label>Cargo Type *</Label>
                  <Select value={form.cargo_type} onValueChange={v => { set('cargo_type', v); setCargoLines([]); setContainers([]); }}>
                    <SelectTrigger className="h-12"><SelectValue placeholder="Select cargo type" /></SelectTrigger>
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
                      {!form.mode && <>
                        <SelectItem value="FCL">FCL</SelectItem>
                        <SelectItem value="LCL">LCL</SelectItem>
                        <SelectItem value="Break Bulk">Break Bulk</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </>}
                    </SelectContent>
                  </Select>
                </div>

                {/* FCL containers */}
                {showContainers && (
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold">Container Details *</Label>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <Select value={currentContainer.type} onValueChange={v => setCurrentContainer(p => ({ ...p, type: v }))}>
                        <SelectTrigger className="h-12"><SelectValue placeholder="Container type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="20ft STD">20ft Standard</SelectItem>
                          <SelectItem value="40ft STD">40ft Standard</SelectItem>
                          <SelectItem value="40ft HC">40ft High Cube</SelectItem>
                          <SelectItem value="45ft HC">45ft High Cube</SelectItem>
                          <SelectItem value="20ft Reefer">20ft Reefer</SelectItem>
                          <SelectItem value="40ft Reefer">40ft Reefer</SelectItem>
                          <SelectItem value="20ft OT">20ft Open Top</SelectItem>
                          <SelectItem value="40ft OT">40ft Open Top</SelectItem>
                          <SelectItem value="20ft FR">20ft Flat Rack</SelectItem>
                          <SelectItem value="40ft FR">40ft Flat Rack</SelectItem>
                          <SelectItem value="20ft Tank">20ft Tank</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input type="number" min="1" className="h-12" value={currentContainer.quantity} onChange={e => setCurrentContainer(p => ({ ...p, quantity: e.target.value }))} placeholder="Quantity" />
                      <Button type="button" onClick={() => {
                        if (currentContainer.type && currentContainer.quantity) {
                          setContainers(p => [...p, { type: currentContainer.type, quantity: Number(currentContainer.quantity) }]);
                          setCurrentContainer({ type: '', quantity: '' });
                        }
                      }} disabled={!currentContainer.type || !currentContainer.quantity} className="h-12 bg-[#D50000] hover:bg-[#B00000]">
                        <Plus className="w-4 h-4 mr-1" /> Add
                      </Button>
                    </div>
                    {containers.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                        {containers.map((c, i) => (
                          <div key={i} className="flex items-center justify-between bg-white rounded-lg p-3 border">
                            <span className="font-medium">{c.quantity}× {c.type}</span>
                            <button onClick={() => setContainers(p => p.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)} className="h-12 px-8"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                  <Button onClick={() => setStep(3)} disabled={!form.mode || !form.origin || !form.destination || !form.cargo_type || (showContainers && containers.length === 0)} className="bg-[#D50000] hover:bg-[#B00000] h-12 px-8">
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Cargo Details */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h3 className="text-xl font-bold text-[#1A1A1A]">Cargo Details</h3>

                {/* Line-level cargo for LCL / Air */}
                {showCargoLines ? (
                  <CargoLinesEditor lines={cargoLines} onChange={setCargoLines} mode={form.mode} />
                ) : (
                  <div className="grid sm:grid-cols-3 gap-6">
                    <div className="space-y-2"><Label>Total Weight (kg)</Label><Input type="number" className="h-12" value={form.weight_kg} onChange={e => set('weight_kg', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Total Volume (CBM)</Label><Input type="number" className="h-12" value={form.volume_cbm} onChange={e => set('volume_cbm', e.target.value)} /></div>
                    <div className="space-y-2"><Label>No. of Packages</Label><Input type="number" className="h-12" value={form.num_packages} onChange={e => set('num_packages', e.target.value)} /></div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Commodity Description *</Label>
                    <Textarea className="min-h-[90px]" placeholder="Describe the goods in detail..." value={form.commodity_description} onChange={e => set('commodity_description', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>HS / Tariff Code</Label>
                    <Input className="h-12" placeholder="e.g. 8471.30" value={form.hs_code} onChange={e => set('hs_code', e.target.value)} />
                    <p className="text-xs text-gray-400">Used for customs classification</p>
                  </div>
                </div>

                {/* Hazardous */}
                <div className="border border-gray-200 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="font-semibold text-sm">Hazardous / Dangerous Goods</p>
                        <p className="text-xs text-gray-500">IMDG / IATA classified cargo</p>
                      </div>
                    </div>
                    <Switch checked={form.is_hazardous} onCheckedChange={v => set('is_hazardous', v)} />
                  </div>
                  {form.is_hazardous && (
                    <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-orange-100">
                      <div className="space-y-2">
                        <Label className="text-xs">UN Number</Label>
                        <Input className="h-10" placeholder="e.g. UN1263" value={form.un_number} onChange={e => set('un_number', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">{form.mode === 'air' ? 'IATA Class' : 'IMDG Class'}</Label>
                        <Input className="h-10" placeholder="e.g. Class 3 - Flammable" value={form.imdg_class} onChange={e => set('imdg_class', e.target.value)} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Temperature control */}
                <div className="border border-gray-200 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Thermometer className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-semibold text-sm">Temperature Controlled</p>
                        <p className="text-xs text-gray-500">Pharma, food, chemicals requiring cold chain</p>
                      </div>
                    </div>
                    <Switch checked={form.requires_temperature_control} onCheckedChange={v => set('requires_temperature_control', v)} />
                  </div>
                  {form.requires_temperature_control && (
                    <div className="pt-2 border-t border-blue-100">
                      <div className="space-y-2">
                        <Label className="text-xs">Required Temperature Range</Label>
                        <Input className="h-10 max-w-xs" placeholder="e.g. 2–8°C or -20°C" value={form.temperature_range} onChange={e => set('temperature_range', e.target.value)} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)} className="h-12 px-8"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                  <Button onClick={() => setStep(4)} disabled={!form.commodity_description || (showCargoLines && cargoLines.length === 0)} className="bg-[#D50000] hover:bg-[#B00000] h-12 px-8">
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Documents & Review */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h3 className="text-xl font-bold text-[#1A1A1A]">Documents & Review</h3>

                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm mb-1">Upload Commercial Invoice, Packing List, MSDS, or Photos</p>
                  <p className="text-xs text-gray-400 mb-4">Providing documents speeds up quotation accuracy</p>
                  <input type="file" multiple onChange={handleFileUpload} className="hidden" id="rfqFiles" />
                  <label htmlFor="rfqFiles"><Button variant="outline" asChild><span>Choose Files</span></Button></label>
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {files.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600 justify-center">
                          <FileText className="w-4 h-4" /> Document {i + 1} uploaded
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-[#F2F2F2] rounded-2xl p-6 space-y-4">
                  <h4 className="font-bold text-[#1A1A1A]">Summary</h4>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">Company:</span> <strong>{form.company_name}</strong></div>
                    <div><span className="text-gray-500">Contact:</span> <strong>{form.contact_person}</strong></div>
                    <div><span className="text-gray-500">Mode:</span> <strong className="capitalize">{form.mode}</strong></div>
                    <div><span className="text-gray-500">Cargo Type:</span> <strong>{form.cargo_type}</strong></div>
                    <div><span className="text-gray-500">Incoterm:</span> <strong>{form.incoterm || 'N/A'}</strong></div>
                    <div><span className="text-gray-500">Date:</span> <strong>{form.preferred_shipping_date || 'N/A'}</strong></div>
                    <div><span className="text-gray-500">Origin:</span> <strong>{form.origin}</strong></div>
                    <div><span className="text-gray-500">Destination:</span> <strong>{form.destination}</strong></div>
                    {form.hs_code && <div><span className="text-gray-500">HS Code:</span> <strong>{form.hs_code}</strong></div>}
                    {form.is_hazardous && <div className="sm:col-span-2 text-orange-600 font-semibold">⚠ Hazardous — UN: {form.un_number || 'TBD'} / Class: {form.imdg_class || 'TBD'}</div>}
                    {form.requires_temperature_control && <div className="sm:col-span-2 text-blue-600 font-semibold">❄ Temperature Controlled: {form.temperature_range || 'TBD'}</div>}
                  </div>
                  {containers.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Containers:</p>
                      <div className="flex flex-wrap gap-2">{containers.map((c, i) => <span key={i} className="bg-white text-sm font-medium px-3 py-1 rounded-full border">{c.quantity}× {c.type}</span>)}</div>
                    </div>
                  )}
                  {cargoLines.length > 0 && (() => {
                    const { totalVol, totalWgt, chargeableWeight } = getTotalsFromLines();
                    return (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Cargo Summary ({cargoLines.length} line{cargoLines.length > 1 ? 's' : ''}):</p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="bg-white px-3 py-1 rounded-full border font-medium">{totalVol.toFixed(4)} CBM</span>
                          <span className="bg-white px-3 py-1 rounded-full border font-medium">{totalWgt.toFixed(2)} kg</span>
                          {chargeableWeight && <span className="bg-[#D50000] text-white px-3 py-1 rounded-full font-semibold">Chargeable: {chargeableWeight.toFixed(2)} kg</span>}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(3)} className="h-12 px-8"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                  <Button onClick={handleSubmit} disabled={submitting} className="bg-[#D50000] hover:bg-[#B00000] h-12 px-10 font-bold">
                    {submitting ? 'Submitting...' : 'Submit RFQ'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}