import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, User, Clock, Users, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";

export default function PricingContactSales() {
  const [selectedSales, setSelectedSales] = useState(null);
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  const { data: salesUsers = [], isLoading: loadingSales } = useQuery({
    queryKey: ['sales-team'],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list('-created_date', 200);
      return allUsers.filter(u => u.department === 'sales');
    },
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['pricing-sales-messages', selectedSales?.id],
    queryFn: async () => {
      if (!selectedSales) return [];
      const allMessages = await base44.entities.Message.filter({
        entity_type: 'general',
        entity_id: `pricing-sales-${user?.id}-${selectedSales.id}`,
      }, 'created_date', 100);
      return allMessages;
    },
    enabled: !!selectedSales && !!user,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.Message.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-sales-messages', selectedSales?.id] });
      setMessage('');
    },
  });

  const handleSend = () => {
    if (!message.trim() || !selectedSales) return;

    sendMessageMutation.mutate({
      entity_type: 'general',
      entity_id: `pricing-sales-${user?.id}-${selectedSales.id}`,
      sender_name: user?.full_name || 'Pricing Team',
      sender_email: user?.email || '',
      sender_role: 'pricing',
      message: message,
      is_internal: false,
      attachments: [],
    });
  };

  useEffect(() => {
    if (salesUsers.length > 0 && !selectedSales) {
      setSelectedSales(salesUsers[0]);
    }
  }, [salesUsers]);

  if (loadingSales) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Contact Sales Team</h1>
        <p className="text-gray-500 text-sm mt-1">Communicate with sales team members</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sales Team List */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#D50000]" />
            Sales Team
          </h2>
          <div className="space-y-2">
            {salesUsers.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No sales team members available</p>
            ) : (
              salesUsers.map(sales => (
                <button
                  key={sales.id}
                  onClick={() => setSelectedSales(sales)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedSales?.id === sales.id
                      ? 'border-[#D50000] bg-red-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-green-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[#1A1A1A] truncate">
                        {sales.full_name || 'Sales Member'}
                      </p>
                      <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-1">
                        <Mail className="w-3 h-3" />
                        {sales.email}
                      </p>
                      {sales.phone && (
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3" />
                          {sales.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          {selectedSales ? (
            <Card className="h-full flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <p className="text-lg">{selectedSales.full_name || 'Sales Member'}</p>
                    <p className="text-sm text-gray-500 font-normal">{selectedSales.email}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50" style={{ maxHeight: '500px' }}>
                  {loadingMessages && <p className="text-center text-gray-400 text-sm">Loading messages...</p>}
                  {!loadingMessages && messages.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-8">No messages yet. Start the conversation!</p>
                  )}
                  {messages.map(msg => {
                    const isOwn = msg.sender_email === user?.email;
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] ${isOwn ? 'bg-[#D50000] text-white' : 'bg-white text-gray-800'} rounded-2xl px-4 py-3 shadow-sm`}>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-3 h-3" />
                            <span className="text-xs font-semibold">{msg.sender_name}</span>
                            <Badge variant="outline" className={`text-xs ${isOwn ? 'bg-white/20 border-white/40' : ''}`}>
                              {msg.sender_role}
                            </Badge>
                          </div>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                          <p className={`text-xs mt-2 flex items-center gap-1 ${isOwn ? 'text-white/60' : 'text-gray-400'}`}>
                            <Clock className="w-3 h-3" />
                            {format(new Date(msg.created_date), 'MMM d, HH:mm')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Input Area */}
                <div className="border-t p-4 bg-white space-y-3">
                  <Textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder={`Message ${selectedSales.full_name || 'sales'}...`}
                    className="min-h-[100px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSend}
                      disabled={!message.trim() || sendMessageMutation.isPending}
                      className="bg-[#D50000] hover:bg-[#B00000]"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {sendMessageMutation.isPending ? 'Sending...' : 'Send'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <p className="text-gray-400">Select a sales team member to start chatting</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}