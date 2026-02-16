import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Send, Paperclip, FileText, User, Clock, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { logActivity } from '../utils/activityLogger';
import { hasPermission, filterMessages } from '@/components/utils/permissions';
import { logActivity } from '@/components/utils/activityLogger';

export default function MessageThread({ entityType, entityId, userRole = 'client' }) {
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', entityType, entityId],
    queryFn: () => base44.entities.Message.filter({ entity_type: entityType, entity_id: entityId }, 'created_date', 500),
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.Message.create(data),
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', entityType, entityId] });
      
      await logActivity({
        action: `Message sent on ${entityType} ${entityId}`,
        actionType: 'message_sent',
        entityType: entityType === 'rfq' ? 'rfq' : 'shipment',
        entityId: entityId,
        details: variables.is_internal ? 'Internal message sent' : 'Message sent to client',
        metadata: { is_internal: variables.is_internal }
      });
      
      setNewMessage('');
      setAttachments([]);
      setIsInternal(false);
    },
  });

  const handleFileUpload = async (e) => {
    setUploading(true);
    const uploaded = [];
    for (const file of e.target.files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploaded.push(file_url);
    }
    setAttachments(prev => [...prev, ...uploaded]);
    setUploading(false);
  };

  const handleSend = () => {
    if (!newMessage.trim() && attachments.length === 0) return;
    sendMessageMutation.mutate({
      entity_type: entityType,
      entity_id: entityId,
      sender_name: user?.full_name || 'Unknown',
      sender_email: user?.email || '',
      sender_role: userRole,
      message: newMessage,
      is_internal: isInternal,
      attachments,
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const visibleMessages = filterMessages(messages, userRole);

  const canCreateInternal = hasPermission(userRole, 'messages', 'createInternal');

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-t-xl" style={{ maxHeight: '400px' }}>
        {isLoading && <p className="text-center text-gray-400 text-sm">Loading messages...</p>}
        {!isLoading && visibleMessages.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">No messages yet. Start the conversation!</p>
        )}
        {visibleMessages.map(msg => {
          const isOwn = msg.sender_email === user?.email;
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${isOwn ? 'bg-[#D50000] text-white' : 'bg-white text-gray-800'} rounded-2xl px-4 py-3 shadow-sm`}>
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-3 h-3" />
                  <span className="text-xs font-semibold">{msg.sender_name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${isOwn ? 'bg-white/20' : 'bg-gray-100'}`}>
                    {msg.sender_role}
                  </span>
                  {msg.is_internal && (
                    <Lock className="w-3 h-3 text-yellow-500" title="Internal message" />
                  )}
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                {msg.attachments?.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {msg.attachments.map((att, i) => (
                      <a key={i} href={att} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 text-xs ${isOwn ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>
                        <FileText className="w-3 h-3" /> Attachment {i + 1}
                      </a>
                    ))}
                  </div>
                )}
                <p className={`text-xs mt-2 flex items-center gap-1 ${isOwn ? 'text-white/60' : 'text-gray-400'}`}>
                  <Clock className="w-3 h-3" />
                  {format(new Date(msg.created_date), 'MMM d, HH:mm')}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t p-4 rounded-b-xl space-y-3">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((att, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg text-xs">
                <FileText className="w-3 h-3 text-[#D50000]" />
                File {i + 1}
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[80px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <input type="file" multiple onChange={handleFileUpload} className="hidden" id={`attach-${entityId}`} disabled={uploading} />
            <label htmlFor={`attach-${entityId}`}>
              <Button variant="outline" size="sm" asChild disabled={uploading}>
                <span><Paperclip className="w-4 h-4 mr-2" />{uploading ? 'Uploading...' : 'Attach'}</span>
              </Button>
            </label>
            {canCreateInternal && (
              <div className="flex items-center gap-2">
                <Switch id={`internal-${entityId}`} checked={isInternal} onCheckedChange={setIsInternal} />
                <Label htmlFor={`internal-${entityId}`} className="text-xs cursor-pointer flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Internal
                </Label>
              </div>
            )}
          </div>
          <Button 
            onClick={handleSend} 
            disabled={(!newMessage.trim() && attachments.length === 0) || sendMessageMutation.isPending}
            className="bg-[#D50000] hover:bg-[#B00000]"
          >
            <Send className="w-4 h-4 mr-2" />
            {sendMessageMutation.isPending ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
}