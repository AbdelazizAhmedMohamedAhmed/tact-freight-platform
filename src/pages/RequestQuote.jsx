import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Upload, Ship, Plane, Truck, ArrowRight, ArrowLeft, FileText, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logRFQAction } from '@/components/utils/activityLogger';

const incoterms = ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF'];

export default function RequestQuote() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState('');
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({
    company_name: '', contact_person: '', email: '', phone: '',
    mode: '', incoterm: '', origin: '', destination: '',
    cargo_type: '', weight_kg: '', volume_cbm: '', num_packages: '',
    commodity_description: '', is_hazardous: false, preferred_shipping_date: '',
  });
  const [containers, setContainers] = useState([]);
  const [currentContainer, setCurrentContainer] = useState({ type: '', quantity: '' });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleFileUpload = async (e) => {
    const uploaded = [];
    for (const file of e.target.files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploaded.push(file_url);
    }
    setFiles(prev => [...prev, ...uploaded]);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const year = new Date().getFullYear();
    const seq = String(Math.floor(10000 + Math.random() * 90000));
    const ref = `RFQ-${year}-${seq}`;

    let clientEmail = '';
    try {
      const user = await base44.auth.me();
      clientEmail = user.email;
    } catch {}

    const newRFQ = await base44.entities.RFQ.create({
      ...form,
      reference_number: ref,
      status: 'submitted',
      weight_kg: Number(form.weight_kg) || 0,
      volume_cbm: Number(form.volume_cbm) || 0,
      num_packages: Number(form.num_packages) || 0,
      containers: containers.length > 0 ? containers : undefined,
      document_urls: files,
      client_email: clientEmail || form.email,
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
          <p className="mt-4 text-gray-400 text-xs">Please do not refresh this page.</p>
        </motion.div>
      </section>
    );
  }

  return (
    <div>
      <section className="relative py-24 bg-[#1A1A1A]">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1494412574643-ff11b0a5eb19?w=1920&q=80"
            alt=""
            className="w-full h-full object-cover opacity-25"
          />
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
            {[1, 2, 3].map(s => (
              <React.Fragment key={s}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? 'bg-[#D50000] text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {s}
                </div>
                {s < 3 && <div className={`flex-1 h-1 rounded ${step > s ? 'bg-[#D50000]' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>

          <AnimatePresence mode="wait">
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

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h3 className="text-xl font-bold text-[#1A1A1A]">Shipment Details</h3>
                <div className="grid sm:grid-cols-3 gap-6">
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
                <div className="grid sm:grid-cols-3 gap-6">
                  <div className="space-y-2"><Label>Weight (KG)</Label><Input type="number" className="h-12" value={form.weight_kg} onChange={e => set('weight_kg', e.target.value)} /></div>
                  <div className="space-y-2"><Label>Volume (CBM)</Label><Input type="number" className="h-12" value={form.volume_cbm} onChange={e => set('volume_cbm', e.target.value)} /></div>
                  <div className="space-y-2"><Label>Packages</Label><Input type="number" className="h-12" value={form.num_packages} onChange={e => set('num_packages', e.target.value)} /></div>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Cargo Type</Label>
                    <Select value={form.cargo_type} onValueChange={v => set('cargo_type', v)}>
                      <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FCL">FCL (Full Container Load)</SelectItem>
                        <SelectItem value="LCL">LCL (Less than Container Load)</SelectItem>
                        <SelectItem value="Break Bulk">Break Bulk</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-4 pt-6">
                    <Switch checked={form.is_hazardous} onCheckedChange={v => set('is_hazardous', v)} />
                    <Label>Hazardous Goods</Label>
                  </div>
                </div>
                {form.mode === 'sea' && form.cargo_type === 'FCL' && (
                  <div className="space-y-4">
                    <Label>Container Details *</Label>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Select value={currentContainer.type} onValueChange={v => setCurrentContainer(prev => ({ ...prev, type: v }))}>
                          <SelectTrigger className="h-12"><SelectValue placeholder="Container type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="20ft">20ft Standard</SelectItem>
                            <SelectItem value="40ft">40ft Standard</SelectItem>
                            <SelectItem value="40ft_hc">40ft High Cube</SelectItem>
                            <SelectItem value="45ft_hc">45ft High Cube</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Input type="number" min="1" className="h-12" value={currentContainer.quantity} onChange={e => setCurrentContainer(prev => ({ ...prev, quantity: e.target.value }))} placeholder="Quantity" />
                      </div>
                      <Button 
                        type="button" 
                        onClick={() => {
                          if (currentContainer.type && currentContainer.quantity) {
                            setContainers(prev => [...prev, { type: currentContainer.type, quantity: Number(currentContainer.quantity) }]);
                            setCurrentContainer({ type: '', quantity: '' });
                          }
                        }}
                        disabled={!currentContainer.type || !currentContainer.quantity}
                        className="h-12"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add
                      </Button>
                    </div>
                    {containers.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        {containers.map((c, i) => (
                          <div key={i} className="flex items-center justify-between bg-white rounded p-3">
                            <span className="font-medium">{c.quantity}x {c.type.replace('_', ' ').toUpperCase()}</span>
                            <button 
                              onClick={() => setContainers(prev => prev.filter((_, idx) => idx !== i))}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="space-y-2"><Label>Commodity Description</Label><Textarea className="min-h-[100px]" value={form.commodity_description} onChange={e => set('commodity_description', e.target.value)} /></div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)} className="h-12 px-8"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                  <Button 
                    onClick={() => setStep(3)} 
                    disabled={!form.mode || !form.origin || !form.destination || (form.mode === 'sea' && form.cargo_type === 'FCL' && containers.length === 0)} 
                    className="bg-[#D50000] hover:bg-[#B00000] h-12 px-8"
                  >
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h3 className="text-xl font-bold text-[#1A1A1A]">Documents & Review</h3>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm mb-4">Upload Commercial Invoice, Packing List, or Photos</p>
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
                <div className="bg-[#F2F2F2] rounded-2xl p-6 space-y-3">
                  <h4 className="font-bold text-[#1A1A1A]">Summary</h4>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">Company:</span> <span className="font-medium">{form.company_name}</span></div>
                    <div><span className="text-gray-500">Contact:</span> <span className="font-medium">{form.contact_person}</span></div>
                    <div><span className="text-gray-500">Mode:</span> <span className="font-medium capitalize">{form.mode}</span></div>
                    <div><span className="text-gray-500">Incoterm:</span> <span className="font-medium">{form.incoterm || 'N/A'}</span></div>
                    <div><span className="text-gray-500">Origin:</span> <span className="font-medium">{form.origin}</span></div>
                    <div><span className="text-gray-500">Destination:</span> <span className="font-medium">{form.destination}</span></div>
                    <div><span className="text-gray-500">Weight:</span> <span className="font-medium">{form.weight_kg || 'N/A'} KG</span></div>
                    <div><span className="text-gray-500">Volume:</span> <span className="font-medium">{form.volume_cbm || 'N/A'} CBM</span></div>
                    {containers.length > 0 && (
                      <div className="sm:col-span-2">
                        <span className="text-gray-500">Containers:</span> 
                        <div className="flex flex-wrap gap-2 mt-1">
                          {containers.map((c, i) => (
                            <span key={i} className="font-medium bg-white px-3 py-1 rounded-full text-sm">{c.quantity}x {c.type.replace('_', ' ').toUpperCase()}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)} className="h-12 px-8"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
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