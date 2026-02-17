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
import { Plus, Upload, X, FileText, Download, CheckCircle, Ship } from 'lucide-react';
import { createPageUrl } from '../utils';
import { format } from 'date-fns';
import { logRFQAction } from '../components/utils/activityLogger';

export default function ClientRFQs() {
  const [user, setUser] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [showNewRFQ, setShowNewRFQ] = useState(false);
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    company_name: '', contact_person: '', email: '', phone: '',
    mode: '', incoterm: '', origin: '', destination: '',
    cargo_type: '', weight_kg: '', volume_cbm: '', num_packages: '',
    commodity_description: '', is_hazardous: false, preferred_shipping_date: '',
    document_urls: [],
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

      // Create a shipment from this confirmed RFQ
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
      window.location.href = createPageUrl('ClientShipments');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-[#1A1A1A]">My RFQs</h1>
        <Button onClick={() => setShowNewRFQ(true)} className="bg-[#D50000] hover:bg-[#B00000]">
          <Plus className="w-5 h-5 mr-2" /> New RFQ
        </Button>
      </div>

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
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 space-y-4">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <p className="font-semibold text-green-900 text-lg">Quotation Ready</p>
                      {selectedRFQ.quotation_amount && (
                        <p className="text-3xl font-black text-green-700 mt-1">
                          {selectedRFQ.quotation_currency || 'USD'} {Number(selectedRFQ.quotation_amount).toLocaleString()}
                        </p>
                      )}
                      {selectedRFQ.pricing_notes && (
                        <p className="text-sm text-green-800 mt-2">{selectedRFQ.pricing_notes}</p>
                      )}
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      {selectedRFQ.quotation_url && (
                        <a href={selectedRFQ.quotation_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Download Quote</Button>
                        </a>
                      )}
                    </div>
                  </div>

                  {selectedRFQ.status === 'client_confirmed' ? (
                    <div className="flex items-center gap-2 bg-green-100 rounded-lg px-4 py-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-800 font-medium">Quotation confirmed — shipment is being arranged</span>
                    </div>
                  ) : (
                    <div className="border-t border-green-200 pt-4">
                      <p className="text-sm text-green-800 mb-3">By confirming, a shipment booking will be created automatically and you will be redirected to My Shipments.</p>
                      <Button
                        onClick={() => confirmQuoteMutation.mutate(selectedRFQ)}
                        disabled={confirmQuoteMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 w-full text-base font-semibold"
                      >
                        <Ship className="w-4 h-4 mr-2" />
                        {confirmQuoteMutation.isPending ? 'Confirming...' : 'Confirm Quotation & Book Shipment'}
                      </Button>
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