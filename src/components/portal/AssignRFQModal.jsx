import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { logAssignment } from '@/components/utils/activityLogger';

export default function AssignRFQModal({ rfq, open, onClose, onUpdate, assignmentType = 'sales' }) {
  const [selectedUser, setSelectedUser] = useState('');
  const [assigning, setAssigning] = useState(false);

  const { data: users = [] } = useQuery({
    queryKey: ['users-for-assignment'],
    queryFn: () => base44.entities.User.list('-created_date', 200),
    enabled: open,
  });

  // Filter users by department
  const eligibleUsers = users.filter(u => {
    if (assignmentType === 'sales') return u.department === 'sales' || u.role === 'admin';
    if (assignmentType === 'pricing') return u.department === 'pricing' || u.role === 'admin';
    return false;
  });

  const handleAssign = async () => {
    if (!selectedUser) return;
    
    setAssigning(true);
    const user = eligibleUsers.find(u => u.email === selectedUser);
    
    const updateData = assignmentType === 'sales' 
      ? { assigned_sales: user.email, assigned_sales_name: user.full_name }
      : { assigned_pricing: user.email, assigned_pricing_name: user.full_name };
    
    await base44.entities.RFQ.update(rfq.id, updateData);
    
    // Create notification
    await base44.entities.Notification.create({
      type: 'rfq_assigned',
      title: `New RFQ Assigned: ${rfq.reference_number}`,
      message: `You have been assigned to ${assignmentType} team for RFQ ${rfq.reference_number} from ${rfq.company_name}`,
      recipient_email: user.email,
      entity_type: 'rfq',
      entity_id: rfq.id,
      entity_reference: rfq.reference_number,
      is_read: false
    });
    
    // Log assignment
    await logAssignment(rfq, assignmentType, user.email, user.full_name);
    
    setAssigning(false);
    onUpdate?.();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Assign to {assignmentType === 'sales' ? 'Sales' : 'Pricing'} Team
          </DialogTitle>
          <DialogDescription>
            Assign <strong className="font-mono">{rfq.reference_number}</strong> to a team member
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">

          <div className="space-y-2">
            <Label>Select Team Member</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${assignmentType} team member`} />
              </SelectTrigger>
              <SelectContent>
                {eligibleUsers.map(user => (
                  <SelectItem key={user.id} value={user.email}>
                    {user.full_name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {eligibleUsers.length === 0 && (
            <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
              No {assignmentType} team members found. Users must have their department set to "{assignmentType}".
            </p>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleAssign} 
              disabled={!selectedUser || assigning}
              className="bg-[#D50000] hover:bg-[#B00000]"
            >
              {assigning ? 'Assigning...' : 'Assign'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}