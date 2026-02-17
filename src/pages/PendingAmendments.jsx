import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { logRFQAction } from '../components/utils/activityLogger';

export default function PendingAmendments() {
  const [user, setUser] = useState(null);
  const [selectedAmendment, setSelectedAmendment] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const userRole = user?.department || user?.role || 'user';

  const { data: amendments = [], isLoading, refetch } = useQuery({
    queryKey: ['amendments'],
    queryFn: () => base44.entities.ShipmentAmendment.filter(
      { status: 'pending' },
      '-created_date',
      100
    ),
    enabled: !!user && (userRole === 'operations' || userRole === 'admin'),
  });

  const handleApprove = async (amendment) => {
    if (!user) return;
    setProcessing(true);

    try {
      // Update amendment status
      await base44.entities.ShipmentAmendment.update(amendment.id, {
        status: 'approved',
        approved_by_email: user.email,
        approved_by_name: user.full_name,
        completed_at: new Date().toISOString(),
      });

      // Update shipment with amendment
      const shipment = await base44.entities.Shipment.filter(
        { id: amendment.shipment_id },
        '-created_date',
        1
      ).then(r => r[0]);

      if (shipment) {
        const changes = amendment.changes_requested;
        const updateData = {};
        if (changes.field) {
          updateData[changes.field] = changes.requested_value;
        }

        await base44.entities.Shipment.update(amendment.shipment_id, updateData);

        // Log action
        await logRFQAction(
          { tracking_number: amendment.tracking_number },
          'shipment_updated',
          `Amendment approved for ${amendment.tracking_number}: ${changes.field} changed to ${changes.requested_value}`
        );
      }

      // Notify client
      await base44.integrations.Core.SendEmail({
        to: amendment.requested_by_email,
        subject: `[${amendment.tracking_number}] Amendment Approved`,
        body: `Your amendment request for shipment ${amendment.tracking_number} has been approved.`,
        from_name: 'Tact Freight Operations',
      });

      setSelectedAmendment(null);
      refetch();
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (amendment) => {
    if (!user || !rejectionReason.trim()) return;
    setProcessing(true);

    try {
      await base44.entities.ShipmentAmendment.update(amendment.id, {
        status: 'rejected',
        approved_by_email: user.email,
        approved_by_name: user.full_name,
        rejection_reason: rejectionReason,
        completed_at: new Date().toISOString(),
      });

      // Notify client
      await base44.integrations.Core.SendEmail({
        to: amendment.requested_by_email,
        subject: `[${amendment.tracking_number}] Amendment Rejected`,
        body: `Your amendment request for shipment ${amendment.tracking_number} has been rejected.\n\nReason: ${rejectionReason}`,
        from_name: 'Tact Freight Operations',
      });

      await logRFQAction(
        { tracking_number: amendment.tracking_number },
        'shipment_updated',
        `Amendment rejected for ${amendment.tracking_number}. Reason: ${rejectionReason}`
      );

      setSelectedAmendment(null);
      setRejectionReason('');
      refetch();
    } finally {
      setProcessing(false);
    }
  };

  // Permission check
  if (userRole !== 'operations' && userRole !== 'admin') {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-8 h-8 mx-auto text-red-600 mb-2" />
        <p className="text-red-600 font-medium">You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Pending Amendments</h1>
        <p className="text-sm text-gray-600 mt-1">
          Review and approve client shipment amendment requests
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#D50000]" />
        </div>
      ) : amendments.length === 0 ? (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto text-green-600 mb-2" />
            <p className="text-green-900 font-medium">
              No pending amendments
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {amendments.map(amendment => (
            <Card key={amendment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono font-semibold text-[#D50000]">
                        {amendment.tracking_number}
                      </span>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Pending Review
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Requested by {amendment.requested_by_name} ({amendment.requested_by_email})
                    </p>
                  </div>
                  <Button
                    onClick={() => setSelectedAmendment(amendment)}
                    className="bg-[#D50000] hover:bg-[#B00000]"
                  >
                    Review
                  </Button>
                </div>

                <div className="bg-gray-50 rounded p-3 text-sm">
                  <p className="text-gray-600 mb-2">
                    <span className="font-semibold">Reason:</span> {amendment.reason}
                  </p>
                  <p className="text-gray-600 mb-2">
                    <span className="font-semibold">Change:</span> {amendment.changes_requested.field} → {amendment.changes_requested.requested_value}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Requested {format(new Date(amendment.created_date), 'MMM d, h:mm a')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      {selectedAmendment && (
        <Dialog open={!!selectedAmendment} onOpenChange={() => setSelectedAmendment(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Amendment Request</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Amendment Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tracking Number</p>
                  <p className="font-semibold">{selectedAmendment.tracking_number}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Requested By</p>
                  <p className="font-semibold">
                    {selectedAmendment.requested_by_name} ({selectedAmendment.requested_by_email})
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Reason for Amendment</p>
                  <p>{selectedAmendment.reason}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Requested Change</p>
                  <div className="font-mono text-sm bg-white p-2 rounded border">
                    <p className="text-gray-600">
                      <span className="font-semibold">{selectedAmendment.changes_requested.field}</span>
                    </p>
                    <p className="text-red-600 line-through text-xs">
                      Current: {selectedAmendment.changes_requested.current_value}
                    </p>
                    <p className="text-green-600 text-xs">
                      Requested: {selectedAmendment.changes_requested.requested_value}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rejection Reason (if rejecting) */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Rejection Reason (if rejecting)
                </label>
                <Textarea
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="Explain why this amendment cannot be approved..."
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleApprove(selectedAmendment)}
                  disabled={processing}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve Amendment
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleReject(selectedAmendment)}
                  disabled={processing || !rejectionReason.trim()}
                  variant="outline"
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Amendment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}