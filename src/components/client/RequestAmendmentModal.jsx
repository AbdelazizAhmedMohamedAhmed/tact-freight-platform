import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

export default function RequestAmendmentModal({ shipment, open, onClose, onUpdate }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setSubmitting(true);

    try {
      const user = await base44.auth.me();
      await base44.entities.ShipmentAmendment.create({
        shipment_id: shipment.id,
        tracking_number: shipment.tracking_number,
        requested_by_email: user.email,
        requested_by_name: user.full_name,
        reason: reason.trim(),
        status: 'pending',
      });

      setReason('');
      onClose();
      onUpdate?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Amendment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <p className="text-sm text-gray-500 mb-2">Shipment: <span className="font-mono font-semibold text-[#D50000]">{shipment?.tracking_number}</span></p>
          </div>
          <div className="space-y-2">
            <Label>What changes would you like?</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please describe the amendment you are requesting (e.g., change destination, update weight, modify dates, etc.)"
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">Our operations team will review and approve/reject your request.</p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !reason.trim()}
              className="bg-[#D50000] hover:bg-[#B00000]"
            >
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : 'Submit Request'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}