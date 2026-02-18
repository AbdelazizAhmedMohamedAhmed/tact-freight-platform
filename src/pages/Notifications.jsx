import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Trash2, ExternalLink, Ship, FileText, MessageSquare, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const typeIcons = {
  rfq_assigned: FileText,
  shipment_update: Ship,
  message_received: MessageSquare,
  general: Info,
};

const typeColors = {
  rfq_assigned: 'bg-blue-100 text-blue-600',
  shipment_update: 'bg-green-100 text-green-600',
  message_received: 'bg-purple-100 text-purple-600',
  general: 'bg-gray-100 text-gray-600',
};

export default function Notifications() {
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['all-notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ recipient_email: user.email }, '-created_date', 200),
    enabled: !!user?.email,
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries(['all-notifications']),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['all-notifications']),
  });

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    queryClient.invalidateQueries(['all-notifications']);
  };

  const filtered = filter === 'unread' ? notifications.filter(n => !n.is_read) : notifications;
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#D50000]/10 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#D50000]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Notifications</h1>
            <p className="text-gray-500 text-sm">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="w-4 h-4 mr-2" /> Mark all read
          </Button>
        )}
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">
            Unread {unreadCount > 0 && <Badge className="ml-1.5 bg-[#D50000] text-white text-xs px-1.5">{unreadCount}</Badge>}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
          <Bell className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No notifications</p>
          <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(n => {
            const Icon = typeIcons[n.type] || Info;
            const colorClass = typeColors[n.type] || 'bg-gray-100 text-gray-600';
            return (
              <div
                key={n.id}
                className={`bg-white rounded-xl shadow-sm p-4 flex items-start gap-4 transition-all ${!n.is_read ? 'border-l-4 border-[#D50000]' : 'border border-gray-100'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-semibold text-sm ${!n.is_read ? 'text-[#1A1A1A]' : 'text-gray-700'}`}>{n.title}</p>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {n.created_date ? format(new Date(n.created_date), 'MMM d, h:mm a') : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                  {n.entity_reference && (
                    <span className="text-xs font-mono text-gray-400 mt-1 block">{n.entity_reference}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {n.action_url && (
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0"
                      onClick={() => { markReadMutation.mutate(n.id); window.location.href = n.action_url; }}>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                    </Button>
                  )}
                  {!n.is_read && (
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => markReadMutation.mutate(n.id)}>
                      <CheckCheck className="w-3.5 h-3.5 text-green-600" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => deleteMutation.mutate(n.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}