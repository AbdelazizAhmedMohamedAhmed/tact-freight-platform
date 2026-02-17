import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { logShipmentAction } from '../utils/activityLogger';
import { Skeleton } from "@/components/ui/skeleton";

export default function PendingAmendments({ refetch: parentRefetch }) {
  const [selectedAmend, setSelectedAmend] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);

  const { data: amendments = [], isLoading, refetch } = useQuery({
    queryKey: ['pending-amendments'],
    queryFn: () => base44.entities.ShipmentAmendment.filter({ status: 'pending' }, '-created_date', 50),
  });

  const handleApprove = async () => {
    if (!selectedAmend) return;
    setActionInProgress(true);
    const now = new Date().toISOString();
    const user = await base44.auth.me();

    await base44.entities.ShipmentAmendment.update(selectedAmend.id, {
      status: 'approved',
      approved_by_email: user.email,
      approved_by_name: user.full_name,
      completed_at: now,
    });

    await logShipmentAction(
      { id: selectedAmend.shipment_id, tracking_number: selectedAmend.tracking_number },
      'shipment_updated',
      `Amendment approved for ${selectedAmend.tracking_number}: ${selectedAmend.reason}`
    );

    setSelectedAmend(null);
    setRejectionReason('');
    setActionInProgress(false);
    refetch();
    parentRefetch?.();
  };

  const handleReject = async () => {
    if (!selectedAmend || !rejectionReason.trim()) return;
    setActionInProgress(true);
    const now = new Date().toISOString();
    const user = await base44.auth.me();

    await base44.entities.ShipmentAmendment.update(selectedAmend.id, {
      status: 'rejected',
      approved_by_email: user.email,
      approved_by_name: user.full_name,
      rejection_reason: rejectionReason.trim(),
      completed_at: now,
    });

    await logShipmentAction(
      { id: selectedAmend.shipment_id, tracking_number: selectedAmend.tracking_number },
      'shipment_updated',
      `Amendment rejected for ${selectedAmend.tracking_number}: ${rejectionReason}`
    );

    setSelectedAmend(null);
    setRejectionReason('');
    setActionInProgress(false);
    refetch();
    parentRefetch?.();
  };

  if (isLoading) {
    return <Skeleton className="h-48 rounded-2xl" />;
  }

  if (amendments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Amendment Requests</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No pending amendments</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pending Amendment Requests ({amendments.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {amendments.map(amend => (
            <div key={amend.id} className="border rounded-lg p-4 bg-blue-50 hover:bg-blue-100 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-mono font-semibold text-[#D50000]">{amend.tracking_number}</p>
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </div>
                  <p className="text-sm text-gray-700"><strong>From:</strong> {amend.requested_by_name || amend.requested_by_email}</p>
                  <p className="text-sm text-gray-600 mt-2"><strong>Request:</strong> {amend.reason}</p>
                  <p className="text-xs text-gray-500 mt-2">Requested: {format(new Date(amend.created_date), 'MMM d, yyyy HH:mm')}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setSelectedAmend(amend)}
                  className="bg-[#D50000] hover:bg-[#B00000]"
                >
                  <AlertCircle className="w-4 h-4 mr-1" /> Review
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedAmend} onOpenChange={() => {
        setSelectedAmend(null);
        setRejectionReason('');
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Amendment Request</DialogTitle>
          </DialogHeader>
          {selectedAmend && (
            <div className="space-y-4 mt-4">
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <p className="text-sm"><strong>Shipment:</strong> <span className="font-mono text-[#D50000]">{selectedAmend.tracking_number}</span></p>
                <p className="text-sm"><strong>Requested by:</strong> {selectedAmend.requested_by_name || selectedAmend.requested_by_email}</p>
                <p className="text-sm"><strong>Request:</strong></p>
                <p className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-200">{selectedAmend.reason}</p>
              </div>

              <div className="space-y-2">
                <Label>Decision</Label>
                <div className="flex gap-2 flex-col">
                  <Button
                    onClick={handleApprove}
                    disabled={actionInProgress}
                    className="bg-green-600 hover:bg-green-700 w-full"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Amendment
                  </Button>
                  <Button
                    onClick={() => {
                      // Will show rejection reason input
                    }}
                    variant="outline"
                    className="w-full"
                    disabled={actionInProgress}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                </div>
              </div>

              {/* Rejection reason field appears if rejecting */}
              <div className="space-y-2">
                <Label>Rejection Reason (if rejecting)</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this amendment cannot be approved..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => {
                  setSelectedAmend(null);
                  setRejectionReason('');
                }} disabled={actionInProgress}>
                  Close
                </Button>
                {rejectionReason.trim() && (
                  <Button
                    onClick={handleReject}
                    disabled={actionInProgress}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Confirm Reject
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}