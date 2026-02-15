import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function InternalChat({ shipment }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const { data: messages = [], refetch } = useQuery({
    queryKey: ['shipment-internal-messages', shipment?.id],
    queryFn: () => base44.entities.Message.filter({ 
      entity_id: shipment.id, 
      entity_type: 'shipment',
      is_internal: true 
    }, '-created_date', 50),
    enabled: !!shipment?.id,
  });

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    try {
      const user = await base44.auth.me();
      
      await base44.entities.Message.create({
        entity_type: 'shipment',
        entity_id: shipment.id,
        sender_name: user.full_name,
        sender_email: user.email,
        sender_role: 'operations',
        message: message,
        is_internal: true,
      });

      setMessage('');
      refetch();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-96 bg-white rounded-lg border border-gray-200">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">No messages yet</p>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="flex items-start gap-2">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-700">{msg.sender_name}</p>
                <p className="text-sm text-gray-600 bg-gray-50 rounded px-3 py-2 mt-1">
                  {msg.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(msg.created_date).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-gray-200 p-3 flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type message..."
          className="h-9"
        />
        <Button
          type="submit"
          disabled={sending || !message.trim()}
          size="icon"
          className="bg-[#D50000] hover:bg-[#B00000] h-9"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}