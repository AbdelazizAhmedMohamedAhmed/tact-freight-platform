import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from '../shared/StatusBadge';
import MessageThread from '../messaging/MessageThread';
import AssignRFQModal from './AssignRFQModal';
import MarkRFQOutcomeModal from './MarkRFQOutcomeModal';
import { base44 } from '@/api/base44Client';
import { hasPermission } from '@/components/utils/permissions';
import { logRFQAction, logFileAction } from '@/components/utils/activityLogger';
import { sendStatusNotification, sendQuotationNotification } from '@/components/utils/notificationService';
import { notifyRFQSentToPricing, notifyPricingComplete, notifyQuotationSent } from '@/components/utils/notificationEngine';
import { Ship, Plane, Truck, FileText, Upload, MessageSquare, UserPlus, Trophy, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const modeIcons = { sea: Ship, air: Plane, inland: Truck };

export default function RFQDetailModal({ rfq, open, onClose, role, onUpdate }) {
  const [notes, setNotes] = useState('');
  const [quotationAmount, setQuotationAmount] = useState('');
  const [updating, setUpdating] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignType, setAssignType] = useState('sales');
  const [outcomeModalOpen, setOutcomeModalOpen] = useState(false);

  if (!rfq) return null;
  const MIcon = modeIcons[rfq.mode] || Ship;

  // Permission checks
  const canUpdateStatus = hasPermission(role, 'rfqs', 'updateStatus');
  const canUploadQuotation = hasPermission(role, 'rfqs', 'uploadQuotation');
  const canSendToClient = hasPermission(role, 'rfqs', 'sendToClient');
  const canAcceptReject = hasPermission(role, 'rfqs', 'acceptReject');
  const isReadOnly = role === 'customer_service' || role === 'analyst';

  const handleAction = async (newStatus, extraData = {}) => {
    setUpdating(true);
    const updateData = { status: newStatus, ...extraData };
    if ((role === 'sales' || role === 'admin') && notes && ['submitted','sales_review','pricing_review'].includes(rfq.status)) updateData.sales_notes = (rfq.sales_notes || '') + '\n' + notes;
    if ((role === 'pricing' || role === 'admin') && notes && rfq.status === 'pricing_review') updateData.pricing_notes = (rfq.pricing_notes || '') + '\n' + notes;
    await base44.entities.RFQ.update(rfq.id, updateData);
    
    await logRFQAction(
      { ...rfq, ...updateData }, 
      'rfq_status_changed', 
      `RFQ ${rfq.reference_number} status changed from ${rfq.status} to ${newStatus}`,
      { old_value: rfq.status, new_value: newStatus }
    );
    
    // Send notification to client
    await sendStatusNotification('rfq', { ...rfq, ...updateData }, rfq.status, newStatus);
    
    // Trigger workflow-specific notifications
    if (newStatus === 'pricing_review') {
      await notifyRFQSentToPricing({ ...rfq, ...updateData }, rfq.assigned_pricing);
    } else if (newStatus === 'quoted') {
      await notifyPricingComplete({ ...rfq, ...updateData }, rfq.assigned_sales);
    } else if (newStatus === 'sent_to_client') {
      await notifyQuotationSent({ ...rfq, ...updateData });
    }
    
    setUpdating(false);
    setNotes('');
    onUpdate?.();
    onClose();
  };

  const handleQuotationUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const updatedRFQ = await base44.entities.RFQ.update(rfq.id, { quotation_url: file_url });
    
    await logFileAction('quotation_uploaded', file.name, 'rfq', rfq.id, `Quotation uploaded for RFQ ${rfq.reference_number}`);
    await sendQuotationNotification(updatedRFQ);
    
    onUpdate?.();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-[#D50000]">{rfq.reference_number}</span>
            <StatusBadge status={rfq.status} />
            {rfq.final_status && rfq.final_status !== 'pending' && (
              <Badge className={rfq.final_status === 'won' ? 'bg-green-600' : 'bg-gray-600'}>
                {rfq.final_status === 'won' ? '🏆 Won' : '❌ Lost'}
              </Badge>
            )}
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
            {/* Assignment Info */}
            {(rfq.assigned_sales || rfq.assigned_pricing || role === 'admin' || role === 'sales' || role === 'pricing') && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> Assignments
                </h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Sales Team</p>
                    {rfq.assigned_sales ? (
                      <div className="flex items-center justify-between bg-white p-2 rounded">
                        <span className="text-sm font-medium">{rfq.assigned_sales_name || rfq.assigned_sales}</span>
                      </div>
                    ) : (
                      <div>
                        {(role === 'admin' || role === 'sales') && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => { setAssignType('sales'); setAssignModalOpen(true); }}
                            className="w-full"
                          >
                            <UserPlus className="w-3 h-3 mr-1" /> Assign
                          </Button>
                        )}
                        {role !== 'admin' && role !== 'sales' && (
                          <span className="text-sm text-gray-400">Not assigned</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Pricing Team</p>
                    {rfq.assigned_pricing ? (
                      <div className="flex items-center justify-between bg-white p-2 rounded">
                        <span className="text-sm font-medium">{rfq.assigned_pricing_name || rfq.assigned_pricing}</span>
                      </div>
                    ) : (
                      <div>
                        {(role === 'admin' || role === 'pricing') && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => { setAssignType('pricing'); setAssignModalOpen(true); }}
                            className="w-full"
                          >
                            <UserPlus className="w-3 h-3 mr-1" /> Assign
                          </Button>
                        )}
                        {role !== 'admin' && role !== 'pricing' && (
                          <span className="text-sm text-gray-400">Not assigned</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Final Outcome */}
            {rfq.final_status === 'won' && rfq.final_value && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-900">Deal Won</h4>
                </div>
                <p className="text-2xl font-bold text-green-700">${rfq.final_value.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">Final contract value</p>
              </div>
            )}

            {rfq.final_status === 'lost' && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-gray-600" />
                  <h4 className="font-semibold text-gray-900">Deal Lost</h4>
                </div>
                {rfq.lost_reason && (
                  <p className="text-sm text-gray-600">{rfq.lost_reason}</p>
                )}
              </div>
            )}

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

            {/* Read-only notice */}
            {isReadOnly && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-sm text-yellow-800">
                You have view-only access to this RFQ.
              </div>
            )}

            {/* Actions by role - Admin acts as all roles */}
            {!isReadOnly && canUpdateStatus && (role === 'sales' || role === 'admin') && ['submitted', 'sales_review'].includes(rfq.status) && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2"><Label>Sales Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes for pricing team..." /></div>
                <div className="flex gap-3">
                  <Button onClick={() => handleAction('pricing_review')} disabled={updating} className="bg-[#D50000] hover:bg-[#B00000]">Forward to Pricing</Button>
                  {rfq.status === 'submitted' && <Button variant="outline" onClick={() => handleAction('sales_review')} disabled={updating}>Mark as Reviewing</Button>}
                </div>
              </div>
            )}

            {!isReadOnly && canSendToClient && (role === 'sales' || role === 'admin') && rfq.status === 'quoted' && (
              <div className="space-y-4 pt-4 border-t">
                <Button onClick={() => handleAction('sent_to_client')} disabled={updating} className="bg-[#D50000] hover:bg-[#B00000]">Send Quotation to Client</Button>
              </div>
            )}

            {!isReadOnly && canUploadQuotation && (role === 'pricing' || role === 'admin') && rfq.status === 'pricing_review' && (
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

            {!isReadOnly && (role === 'sales' || role === 'operations' || role === 'admin') && rfq.status === 'client_confirmed' && (
              <div className="space-y-4 pt-4 border-t">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="font-semibold text-green-900 text-sm mb-1">✓ Client has accepted this quotation</p>
                  <p className="text-green-700 text-xs">A shipment booking was automatically created upon client confirmation.</p>
                </div>
              </div>
            )}

            {!isReadOnly && canAcceptReject && (role === 'client' || role === 'admin') && rfq.status === 'sent_to_client' && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex gap-3">
                  <Button onClick={() => handleAction('client_confirmed')} disabled={updating} className="bg-green-600 hover:bg-green-700">Accept Quotation</Button>
                  <Button variant="outline" onClick={() => handleAction('rejected')} disabled={updating} className="text-red-600 border-red-200">Reject</Button>
                </div>
              </div>
            )}

            {/* Mark as Won/Lost - Admin/Sales only */}
            {!isReadOnly && (role === 'admin' || role === 'sales') && ['accepted', 'sent_to_client', 'quoted'].includes(rfq.status) && rfq.final_status === 'pending' && (
              <div className="space-y-4 pt-4 border-t">
                <p className="text-sm text-gray-600">Mark the final outcome of this RFQ</p>
                <Button 
                  onClick={() => setOutcomeModalOpen(true)} 
                  variant="outline"
                  className="w-full"
                >
                  <Trophy className="w-4 h-4 mr-2" /> Mark as Won/Lost
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages" className="mt-4">
            <div className="bg-white rounded-xl border">
              <MessageThread entityType="rfq" entityId={rfq.id} userRole={role} />
            </div>
          </TabsContent>
        </Tabs>

        <AssignRFQModal 
          rfq={rfq}
          open={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          onUpdate={onUpdate}
          assignmentType={assignType}
        />

        <MarkRFQOutcomeModal
          rfq={rfq}
          open={outcomeModalOpen}
          onClose={() => setOutcomeModalOpen(false)}
          onUpdate={onUpdate}
        />
        </DialogContent>
        </Dialog>
        );
        }