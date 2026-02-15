import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from '@/api/base44Client';
import { CheckCircle, XCircle } from 'lucide-react';
import { logRFQAction } from '@/components/utils/activityLogger';

export default function MarkRFQOutcomeModal({ rfq, open, onClose, onUpdate }) {
  const [outcome, setOutcome] = useState('');
  const [finalValue, setFinalValue] = useState('');
  const [lostReason, setLostReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!outcome) return;
    
    setSaving(true);
    
    const updateData = {
      final_status: outcome,
      status: outcome
    };
    
    if (outcome === 'won' && finalValue) {
      updateData.final_value = Number(finalValue);
    }
    
    if (outcome === 'lost' && lostReason) {
      updateData.lost_reason = lostReason;
    }
    
    await base44.entities.RFQ.update(rfq.id, updateData);
    
    await logRFQAction(
      { ...rfq, ...updateData },
      'rfq_outcome_marked',
      `RFQ ${rfq.reference_number} marked as ${outcome.toUpperCase()}${outcome === 'won' && finalValue ? ` with value $${finalValue}` : ''}`,
      { 
        outcome, 
        final_value: finalValue || null,
        lost_reason: lostReason || null 
      }
    );
    
    setSaving(false);
    onUpdate?.();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark RFQ Outcome</DialogTitle>
          <DialogDescription>
            Set the final outcome for <strong className="font-mono">{rfq.reference_number}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setOutcome('won')}
              className={`p-4 rounded-xl border-2 transition-all ${
                outcome === 'won' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <CheckCircle className={`w-8 h-8 mx-auto mb-2 ${outcome === 'won' ? 'text-green-600' : 'text-gray-400'}`} />
              <p className="font-medium">Won</p>
              <p className="text-xs text-gray-500 mt-1">Deal secured</p>
            </button>

            <button
              onClick={() => setOutcome('lost')}
              className={`p-4 rounded-xl border-2 transition-all ${
                outcome === 'lost' 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <XCircle className={`w-8 h-8 mx-auto mb-2 ${outcome === 'lost' ? 'text-red-600' : 'text-gray-400'}`} />
              <p className="font-medium">Lost</p>
              <p className="text-xs text-gray-500 mt-1">Deal not secured</p>
            </button>
          </div>

          {outcome === 'won' && (
            <div className="space-y-2">
              <Label>Final Contract Value (USD)</Label>
              <Input
                type="number"
                value={finalValue}
                onChange={e => setFinalValue(e.target.value)}
                placeholder="0.00"
              />
            </div>
          )}

          {outcome === 'lost' && (
            <div className="space-y-2">
              <Label>Reason for Loss</Label>
              <Textarea
                value={lostReason}
                onChange={e => setLostReason(e.target.value)}
                placeholder="Why was this deal lost? (competitor pricing, timing, etc.)"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!outcome || saving}
              className={outcome === 'won' ? 'bg-green-600 hover:bg-green-700' : 'bg-[#D50000] hover:bg-[#B00000]'}
            >
              {saving ? 'Saving...' : `Mark as ${outcome === 'won' ? 'Won' : 'Lost'}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}