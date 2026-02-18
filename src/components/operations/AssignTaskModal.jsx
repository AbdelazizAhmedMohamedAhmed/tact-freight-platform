import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from '@tanstack/react-query';

export default function AssignTaskModal({ shipment, open, onClose, onUpdate, userRole }) {
  const [task, setTask] = useState({ agent: '', title: '', description: '', priority: 'medium', dueDate: '' });
  const [submitting, setSubmitting] = useState(false);

  // Only Tact Freight staff can assign tasks — guard after hooks
  if (open && userRole === 'client') return null;

  const { data: users = [] } = useQuery({
    queryKey: ['staff-users'],
    queryFn: () => base44.entities.User.filter({ role: 'user' }, '-created_date', 50),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task.agent || !task.title) return;

    setSubmitting(true);
    try {
      const user = await base44.auth.me();
      
      // Create internal message with task details
      await base44.entities.Message.create({
        entity_type: 'shipment',
        entity_id: shipment.id,
        sender_name: user.full_name,
        sender_email: user.email,
        sender_role: 'operations',
        message: `[TASK] ${task.title}\n\nAssigned to: ${task.agent}\nPriority: ${task.priority}\nDue: ${task.dueDate || 'ASAP'}\n\n${task.description}`,
        is_internal: true,
      });

      onUpdate?.();
      setTask({ agent: '', title: '', description: '', priority: 'medium', dueDate: '' });
      onClose?.();
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Task - {shipment?.tracking_number}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Assign to Agent</Label>
            <Select value={task.agent} onValueChange={(v) => setTask(prev => ({ ...prev, agent: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select agent" />
              </SelectTrigger>
              <SelectContent>
                {users.map(u => (
                  <SelectItem key={u.id} value={u.full_name}>
                    {u.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Task Title</Label>
            <Input
              value={task.title}
              onChange={(e) => setTask(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Follow up on customs"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={task.description}
              onChange={(e) => setTask(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Task details..."
              className="min-h-24"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={task.priority} onValueChange={(v) => setTask(prev => ({ ...prev, priority: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={task.dueDate}
                onChange={(e) => setTask(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting || !task.agent || !task.title}
            className="w-full bg-[#D50000] hover:bg-[#B00000]"
          >
            {submitting ? 'Creating...' : 'Assign Task'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}