import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, FileText, Ship, User, Settings } from 'lucide-react';
import { format } from 'date-fns';

const typeIcons = { rfq: FileText, shipment: Ship, user: User, system: Settings };

export default function AdminActivity() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin-activity'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 100),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Activity Log</h1>
        <p className="text-gray-500 text-sm mt-1">System-wide activity and event log</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No activity logged yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map(log => {
            const Icon = typeIcons[log.entity_type] || Activity;
            return (
              <div key={log.id} className="bg-white rounded-xl p-5 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#D50000]/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-[#D50000]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#1A1A1A] text-sm">{log.action}</p>
                  {log.details && <p className="text-xs text-gray-500 mt-1">{log.details}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {log.performed_by && `By ${log.performed_by} • `}
                    {log.created_date && format(new Date(log.created_date), 'MMM d, yyyy HH:mm')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}