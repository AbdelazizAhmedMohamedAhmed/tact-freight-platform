import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Upload, FileText, Ship, Plane, Truck, CheckCircle2, Search } from 'lucide-react';
import { logRFQAction } from '@/components/utils/activityLogger';
import { sendQuotationNotification } from '@/components/utils/notificationService';

const modeIcons = { sea: Ship, air: Plane, inland: Truck };

export default function PricingCreateQuotation() {
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [search, setSearch] = useState('');
  const [lineItems, setLineItems] = useState([]);
  const [currency, setCurrency] = useState('USD');
  const [validityDays, setValidityDays] = useState(30);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [quotationFile, setQuotationFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: rfqs = [], isLoading } = useQuery({
    queryKey: ['pricing-rfqs'],
    queryFn: () => base44.entities.RFQ.filter({ status: 'pricing_in_progress' }, '-created_date', 100),
  });

  const filteredRFQs = rfqs.filter(r => 
    r.reference_number?.toLowerCase().includes(search.toLowerCase()) ||
    r.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  const addLineItem = () => {
    setLineItems([...lineItems, { 
      description: '', 
      service_type: 'freight', 
      quantity: 1, 
      unit_price: 0 
    }]);
  };

  const updateLineItem = (index, field, value) => {
    const updated = [...lineItems];
    updated[index][field] = value;
    setLineItems(updated);
  };

  const removeLineItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setQuotationFile({ name: file.name, url: file_url });
    setUploading(false);
  };

  const handleSubmitQuotation = async () => {
    if (!selectedRFQ || lineItems.length === 0) return;

    setSubmitting(true);
    const total = calculateSubtotal();

    const quotationData = {
      line_items: lineItems,
      subtotal: total,
      currency: currency,
      validity_days: validityDays,
      notes: notes,
      created_by: user?.email,
      created_at: new Date().toISOString(),
    };

    await base44.entities.RFQ.update(selectedRFQ.id, {
      status: 'quotation_ready',
      quotation_amount: total,
      quotation_currency: currency,
      quotation_url: quotationFile?.url || null,
      pricing_notes: notes,
      quotation_details: quotationData,
    });

    await logRFQAction(
      selectedRFQ,
      'quotation_uploaded',
      `Quotation created for ${selectedRFQ.reference_number} - Amount: ${currency} ${total.toFixed(2)}`
    );

    await sendQuotationNotification(selectedRFQ);

    setSuccess(true);
    setSubmitting(false);
    
    setTimeout(() => {
      setSelectedRFQ(null);
      setLineItems([]);
      setQuotationFile(null);
      setNotes('');
      setSuccess(false);
      queryClient.invalidateQueries({ queryKey: ['pricing-rfqs'] });
    }, 2000);
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-12 pb-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Quotation Submitted!</h2>
            <p className="text-gray-600">The quotation has been created and sent to sales team.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedRFQ) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Create Quotation</h1>
          <p className="text-gray-500 text-sm mt-1">Select an RFQ to create a quotation</p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search RFQs..." 
            className="pl-10" 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <p className="text-gray-500 col-span-full text-center py-12">Loading RFQs...</p>
          ) : filteredRFQs.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center py-12">No RFQs in pricing queue</p>
          ) : (
            filteredRFQs.map(rfq => {
              const ModeIcon = modeIcons[rfq.mode] || Ship;
              return (
                <Card 
                  key={rfq.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-[#D50000]"
                  onClick={() => setSelectedRFQ(rfq)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ModeIcon className="w-5 h-5 text-[#D50000]" />
                      {rfq.reference_number}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="font-semibold text-[#1A1A1A]">{rfq.company_name}</p>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Origin:</span> {rfq.origin}</p>
                      <p><span className="font-medium">Destination:</span> {rfq.destination}</p>
                      <p><span className="font-medium">Mode:</span> <span className="capitalize">{rfq.mode}</span></p>
                      {rfq.weight_kg && <p><span className="font-medium">Weight:</span> {rfq.weight_kg} kg</p>}
                      {rfq.volume_cbm && <p><span className="font-medium">Volume:</span> {rfq.volume_cbm} CBM</p>}
                    </div>
                    <Badge className="bg-purple-100 text-purple-800 mt-2">Pricing in Progress</Badge>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    );
  }

  const ModeIcon = modeIcons[selectedRFQ.mode] || Ship;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Create Quotation</h1>
          <p className="text-gray-500 text-sm mt-1">{selectedRFQ.reference_number} - {selectedRFQ.company_name}</p>
        </div>
        <Button variant="outline" onClick={() => setSelectedRFQ(null)}>
          Change RFQ
        </Button>
      </div>

      {/* RFQ Details Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ModeIcon className="w-5 h-5 text-[#D50000]" />
            RFQ Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs mb-1">Company</p>
              <p className="font-semibold">{selectedRFQ.company_name}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Route</p>
              <p className="font-semibold">{selectedRFQ.origin} → {selectedRFQ.destination}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Mode / Incoterm</p>
              <p className="font-semibold capitalize">{selectedRFQ.mode} / {selectedRFQ.incoterm}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Cargo Type</p>
              <p className="font-semibold">{selectedRFQ.cargo_type}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Weight</p>
              <p className="font-semibold">{selectedRFQ.weight_kg || '-'} kg</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Volume</p>
              <p className="font-semibold">{selectedRFQ.volume_cbm || '-'} CBM</p>
            </div>
          </div>
          {selectedRFQ.commodity_description && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-gray-500 text-xs mb-1">Commodity Description</p>
              <p className="text-sm">{selectedRFQ.commodity_description}</p>
            </div>
          )}
          {selectedRFQ.sales_notes && (
            <div className="mt-3">
              <p className="text-gray-500 text-xs mb-1">Sales Notes</p>
              <p className="text-sm bg-blue-50 p-3 rounded-lg">{selectedRFQ.sales_notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Quotation Line Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-24">Qty</TableHead>
                <TableHead className="w-32">Unit Price</TableHead>
                <TableHead className="w-32">Total</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Select 
                      value={item.service_type} 
                      onValueChange={(val) => updateLineItem(index, 'service_type', val)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="freight">Freight</SelectItem>
                        <SelectItem value="customs">Customs Clearance</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="handling">Handling</SelectItem>
                        <SelectItem value="documentation">Documentation</SelectItem>
                        <SelectItem value="storage">Storage</SelectItem>
                        <SelectItem value="delivery">Delivery</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input 
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      placeholder="Service description"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                      min="1"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </TableCell>
                  <TableCell className="font-semibold">
                    {(item.quantity * item.unit_price).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => removeLineItem(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Button onClick={addLineItem} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Line Item
          </Button>

          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Amount</span>
              <span className="text-[#D50000]">{currency} {calculateSubtotal().toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Details */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="AED">AED</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Validity (Days)</Label>
              <Input 
                type="number"
                value={validityDays}
                onChange={(e) => setValidityDays(parseInt(e.target.value) || 30)}
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes / Terms & Conditions</Label>
            <Textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special terms, conditions, or notes..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Upload Final Quotation Document (Optional)</Label>
            <div className="flex items-center gap-3">
              <input 
                type="file" 
                onChange={handleFileUpload}
                className="hidden"
                id="quotation-upload"
                accept=".pdf,.doc,.docx"
                disabled={uploading}
              />
              <label htmlFor="quotation-upload">
                <Button variant="outline" asChild disabled={uploading}>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Document'}
                  </span>
                </Button>
              </label>
              {quotationFile && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4 text-[#D50000]" />
                  {quotationFile.name}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => setSelectedRFQ(null)}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmitQuotation}
          disabled={submitting || lineItems.length === 0}
          className="bg-[#D50000] hover:bg-[#B00000]"
        >
          {submitting ? 'Submitting...' : 'Submit Quotation'}
        </Button>
      </div>
    </div>
  );
}