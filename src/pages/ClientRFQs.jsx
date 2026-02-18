import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import RFQCard from '../components/portal/RFQCard';
import CommentThread from '../components/portal/CommentThread';
import StatusBadge from '../components/portal/StatusBadge';
import QuoteBreakdown from '../components/client/QuoteBreakdown';
import QuoteCompareModal from '../components/client/QuoteCompareModal';
import { Plus, Upload, X, FileText, Download, CheckCircle, Ship, Trash2, GitCompare, Check, AlertCircle } from 'lucide-react';
import { createPageUrl } from '../utils';
import { format } from 'date-fns';
import { logRFQAction } from '../components/utils/activityLogger';

export default function ClientRFQs() {
  const [user, setUser] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [showNewRFQ, setShowNewRFQ] = useState(false);
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [rejectConfirm, setRejectConfirm] = useState(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    company_name: '', contact_person: '', email: '', phone: '',
    mode: '', incoterm: '', origin: '', destination: '',
    cargo_type: '', weight_kg: '', volume_cbm: '', num_packages: '',
    commodity_description: '', is_hazardous: false, preferred_shipping_date: '',
    document_urls: [],
    containers: [{ type: '', quantity: 1 }],
  });

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      setCompanyId(u.company_id || null);
      let companyName = '';
      if (u.company_id) {
        const res = await base44.entities.ClientCompany.filter({ id: u.company_id }, '', 1);
        if (res[0]) companyName = res[0].name;
      }
      setFormData(prev => ({
        ...prev,
        company_name: companyName,
        contact_person: u.full_name || '',
        email: u.email,
        phone: u.phone || '',
      }));
    }).catch(() => {});

    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new') setShowNewRFQ(true);
    if (params.get('id')) {
      const id = params.get('id');
      base44.entities.RFQ.filter({ id }, '', 1).then(results => {
        if (results[0]) setSelectedRFQ(results[0]);
      });
    }
  }, []);

  const { data: rfqs = [] } = useQuery({
    queryKey: ['my-rfqs', companyId, user?.email],
    queryFn: () => companyId
      ? base44.entities.RFQ.filter({ company_id: companyId }, '-created_date', 100)
      : base44.entities.RFQ.filter({ client_email: user.email }, '-created_date', 100),
    enabled: !!user,
  });

  const createRFQMutation = useMutation({
    mutationFn: async (data) => {
      const year = new Date().getFullYear();
      const seq = String(Math.floor(10000 + Math.random() * 90000));
      const ref = `RFQ-${year}-${seq}`;

      const newRFQ = await base44.entities.RFQ.create({
        ...data,
        reference_number: ref,
        status: 'submitted',
        client_email: user.email,
        ...(companyId ? { company_id: companyId } : {}),
      });

      await logRFQAction(newRFQ, 'rfq_created', `New RFQ created: ${ref} for ${data.company_name}`);
      
      return newRFQ;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-rfqs']);
      setShowNewRFQ(false);
      setFormData({
        company_name: formData.company_name || '', contact_person: user?.full_name || '', email: user?.email, phone: user?.phone || '',
        mode: '', incoterm: '', origin: '', destination: '',
        cargo_type: '', weight_kg: '', volume_cbm: '', num_packages: '',
        commodity_description: '', is_hazardous: false, preferred_shipping_date: '',
        document_urls: [],
        containers: [{ type: '', quantity: 1 }],
      });
    },
  });

  const confirmQuoteMutation = useMutation({
    mutationFn: async (rfq) => {
      const updated = await base44.entities.RFQ.update(rfq.id, { status: 'client_confirmed' });
      await logRFQAction(updated, 'rfq_status_changed', `RFQ ${updated.reference_number} confirmed by client`, { 
        old_value: rfq.status, 
        new_value: 'client_confirmed' 
      });

      const year = new Date().getFullYear().toString().slice(-2);
      const seq = String(Math.floor(10000 + Math.random() * 90000));
      const trackingNumber = `TF-${year}-${seq}`;

      await base44.entities.Shipment.create({
        tracking_number: trackingNumber,
        rfq_id: rfq.id,
        status: 'booking_confirmed',
        mode: rfq.mode,
        origin: rfq.origin,
        destination: rfq.destination,
        client_email: rfq.client_email || rfq.email,
        company_id: rfq.company_id || null,
        company_name: rfq.company_name,
        cargo_description: rfq.commodity_description,
        weight_kg: rfq.weight_kg,
        volume_cbm: rfq.volume_cbm,
        status_history: [{
          status: 'booking_confirmed',
          timestamp: new Date().toISOString(),
          note: `Booking confirmed. Quotation accepted by client.`,
          updated_by: user?.email,
        }],
      });

      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-rfqs']);
      setSelectedRFQ(null);
      setCompareOpen(false);
      window.location.href = createPageUrl('ClientShipments');
    },
  });

  const rejectQuoteMutation = useMutation({
    mutationFn: async (rfq) => {
      const updated = await base44.entities.RFQ.update(rfq.id, { status: 'rejected' });
      await logRFQAction(updated, 'rfq_status_changed', `RFQ ${updated.reference_number} rejected by client`, {
        old_value: rfq.status,
        new_value: 'rejected'
      });
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-rfqs']);
      setRejectConfirm(null);
      setSelectedRFQ(null);
    },
  });

  const handleFileUpload = async (e) => {
    setUploading(true);
    const uploaded = [];
    for (const file of e.target.files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploaded.push(file_url);
    }
    setFormData(prev => ({ ...prev, document_urls: [...prev.document_urls, ...uploaded] }));
    setUploading(false);
  };

  const handleSubmit = () => {
    createRFQMutation.mutate(formData);
  };

  // RFQs with a quote that can be compared/accepted
  const quotedRFQs = rfqs.filter(r => ['quotation_ready', 'sent_to_client', 'client_confirmed', 'rejected'].includes(r.status) && (r.quotation_amount || r.quotation_url));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-black text-[#1A1A1A]">My RFQs</h1>
        <div className="flex gap-3">
          {quotedRFQs.length >= 1 && (
            <Button variant="outline" onClick={() => setCompareOpen(true)}>
              <GitCompare className="w-4 h-4 mr-2" /> Compare Quotes ({quotedRFQs.length})
            </Button>
          )}
          <Button onClick={() => setShowNewRFQ(true)} className="bg-[#D50000] hover:bg-[#B00000]">
            <Plus className="w-5 h-5 mr-2" /> New RFQ
          </Button>
        </div>
      </div>

      {/* Pending action banner */}
      {rfqs.some(r => ['quotation_ready', 'sent_to_client'].includes(r.status)) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-amber-900 text-sm">You have quotes awaiting your response</p>
            <p className="text-amber-700 text-xs mt-0.5">Click on an RFQ below to review and accept or reject the quote.</p>
          </div>
          {quotedRFQs.length >= 2 && (
            <Button size="sm" variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100 flex-shrink-0" onClick={() => setCompareOpen(true)}>
              Compare All
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rfqs.map(rfq => (
          <RFQCard key={rfq.id} rfq={rfq} onClick={() => setSelectedRFQ(rfq)} />
        ))}
      </div>

      {/* New RFQ Dialog */}
      <Dialog open={showNewRFQ} onOpenChange={setShowNewRFQ}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New RFQ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Company Name*</Label><Input value={formData.company_name} onChange={e => setFormData(prev => ({ ...prev, company_name: e.target.value }))} /></div>
              <div><Label>Contact Person*</Label><Input value={formData.contact_person} onChange={e => setFormData(prev => ({ ...prev, contact_person: e.target.value }))} /></div>
              <div><Label>Email*</Label><Input type="email" value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} /></div>
              <div><Label>Phone</Label><Input value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} /></div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Mode*</Label>
                <Select value={formData.mode} onValueChange={v => setFormData(prev => ({ ...prev, mode: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sea">Sea</SelectItem>
                    <SelectItem value="air">Air</SelectItem>
                    <SelectItem value="inland">Inland</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Incoterm</Label>
                <Select value={formData.incoterm} onValueChange={v => setFormData(prev => ({ ...prev, incoterm: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF'].map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Preferred Date</Label><Input type="date" value={formData.preferred_shipping_date} onChange={e => setFormData(prev => ({ ...prev, preferred_shipping_date: e.target.value }))} /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><Label>Origin*</Label><Input value={formData.origin} onChange={e => setFormData(prev => ({ ...prev, origin: e.target.value }))} placeholder="City, Country" /></div>
              <div><Label>Destination*</Label><Input value={formData.destination} onChange={e => setFormData(prev => ({ ...prev, destination: e.target.value }))} placeholder="City, Country" /></div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div><Label>Weight (KG)</Label><Input type="number" value={formData.weight_kg} onChange={e => setFormData(prev => ({ ...prev, weight_kg: e.target.value }))} /></div>
              <div><Label>Volume (CBM)</Label><Input type="number" value={formData.volume_cbm} onChange={e => setFormData(prev => ({ ...prev, volume_cbm: e.target.value }))} /></div>
              <div><Label>Packages</Label><Input type="number" value={formData.num_packages} onChange={e => setFormData(prev => ({ ...prev, num_packages: e.target.value }))} /></div>
            </div>

            <div>
              <Label>Cargo Type</Label>
              <Select value={formData.cargo_type} onValueChange={v => setFormData(prev => ({ ...prev, cargo_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FCL">FCL</SelectItem>
                  <SelectItem value="LCL">LCL</SelectItem>
                  <SelectItem value="Break Bulk">Break Bulk</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* FCL Container Section */}
            {formData.mode === 'sea' && formData.cargo_type === 'FCL' && (
              <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Containers</Label>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, containers: [...prev.containers, { type: '', quantity: 1 }] }))}
                    className="text-[#D50000] text-sm font-medium hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Container
                  </button>
                </div>
                {formData.containers.map((container, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="flex-1">
                      <Select
                        value={container.type}
                        onValueChange={v => {
                          const updated = [...formData.containers];
                          updated[idx] = { ...updated[idx], type: v };
                          setFormData(prev => ({ ...prev, containers: updated }));
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Container type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="20'STD">20' Standard (20'STD)</SelectItem>
                          <SelectItem value="40'STD">40' Standard (40'STD)</SelectItem>
                          <SelectItem value="40'HQ">40' High Cube (40'HQ)</SelectItem>
                          <SelectItem value="20'RF">20' Reefer (20'RF)</SelectItem>
                          <SelectItem value="40'RF">40' Reefer (40'RF)</SelectItem>
                          <SelectItem value="20'OT">20' Open Top (20'OT)</SelectItem>
                          <SelectItem value="40'OT">40' Open Top (40'OT)</SelectItem>
                          <SelectItem value="20'FR">20' Flat Rack (20'FR)</SelectItem>
                          <SelectItem value="40'FR">40' Flat Rack (40'FR)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="1"
                        value={container.quantity}
                        placeholder="Qty"
                        onChange={e => {
                          const updated = [...formData.containers];
                          updated[idx] = { ...updated[idx], quantity: parseInt(e.target.value) || 1 };
                          setFormData(prev => ({ ...prev, containers: updated }));
                        }}
                      />
                    </div>
                    {formData.containers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, containers: prev.containers.filter((_, i) => i !== idx) }))}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div><Label>Commodity Description</Label><Textarea value={formData.commodity_description} onChange={e => setFormData(prev => ({ ...prev, commodity_description: e.target.value }))} /></div>

            <div>
              <Label>Documents</Label>
              <input type="file" multiple onChange={handleFileUpload} className="hidden" id="rfq-docs" />
              <label htmlFor="rfq-docs">
                <Button variant="outline" disabled={uploading} asChild><span><Upload className="w-4 h-4 mr-2" /> {uploading ? 'Uploading...' : 'Upload'}</span></Button>
              </label>
              {formData.document_urls.length > 0 && <p className="text-sm text-gray-500 mt-2">{formData.document_urls.length} file(s) uploaded</p>}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowNewRFQ(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={!formData.company_name || !formData.mode || !formData.origin || !formData.destination} className="bg-[#D50000] hover:bg-[#B00000]">
                Submit RFQ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Compare Modal */}
      <QuoteCompareModal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        rfqs={quotedRFQs}
        onAccept={(rfq) => confirmQuoteMutation.mutate(rfq)}
        onReject={(rfq) => setRejectConfirm(rfq)}
        accepting={confirmQuoteMutation.isPending}
      />

      {/* Reject Confirm Dialog */}
      <Dialog open={!!rejectConfirm} onOpenChange={() => setRejectConfirm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Quote?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-gray-600 text-sm">Are you sure you want to reject the quote for <strong>{rejectConfirm?.reference_number}</strong>? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setRejectConfirm(null)}>Cancel</Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={() => rejectQuoteMutation.mutate(rejectConfirm)}
                disabled={rejectQuoteMutation.isPending}
              >
                {rejectQuoteMutation.isPending ? 'Rejecting...' : 'Reject Quote'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* RFQ Details Dialog */}
      <Dialog open={!!selectedRFQ} onOpenChange={() => setSelectedRFQ(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedRFQ && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-mono text-gray-500">{selectedRFQ.reference_number}</p>
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mt-1">{selectedRFQ.company_name}</h2>
                </div>
                <StatusBadge status={selectedRFQ.status} type="rfq" />
              </div>

              <div className="grid grid-cols-2 gap-6 bg-gray-50 rounded-xl p-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Mode</p>
                  <p className="font-semibold capitalize">{selectedRFQ.mode}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Route</p>
                  <p className="font-semibold">{selectedRFQ.origin} → {selectedRFQ.destination}</p>
                </div>
                {selectedRFQ.weight_kg && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Weight</p>
                    <p className="font-semibold">{selectedRFQ.weight_kg} KG</p>
                  </div>
                )}
                {selectedRFQ.volume_cbm && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Volume</p>
                    <p className="font-semibold">{selectedRFQ.volume_cbm} CBM</p>
                  </div>
                )}
              </div>

              {(selectedRFQ.quotation_url || selectedRFQ.quotation_amount) && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* Quote header */}
                  <div className={`p-4 flex items-center justify-between flex-wrap gap-3 ${
                    selectedRFQ.status === 'client_confirmed' ? 'bg-green-50 border-b border-green-200' :
                    selectedRFQ.status === 'rejected' ? 'bg-gray-50 border-b border-gray-200' :
                    'bg-blue-50 border-b border-blue-200'
                  }`}>
                    <div>
                      <p className="font-bold text-lg text-[#1A1A1A]">
                        {selectedRFQ.quotation_details?.currency || selectedRFQ.quotation_currency || 'USD'}{' '}
                        {Number(selectedRFQ.quotation_amount).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {selectedRFQ.status === 'client_confirmed' ? '✓ Quote accepted — shipment booked' :
                         selectedRFQ.status === 'rejected' ? '✗ Quote rejected' :
                         'Quote ready for your review'}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {selectedRFQ.quotation_url && (
                        <a href={selectedRFQ.quotation_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" /> Download</Button>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Quote breakdown */}
                  <div className="p-4">
                    <QuoteBreakdown rfq={selectedRFQ} />
                  </div>

                  {/* Actions */}
                  {['quotation_ready', 'sent_to_client'].includes(selectedRFQ.status) && (
                    <div className="p-4 border-t bg-gray-50 space-y-3">
                      <p className="text-sm text-gray-600">Accepting will automatically create a shipment booking.</p>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => confirmQuoteMutation.mutate(selectedRFQ)}
                          disabled={confirmQuoteMutation.isPending}
                          className="flex-1 bg-green-600 hover:bg-green-700 font-semibold"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          {confirmQuoteMutation.isPending ? 'Accepting...' : 'Accept & Book Shipment'}
                        </Button>
                        <Button
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => setRejectConfirm(selectedRFQ)}
                          disabled={confirmQuoteMutation.isPending}
                        >
                          <X className="w-4 h-4 mr-2" /> Reject
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedRFQ.status === 'client_confirmed' && (
                    <div className="p-4 border-t bg-green-50 flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="font-medium text-sm">Quotation accepted — your shipment is being arranged</span>
                    </div>
                  )}
                </div>
              )}

              <CommentThread entityType="rfq" entityId={selectedRFQ.id} userRole={user?.role} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}