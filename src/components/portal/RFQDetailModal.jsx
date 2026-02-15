import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from '../shared/StatusBadge';
import MessageThread from '../messaging/MessageThread';
import { base44 } from '@/api/base44Client';
import { Ship, Plane, Truck, FileText, Upload, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

const modeIcons = { sea: Ship, air: Plane, inland: Truck };

export default function RFQDetailModal({ rfq, open, onClose, role, onUpdate }) {
  const [notes, setNotes] = useState('');
  const [quotationAmount, setQuotationAmount] = useState('');
  const [updating, setUpdating] = useState(false);

  if (!rfq) return null;
  const MIcon = modeIcons[rfq.mode] || Ship;

  const handleAction = async (newStatus, extraData = {}) => {
    setUpdating(true);
    const updateData = { status: newStatus, ...extraData };
    if (role === 'sales' && notes) updateData.sales_notes = (rfq.sales_notes || '') + '\n' + notes;
    if (role === 'pricing' && notes) updateData.pricing_notes = (rfq.pricing_notes || '') + '\n' + notes;
    await base44.entities.RFQ.update(rfq.id, updateData);
    setUpdating(false);
    setNotes('');
    onUpdate?.();
    onClose();
  };

  const handleQuotationUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.RFQ.update(rfq.id, { quotation_url: file_url });
    onUpdate?.();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="font-mono text-[#D50000]">{rfq.reference_number}</span>
            <StatusBadge status={rfq.status} />
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-4">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500 block">Company</span><span className="font-semibold">{rfq.company_name}</span></div>
            <div><span className="text-gray-500 block">Contact</span><span className="font-semibold">{rfq.contact_person}</span></div>
            <div><span className="text-gray-500 block">Email</span><span className="font-semibold">{rfq.email}</span></div>
            <div><span className="text-gray-500 block">Phone</span><span className="font-semibold">{rfq.phone || 'N/A'}</span></div>
            <div><span className="text-gray-500 block">Mode</span><div className="flex items-center gap-2 font-semibold capitalize"><MIcon className="w-4 h-4" />{rfq.mode}</div></div>
            <div><span className="text-gray-500 block">Incoterm</span><span className="font-semibold">{rfq.incoterm || 'N/A'}</span></div>
            <div><span className="text-gray-500 block">Origin</span><span className="font-semibold">{rfq.origin}</span></div>
            <div><span className="text-gray-500 block">Destination</span><span className="font-semibold">{rfq.destination}</span></div>
            <div><span className="text-gray-500 block">Weight</span><span className="font-semibold">{rfq.weight_kg || 'N/A'} KG</span></div>
            <div><span className="text-gray-500 block">Volume</span><span className="font-semibold">{rfq.volume_cbm || 'N/A'} CBM</span></div>
            <div><span className="text-gray-500 block">Packages</span><span className="font-semibold">{rfq.num_packages || 'N/A'}</span></div>
            <div><span className="text-gray-500 block">Hazardous</span><span className="font-semibold">{rfq.is_hazardous ? 'Yes' : 'No'}</span></div>
          </div>

          {rfq.commodity_description && (
            <div className="text-sm">
              <span className="text-gray-500 block mb-1">Commodity</span>
              <p className="bg-gray-50 p-3 rounded-lg">{rfq.commodity_description}</p>
            </div>
          )}

          {rfq.document_urls?.length > 0 && (
            <div>
              <span className="text-gray-500 text-sm block mb-2">Documents</span>
              <div className="flex gap-2 flex-wrap">
                {rfq.document_urls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg text-sm hover:bg-gray-100">
                    <FileText className="w-4 h-4 text-[#D50000]" /> Doc {i + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          {(rfq.sales_notes || rfq.pricing_notes) && (
            <div className="space-y-3">
              {rfq.sales_notes && (
                <div className="text-sm"><span className="text-gray-500 block mb-1">Sales Notes</span><p className="bg-blue-50 p-3 rounded-lg">{rfq.sales_notes}</p></div>
              )}
              {rfq.pricing_notes && (
                <div className="text-sm"><span className="text-gray-500 block mb-1">Pricing Notes</span><p className="bg-purple-50 p-3 rounded-lg">{rfq.pricing_notes}</p></div>
              )}
            </div>
          )}

          {rfq.quotation_url && (
            <div className="text-sm">
              <span className="text-gray-500 block mb-1">Quotation</span>
              <a href={rfq.quotation_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-green-50 px-4 py-3 rounded-lg text-green-700 font-medium hover:bg-green-100">
                <FileText className="w-4 h-4" /> View Quotation PDF
                {rfq.quotation_amount && <span className="ml-auto">${rfq.quotation_amount}</span>}
              </a>
            </div>
          )}

          {/* Actions by role */}
          {role === 'sales' && ['submitted', 'sales_review'].includes(rfq.status) && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2"><Label>Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes for pricing team..." /></div>
              <div className="flex gap-3">
                <Button onClick={() => handleAction('pricing_review')} disabled={updating} className="bg-[#D50000] hover:bg-[#B00000]">Forward to Pricing</Button>
                {rfq.status === 'submitted' && <Button variant="outline" onClick={() => handleAction('sales_review')} disabled={updating}>Mark as Reviewing</Button>}
              </div>
            </div>
          )}

          {role === 'sales' && rfq.status === 'quoted' && (
            <div className="space-y-4 pt-4 border-t">
              <Button onClick={() => handleAction('sent_to_client')} disabled={updating} className="bg-[#D50000] hover:bg-[#B00000]">Send Quotation to Client</Button>
            </div>
          )}

          {role === 'pricing' && rfq.status === 'pricing_review' && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quotation Amount (USD)</Label>
                  <Input type="number" value={quotationAmount} onChange={e => setQuotationAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Upload Quotation PDF</Label>
                  <Input type="file" onChange={handleQuotationUpload} accept=".pdf" />
                </div>
              </div>
              <div className="space-y-2"><Label>Pricing Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Pricing details..." /></div>
              <Button onClick={() => handleAction('quoted', { quotation_amount: Number(quotationAmount) || 0 })} disabled={updating} className="bg-[#D50000] hover:bg-[#B00000]">Submit Quotation</Button>
            </div>
          )}

          {role === 'client' && rfq.status === 'sent_to_client' && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex gap-3">
                <Button onClick={() => handleAction('accepted')} disabled={updating} className="bg-green-600 hover:bg-green-700">Accept Quotation</Button>
                <Button variant="outline" onClick={() => handleAction('rejected')} disabled={updating} className="text-red-600 border-red-200">Reject</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}