import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, Clock, AlertCircle, User } from 'lucide-react';
import { format } from 'date-fns';

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const statusIcons = {
  pending: Clock,
  in_progress: AlertCircle,
  completed: CheckCircle2,
  blocked: AlertCircle,
};

const statusColors = {
  pending: 'text-gray-500',
  in_progress: 'text-blue-500',
  completed: 'text-green-500',
  blocked: 'text-red-500',
};

export default function TaskCard({ task, onStatusChange, onViewDetails, compact = false }) {
  const StatusIcon = statusIcons[task.status];

  if (compact) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-[#1A1A1A] truncate">{task.title}</p>
            <p className="text-xs text-gray-500 mt-1">{task.entity_reference || 'General'}</p>
          </div>
          <StatusIcon className={`w-4 h-4 ${statusColors[task.status]} flex-shrink-0`} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-[#1A1A1A] mb-1">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
          )}
        </div>
        <Badge className={priorityColors[task.priority]}>
          {task.priority}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        {task.entity_reference && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium text-[#D50000]">{task.entity_reference}</span>
          </div>
        )}
        {task.due_date && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Due {format(new Date(task.due_date), 'MMM d, yyyy')}</span>
          </div>
        )}
        {task.assigned_to_name && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>{task.assigned_to_name}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-4 h-4 ${statusColors[task.status]}`} />
          <span className="text-sm font-medium capitalize">{task.status.replace('_', ' ')}</span>
        </div>
        <div className="flex gap-2">
          {task.status !== 'completed' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(task, task.status === 'pending' ? 'in_progress' : 'completed')}
              className="h-8 text-xs"
            >
              {task.status === 'pending' ? 'Start' : 'Complete'}
            </Button>
          )}
          {onViewDetails && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onViewDetails(task)}
              className="h-8 text-xs"
            >
              Details
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}