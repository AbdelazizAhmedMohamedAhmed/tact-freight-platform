import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from '@/api/base44Client';
import { logRFQAction } from '../utils/activityLogger';

export default function ShipmentDetailsForm({ shipment, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    shipper_name: shipment?.shipper_name || '',
    shipper_address: shipment?.shipper_address || '',
    shipper_contact: shipment?.shipper_contact || '',
    shipper_phone: shipment?.shipper_phone || '',
    shipper_email: shipment?.shipper_email || '',
    consignee_name: shipment?.consignee_name || '',
    consignee_address: shipment?.consignee_address || '',
    consignee_contact: shipment?.consignee_contact || '',
    consignee_phone: shipment?.consignee_phone || '',
    consignee_email: shipment?.consignee_email || '',
    bl_number: shipment?.bl_number || '',
    shipping_line_airline: shipment?.shipping_line_airline || '',
    vessel_flight_info: shipment?.vessel_flight_info || '',
    first_available_vessel: shipment?.first_available_vessel || '',
    operations_notes: shipment?.operations_notes || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shipment?.id) return;
    setLoading(true);

    try {
      await base44.entities.Shipment.update(shipment.id, form);
      
      await logRFQAction(
        { tracking_number: shipment.tracking_number },
        'shipment_updated',
        `Shipment ${shipment.tracking_number} details updated by operations`
      );

      onUpdate?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shipper Details */}
      <Card>
        <CardHeader><CardTitle className="text-base">Shipper Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input 
                value={form.shipper_name} 
                onChange={e => setForm({...form, shipper_name: e.target.value})}
                placeholder="Shipper company name"
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Person</Label>
              <Input 
                value={form.shipper_contact} 
                onChange={e => setForm({...form, shipper_contact: e.target.value})}
                placeholder="Contact name"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                type="email"
                value={form.shipper_email} 
                onChange={e => setForm({...form, shipper_email: e.target.value})}
                placeholder="email@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input 
                value={form.shipper_phone} 
                onChange={e => setForm({...form, shipper_phone: e.target.value})}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <Textarea 
              value={form.shipper_address} 
              onChange={e => setForm({...form, shipper_address: e.target.value})}
              placeholder="Full shipping address"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Consignee Details */}
      <Card>
        <CardHeader><CardTitle className="text-base">Consignee Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input 
                value={form.consignee_name} 
                onChange={e => setForm({...form, consignee_name: e.target.value})}
                placeholder="Consignee company name"
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Person</Label>
              <Input 
                value={form.consignee_contact} 
                onChange={e => setForm({...form, consignee_contact: e.target.value})}
                placeholder="Contact name"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                type="email"
                value={form.consignee_email} 
                onChange={e => setForm({...form, consignee_email: e.target.value})}
                placeholder="email@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input 
                value={form.consignee_phone} 
                onChange={e => setForm({...form, consignee_phone: e.target.value})}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <Textarea 
              value={form.consignee_address} 
              onChange={e => setForm({...form, consignee_address: e.target.value})}
              placeholder="Full delivery address"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Vessel/Flight Info */}
      <Card>
        <CardHeader><CardTitle className="text-base">Transport Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>BL / AWB Number</Label>
              <Input 
                value={form.bl_number} 
                onChange={e => setForm({...form, bl_number: e.target.value})}
                placeholder="Bill of Lading / Air Waybill"
              />
            </div>
            <div className="space-y-2">
              <Label>Shipping Line / Airline</Label>
              <Input 
                value={form.shipping_line_airline} 
                onChange={e => setForm({...form, shipping_line_airline: e.target.value})}
                placeholder="Carrier name"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vessel / Flight Info</Label>
              <Input 
                value={form.vessel_flight_info} 
                onChange={e => setForm({...form, vessel_flight_info: e.target.value})}
                placeholder="Vessel name, Flight number, etc."
              />
            </div>
            <div className="space-y-2">
              <Label>First Available Date</Label>
              <Input 
                type="date"
                value={form.first_available_vessel} 
                onChange={e => setForm({...form, first_available_vessel: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operations Notes */}
      <Card>
        <CardHeader><CardTitle className="text-base">Internal Notes</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Operations Notes</Label>
            <Textarea 
              value={form.operations_notes} 
              onChange={e => setForm({...form, operations_notes: e.target.value})}
              placeholder="Internal notes (not visible to clients)"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[#D50000] hover:bg-[#B00000]"
      >
        {loading ? 'Saving...' : 'Save Details'}
      </Button>
    </form>
  );
}