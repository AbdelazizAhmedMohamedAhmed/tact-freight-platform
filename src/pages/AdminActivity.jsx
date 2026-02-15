import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Activity, FileText, Ship, User, Settings, Search, Filter, Download, Upload, LogIn, LogOut, FileUp, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

const typeIcons = { 
  rfq: FileText, 
  shipment: Ship, 
  user: User, 
  file: Upload,
  auth: LogIn,
  system: Settings 
};

const actionTypeIcons = {
  login: LogIn,
  logout: LogOut,
  rfq_created: FileText,
  rfq_updated: FileText,
  rfq_status_changed: FileText,
  shipment_created: Ship,
  shipment_updated: Ship,
  shipment_status_changed: Ship,
  user_invited: User,
  user_role_changed: User,
  user_dept_changed: User,
  file_uploaded: Upload,
  file_downloaded: Download,
  quotation_uploaded: FileUp,
  message_sent: MessageSquare,
  system_action: Settings
};

const actionTypeColors = {
  login: 'bg-green-100 text-green-700',
  logout: 'bg-gray-100 text-gray-700',
  rfq_created: 'bg-blue-100 text-blue-700',
  rfq_updated: 'bg-blue-100 text-blue-700',
  rfq_status_changed: 'bg-purple-100 text-purple-700',
  shipment_created: 'bg-cyan-100 text-cyan-700',
  shipment_updated: 'bg-cyan-100 text-cyan-700',
  shipment_status_changed: 'bg-indigo-100 text-indigo-700',
  user_invited: 'bg-green-100 text-green-700',
  user_role_changed: 'bg-orange-100 text-orange-700',
  user_dept_changed: 'bg-orange-100 text-orange-700',
  file_uploaded: 'bg-yellow-100 text-yellow-700',
  file_downloaded: 'bg-yellow-100 text-yellow-700',
  quotation_uploaded: 'bg-green-100 text-green-700',
  message_sent: 'bg-blue-100 text-blue-700',
  system_action: 'bg-gray-100 text-gray-700'
};

export default function AdminActivity() {
  const [search, setSearch] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('all');
  const [actionTypeFilter, setActionTypeFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin-activity'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 500),
  });

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = !search || 
        log.action?.toLowerCase().includes(search.toLowerCase()) ||
        log.details?.toLowerCase().includes(search.toLowerCase()) ||
        log.entity_reference?.toLowerCase().includes(search.toLowerCase());
      
      const matchesEntityType = entityTypeFilter === 'all' || log.entity_type === entityTypeFilter;
      const matchesActionType = actionTypeFilter === 'all' || log.action_type === actionTypeFilter;
      const matchesUser = !userFilter || log.performed_by?.toLowerCase().includes(userFilter.toLowerCase());

      return matchesSearch && matchesEntityType && matchesActionType && matchesUser;
    });
  }, [logs, search, entityTypeFilter, actionTypeFilter, userFilter]);

  // Get unique users for filtering
  const uniqueUsers = useMemo(() => {
    const users = [...new Set(logs.map(log => log.performed_by).filter(Boolean))];
    return users.sort();
  }, [logs]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Activity Log</h1>
        <p className="text-gray-500 text-sm mt-1">System-wide activity and event log ({filteredLogs.length} of {logs.length} activities)</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Filter className="w-4 h-4" />
          Filters
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search activities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Entity Type Filter */}
          <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Entity Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              <SelectItem value="rfq">RFQs</SelectItem>
              <SelectItem value="shipment">Shipments</SelectItem>
              <SelectItem value="user">Users</SelectItem>
              <SelectItem value="auth">Authentication</SelectItem>
              <SelectItem value="file">Files</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>

          {/* Action Type Filter */}
          <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Action Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
              <SelectItem value="rfq_created">RFQ Created</SelectItem>
              <SelectItem value="rfq_updated">RFQ Updated</SelectItem>
              <SelectItem value="rfq_status_changed">RFQ Status Changed</SelectItem>
              <SelectItem value="shipment_created">Shipment Created</SelectItem>
              <SelectItem value="shipment_updated">Shipment Updated</SelectItem>
              <SelectItem value="shipment_status_changed">Shipment Status</SelectItem>
              <SelectItem value="user_invited">User Invited</SelectItem>
              <SelectItem value="user_role_changed">Role Changed</SelectItem>
              <SelectItem value="user_dept_changed">Dept Changed</SelectItem>
              <SelectItem value="file_uploaded">File Upload</SelectItem>
              <SelectItem value="quotation_uploaded">Quotation Upload</SelectItem>
              <SelectItem value="message_sent">Message Sent</SelectItem>
            </SelectContent>
          </Select>

          {/* User Filter */}
          <Input
            placeholder="Filter by user email..."
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Activity List */}
      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{logs.length === 0 ? 'No activity logged yet' : 'No activities match your filters'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map(log => {
            const Icon = actionTypeIcons[log.action_type] || typeIcons[log.entity_type] || Activity;
            const badgeColor = actionTypeColors[log.action_type] || 'bg-gray-100 text-gray-700';
            
            return (
              <div key={log.id} className="bg-white rounded-xl p-5 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-[#D50000]/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-[#D50000]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap mb-1">
                    <p className="font-medium text-[#1A1A1A] text-sm">{log.action}</p>
                    {log.action_type && (
                      <Badge variant="secondary" className={`text-xs ${badgeColor}`}>
                        {log.action_type.replace(/_/g, ' ')}
                      </Badge>
                    )}
                    {log.entity_reference && (
                      <Badge variant="outline" className="text-xs font-mono">
                        {log.entity_reference}
                      </Badge>
                    )}
                  </div>
                  
                  {log.details && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{log.details}</p>
                  )}
                  
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="flex gap-2 mt-2 text-xs text-gray-500">
                      {log.metadata.old_value && log.metadata.new_value && (
                        <span className="bg-gray-50 px-2 py-1 rounded">
                          <span className="line-through text-red-600">{log.metadata.old_value}</span>
                          {' → '}
                          <span className="text-green-600">{log.metadata.new_value}</span>
                        </span>
                      )}
                      {log.metadata.file_name && (
                        <span className="bg-gray-50 px-2 py-1 rounded">
                          📎 {log.metadata.file_name}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    {log.performed_by_name && (
                      <span className="font-medium text-gray-600">{log.performed_by_name}</span>
                    )}
                    {log.performed_by && (
                      <span>({log.performed_by})</span>
                    )}
                    {log.performed_by_role && (
                      <Badge variant="outline" className="text-xs">
                        {log.performed_by_role}
                      </Badge>
                    )}
                    {log.created_date && (
                      <span className="ml-auto">{format(new Date(log.created_date), 'MMM d, yyyy HH:mm:ss')}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}