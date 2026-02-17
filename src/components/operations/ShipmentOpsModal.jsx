import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import StatusBadge from '../shared/StatusBadge';
import { Ship, Plane, Truck, Upload, FileText, Trash2, Download, CheckCircle2, Circle, X } from 'lucide-react';
import { format } from 'date-fns';
import { sendStatusNotification } from '../utils/notificationService';
import { logShipmentAction, logFileAction } from '../utils/activityLogger';

const statusOrder = [
  { key: 'booking_confirmed', label: 'Booking Confirmed' },
  { key: 'cargo_received', label: 'Cargo Received' },
  { key: 'export_clearance', label: 'Export Clearance' },
  { key: 'departed_origin', label: 'Departed Origin' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'arrived_destination', label: 'Arrived Destination' },
  { key: 'customs_clearance', label: 'Customs Clearance' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

const DOC_TYPES = [
  'Bill of Lading (B/L)', 'Air Waybill (AWB)', 'Commercial Invoice', 'Packing List',
  'Certificate of Origin', 'Export Declaration', 'Import Declaration', 'Customs Entry',
  'Delivery Order', 'Cargo Receipt', 'Insurance Certificate', 'Dangerous Goods Declaration',
  'Temperature Log', 'Survey Report', 'Other',
];

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-gray-500 uppercase tracking-wide">{label}</Label>
      {children}
    </div>
  );
}

export default function ShipmentOpsModal({ shipment: initialShipment, open, onClose, onSaved }) {
  const [ship, setShip] = useState(initialShipment || {});
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docType, setDocType] = useState('Other');

  React.useEffect(() => {
    setShip(initialShipment || {});
    setNewStatus('');
    setStatusNote('');
  }, [initialShipment]);

  const set = (key, val) => setShip(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    const payload = { ...ship };
    if (newStatus && newStatus !== ship.status) {
      const now = new Date().toISOString();
      const history = [...(ship.status_history || []), {
        status: newStatus,
        timestamp: now,
        note: statusNote,
        updated_by: 'operations',
      }];
      payload.status = newStatus;
      payload.status_history = history;
      await sendStatusNotification('shipment', payload, ship.status, newStatus);
      await logShipmentAction(payload, 'shipment_status_changed',
        `Status changed from ${ship.status} to ${newStatus}${statusNote ? ': ' + statusNote : ''}`,
        { old_value: ship.status, new_value: newStatus }
      );
    }
    await base44.entities.Shipment.update(ship.id, payload);
    await logShipmentAction(payload, 'shipment_updated', `Shipment ${ship.tracking_number} details updated`);
    setSaving(false);
    onSaved?.();
    onClose();
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingDoc(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const docs = [...(ship.document_urls || []), {
      name: file.name,
      url: file_url,
      type: docType,
      uploaded_by: 'operations',
      upload_date: new Date().toISOString(),
    }];
    setShip(prev => ({ ...prev, document_urls: docs }));
    await base44.entities.Shipment.update(ship.id, { document_urls: docs });
    await logFileAction('file_uploaded', file.name, 'shipment', ship.id, `${docType} uploaded to ${ship.tracking_number}`);
    setUploadingDoc(false);
    e.target.value = '';
    onSaved?.();
  };

  const handleDeleteDoc = async (idx) => {
    const docs = ship.document_urls.filter((_, i) => i !== idx);
    setShip(prev => ({ ...prev, document_urls: docs }));
    await base44.entities.Shipment.update(ship.id, { document_urls: docs });
    onSaved?.();
  };

  if (!ship.id) return null;

  const MIcon = { sea: Ship, air: Plane, inland: Truck }[ship.mode] || Ship;
  const isAir = ship.mode === 'air';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-5 pb-3 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MIcon className="w-5 h-5 text-[#D50000]" />
              <DialogTitle className="font-mono text-[#D50000] text-xl">{ship.tracking_number}</DialogTitle>
              <StatusBadge status={ship.status} />
            </div>
            <span className="text-sm text-gray-500 capitalize">{ship.mode} · {ship.origin} → {ship.destination}</span>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 pt-4">
          <Tabs defaultValue="status">
            <TabsList className="mb-6 grid grid-cols-5 w-full">
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="transport">Transport</TabsTrigger>
              <TabsTrigger value="parties">Parties</TabsTrigger>
              <TabsTrigger value="cargo">Cargo & Customs</TabsTrigger>
              <TabsTrigger value="documents">Documents ({ship.document_urls?.length || 0})</TabsTrigger>
            </TabsList>

            {/* ── STATUS TAB ── */}
            <TabsContent value="status" className="space-y-6">
              {/* Timeline */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-semibold text-sm text-gray-700 mb-4">Shipment Progress</h3>
                <div className="flex flex-wrap gap-2">
                  {statusOrder.map((step, i) => {
                    const currentIdx = statusOrder.findIndex(s => s.key === ship.status);
                    const isDone = i < currentIdx;
                    const isCurrent = i === currentIdx;
                    return (
                      <div key={step.key} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium
                        ${isDone ? 'bg-green-50 border-green-200 text-green-700' :
                          isCurrent ? 'bg-[#D50000] border-[#D50000] text-white' :
                          'bg-white border-gray-200 text-gray-400'}`}>
                        {isDone ? <CheckCircle2 className="w-3 h-3" /> : isCurrent ? <Circle className="w-3 h-3 fill-white" /> : <Circle className="w-3 h-3" />}
                        {step.label}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Update status */}
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Update Status">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger><SelectValue placeholder="Select new status…" /></SelectTrigger>
                    <SelectContent>
                      {statusOrder.map(s => (
                        <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Status Note (optional)">
                  <Input value={statusNote} onChange={e => setStatusNote(e.target.value)} placeholder="e.g. Vessel departed on time" />
                </Field>
              </div>

              {/* History */}
              {ship.status_history?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 mb-3">History</h3>
                  <div className="space-y-2">
                    {[...(ship.status_history || [])].reverse().map((h, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm bg-gray-50 rounded-lg px-4 py-2.5">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="font-medium">{statusOrder.find(s => s.key === h.status)?.label || h.status}</span>
                          {h.note && <span className="text-gray-500"> — {h.note}</span>}
                        </div>
                        {h.timestamp && <span className="text-xs text-gray-400">{format(new Date(h.timestamp), 'MMM d, HH:mm')}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Field label="Internal Operations Notes">
                <Textarea value={ship.operations_notes || ''} onChange={e => set('operations_notes', e.target.value)} rows={3} placeholder="Internal notes not visible to client…" />
              </Field>
            </TabsContent>

            {/* ── TRANSPORT TAB ── */}
            <TabsContent value="transport" className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Origin">
                  <Input value={ship.origin || ''} onChange={e => set('origin', e.target.value)} />
                </Field>
                <Field label="Destination">
                  <Input value={ship.destination || ''} onChange={e => set('destination', e.target.value)} />
                </Field>
                <Field label="Port of Loading">
                  <Input value={ship.port_of_loading || ''} onChange={e => set('port_of_loading', e.target.value)} placeholder="e.g. Shanghai" />
                </Field>
                <Field label="Port of Discharge">
                  <Input value={ship.port_of_discharge || ''} onChange={e => set('port_of_discharge', e.target.value)} placeholder="e.g. Dubai" />
                </Field>
                <Field label="Place of Receipt">
                  <Input value={ship.place_of_receipt || ''} onChange={e => set('place_of_receipt', e.target.value)} />
                </Field>
                <Field label="Place of Delivery">
                  <Input value={ship.place_of_delivery || ''} onChange={e => set('place_of_delivery', e.target.value)} />
                </Field>
                <Field label={isAir ? 'Flight Info' : 'Vessel / Voyage'}>
                  <Input value={ship.vessel_flight_info || ''} onChange={e => set('vessel_flight_info', e.target.value)} placeholder={isAir ? 'e.g. EK 208' : 'e.g. MSC ANNA'} />
                </Field>
                <Field label={isAir ? 'MAWB Number' : 'Voyage Number'}>
                  <Input value={ship.voyage_number || ''} onChange={e => set('voyage_number', e.target.value)} placeholder={isAir ? 'e.g. 176-12345678' : 'e.g. 045W'} />
                </Field>
                <Field label="ETD (Est. Departure)">
                  <Input type="date" value={ship.etd || ''} onChange={e => set('etd', e.target.value)} />
                </Field>
                <Field label="ETA (Est. Arrival)">
                  <Input type="date" value={ship.eta || ''} onChange={e => set('eta', e.target.value)} />
                </Field>
                <Field label="ATD (Actual Departure)">
                  <Input type="date" value={ship.atd || ''} onChange={e => set('atd', e.target.value)} />
                </Field>
                <Field label="ATA (Actual Arrival)">
                  <Input type="date" value={ship.ata || ''} onChange={e => set('ata', e.target.value)} />
                </Field>
                <Field label="First Available Vessel">
                  <Input type="date" value={ship.first_available_vessel || ''} onChange={e => set('first_available_vessel', e.target.value)} />
                </Field>
                <Field label="Lead Time (Days)">
                  <Input type="number" value={ship.lead_time_days || ''} onChange={e => set('lead_time_days', parseInt(e.target.value) || '')} min="1" />
                </Field>
              </div>

              {/* B/L or AWB section */}
              <div className="border rounded-xl p-4 space-y-4">
                <h3 className="font-semibold text-sm text-[#1A1A1A]">{isAir ? 'Air Waybill Details' : 'Bill of Lading Details'}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {isAir ? (
                    <>
                      <Field label="MAWB Number">
                        <Input value={ship.mawb_number || ''} onChange={e => set('mawb_number', e.target.value)} placeholder="e.g. 176-12345678" />
                      </Field>
                      <Field label="HAWB Number">
                        <Input value={ship.hawb_number || ''} onChange={e => set('hawb_number', e.target.value)} placeholder="House AWB" />
                      </Field>
                    </>
                  ) : (
                    <>
                      <Field label="MBL Number">
                        <Input value={ship.mbl_number || ''} onChange={e => set('mbl_number', e.target.value)} placeholder="Master B/L" />
                      </Field>
                      <Field label="HBL Number">
                        <Input value={ship.hbl_number || ''} onChange={e => set('hbl_number', e.target.value)} placeholder="House B/L" />
                      </Field>
                      <Field label="B/L Type">
                        <Select value={ship.bl_type || ''} onValueChange={v => set('bl_type', v)}>
                          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="original">Original B/L</SelectItem>
                            <SelectItem value="seaway_bill">Sea Waybill</SelectItem>
                            <SelectItem value="telex_release">Telex Release</SelectItem>
                            <SelectItem value="express_bl">Express B/L</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="B/L Status">
                        <Select value={ship.bl_status || ''} onValueChange={v => set('bl_status', v)}>
                          <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="issued">Issued</SelectItem>
                            <SelectItem value="released">Released</SelectItem>
                            <SelectItem value="surrendered">Surrendered</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    </>
                  )}
                  <Field label="Container Numbers">
                    <Input value={ship.container_numbers || ''} onChange={e => set('container_numbers', e.target.value)} placeholder="e.g. MSCU1234567, TEMU9876543" />
                  </Field>
                  <Field label="Seal Numbers">
                    <Input value={ship.seal_numbers || ''} onChange={e => set('seal_numbers', e.target.value)} placeholder="e.g. ML123456" />
                  </Field>
                  <Field label="Incoterm">
                    <Select value={ship.incoterm || ''} onValueChange={v => set('incoterm', v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {['EXW','FCA','CPT','CIP','DAP','DPU','DDP','FAS','FOB','CFR','CIF'].map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Freight Payment">
                    <Select value={ship.freight_payment_terms || ''} onValueChange={v => set('freight_payment_terms', v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prepaid">Prepaid</SelectItem>
                        <SelectItem value="collect">Collect</SelectItem>
                        <SelectItem value="third_party">Third Party</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Freight Charges">
                    <Input type="number" value={ship.freight_charges || ''} onChange={e => set('freight_charges', parseFloat(e.target.value) || '')} placeholder="0.00" />
                  </Field>
                  <Field label="Currency">
                    <Input value={ship.freight_currency || 'USD'} onChange={e => set('freight_currency', e.target.value)} placeholder="USD" />
                  </Field>
                </div>
              </div>
            </TabsContent>

            {/* ── PARTIES TAB ── */}
            <TabsContent value="parties" className="space-y-6">
              {/* Shipper */}
              <div className="border rounded-xl p-4 space-y-4">
                <h3 className="font-semibold text-sm text-[#1A1A1A]">Shipper</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Company Name">
                    <Input value={ship.shipper_name || ''} onChange={e => set('shipper_name', e.target.value)} />
                  </Field>
                  <Field label="Contact Person">
                    <Input value={ship.shipper_contact || ''} onChange={e => set('shipper_contact', e.target.value)} />
                  </Field>
                  <Field label="Phone">
                    <Input value={ship.shipper_phone || ''} onChange={e => set('shipper_phone', e.target.value)} />
                  </Field>
                  <Field label="Email">
                    <Input type="email" value={ship.shipper_email || ''} onChange={e => set('shipper_email', e.target.value)} />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Address">
                      <Textarea rows={2} value={ship.shipper_address || ''} onChange={e => set('shipper_address', e.target.value)} />
                    </Field>
                  </div>
                </div>
              </div>

              {/* Consignee */}
              <div className="border rounded-xl p-4 space-y-4">
                <h3 className="font-semibold text-sm text-[#1A1A1A]">Consignee</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Company Name">
                    <Input value={ship.consignee_name || ''} onChange={e => set('consignee_name', e.target.value)} />
                  </Field>
                  <Field label="Contact Person">
                    <Input value={ship.consignee_contact || ''} onChange={e => set('consignee_contact', e.target.value)} />
                  </Field>
                  <Field label="Phone">
                    <Input value={ship.consignee_phone || ''} onChange={e => set('consignee_phone', e.target.value)} />
                  </Field>
                  <Field label="Email">
                    <Input type="email" value={ship.consignee_email || ''} onChange={e => set('consignee_email', e.target.value)} />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Address">
                      <Textarea rows={2} value={ship.consignee_address || ''} onChange={e => set('consignee_address', e.target.value)} />
                    </Field>
                  </div>
                </div>
              </div>

              {/* Notify Party */}
              <div className="border rounded-xl p-4 space-y-4">
                <h3 className="font-semibold text-sm text-[#1A1A1A]">Notify Party</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Company Name">
                    <Input value={ship.notify_party_name || ''} onChange={e => set('notify_party_name', e.target.value)} />
                  </Field>
                  <Field label="Contact Person">
                    <Input value={ship.notify_party_contact || ''} onChange={e => set('notify_party_contact', e.target.value)} />
                  </Field>
                  <Field label="Phone">
                    <Input value={ship.notify_party_phone || ''} onChange={e => set('notify_party_phone', e.target.value)} />
                  </Field>
                  <Field label="Email">
                    <Input type="email" value={ship.notify_party_email || ''} onChange={e => set('notify_party_email', e.target.value)} />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Address">
                      <Textarea rows={2} value={ship.notify_party_address || ''} onChange={e => set('notify_party_address', e.target.value)} />
                    </Field>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ── CARGO & CUSTOMS TAB ── */}
            <TabsContent value="cargo" className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Cargo Type">
                  <Select value={ship.cargo_type || ''} onValueChange={v => set('cargo_type', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {['FCL','LCL','Break Bulk','RoRo','Airfreight','Other'].map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Package Type">
                  <Select value={ship.package_type || ''} onValueChange={v => set('package_type', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {['cartons','pallets','drums','bags','crates','rolls','pieces','other'].map(t => (
                        <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Number of Packages">
                  <Input type="number" value={ship.num_packages || ''} onChange={e => set('num_packages', parseInt(e.target.value) || '')} />
                </Field>
                <Field label="Weight (KG)">
                  <Input type="number" value={ship.weight_kg || ''} onChange={e => set('weight_kg', parseFloat(e.target.value) || '')} />
                </Field>
                <Field label="Volume (CBM)">
                  <Input type="number" value={ship.volume_cbm || ''} onChange={e => set('volume_cbm', parseFloat(e.target.value) || '')} />
                </Field>
                <Field label="HS Code">
                  <Input value={ship.hs_code || ''} onChange={e => set('hs_code', e.target.value)} placeholder="e.g. 8471.30" />
                </Field>
                <Field label="Customs Reference">
                  <Input value={ship.customs_ref || ''} onChange={e => set('customs_ref', e.target.value)} placeholder="Declaration number" />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Cargo Description">
                    <Textarea rows={3} value={ship.cargo_description || ''} onChange={e => set('cargo_description', e.target.value)} placeholder="Full cargo description as per invoice…" />
                  </Field>
                </div>
              </div>

              {/* Hazardous */}
              <div className="border rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="hazardous" checked={!!ship.is_hazardous} onChange={e => set('is_hazardous', e.target.checked)} className="w-4 h-4 accent-[#D50000]" />
                  <label htmlFor="hazardous" className="font-medium text-sm">Hazardous / Dangerous Goods (DGR)</label>
                </div>
                {ship.is_hazardous && (
                  <Field label="UN Number">
                    <Input value={ship.un_number || ''} onChange={e => set('un_number', e.target.value)} placeholder="e.g. UN1234" />
                  </Field>
                )}
              </div>

              {/* Temperature */}
              <div className="border rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="temp" checked={!!ship.temperature_controlled} onChange={e => set('temperature_controlled', e.target.checked)} className="w-4 h-4 accent-[#D50000]" />
                  <label htmlFor="temp" className="font-medium text-sm">Temperature Controlled (Reefer)</label>
                </div>
                {ship.temperature_controlled && (
                  <Field label="Temperature Range">
                    <Input value={ship.temperature_range || ''} onChange={e => set('temperature_range', e.target.value)} placeholder="e.g. +2°C to +8°C" />
                  </Field>
                )}
              </div>
            </TabsContent>

            {/* ── DOCUMENTS TAB ── */}
            <TabsContent value="documents" className="space-y-5">
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-sm text-[#1A1A1A]">Upload Document</h3>
                <div className="flex gap-3 flex-wrap">
                  <Select value={docType} onValueChange={setDocType}>
                    <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DOC_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <label className="flex items-center gap-2 cursor-pointer bg-white border border-dashed border-gray-300 hover:border-[#D50000] rounded-lg px-4 py-2 text-sm text-gray-600 hover:text-[#D50000] transition-colors">
                    <Upload className="w-4 h-4" />
                    {uploadingDoc ? 'Uploading…' : 'Choose File'}
                    <input type="file" className="hidden" onChange={handleDocUpload} disabled={uploadingDoc} />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                {(!ship.document_urls || ship.document_urls.length === 0) ? (
                  <div className="text-center py-10 text-gray-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No documents uploaded yet</p>
                  </div>
                ) : (
                  ship.document_urls.map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white border rounded-lg px-4 py-3 group hover:border-gray-300 transition-colors">
                      <FileText className="w-5 h-5 text-[#D50000] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-xs">{doc.type || 'Document'}</Badge>
                          {doc.upload_date && (
                            <span className="text-xs text-gray-400">{format(new Date(doc.upload_date), 'MMM d, yyyy')}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Download className="w-4 h-4 text-gray-500" />
                          </Button>
                        </a>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleDeleteDoc(i)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#D50000] hover:bg-[#B00000] px-8">
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}