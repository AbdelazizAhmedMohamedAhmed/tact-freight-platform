import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, Download, Calendar } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ClientSupport() {
  const [activeTab, setActiveTab] = useState('tickets');
  const [newTicket, setNewTicket] = useState({ subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['support-messages'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Message.filter({ sender_email: user.email }, '-created_date', 100);
    }
  });

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.subject || !newTicket.message) return;

    setSubmitting(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.Message.create({
        entity_type: 'rfq',
        entity_id: 'support',
        sender_name: user.full_name,
        sender_email: user.email,
        sender_role: 'client',
        message: `[SUPPORT] ${newTicket.subject}\n\n${newTicket.message}`,
        is_internal: false
      });

      setNewTicket({ subject: '', message: '' });
      alert('Support ticket submitted successfully!');
    } catch (error) {
      console.error('Error submitting ticket:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Support Center</h1>
        <p className="text-gray-500 text-sm mt-1">Get help and manage your support tickets</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="contact">Contact Us</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === 'tickets' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Submit New Ticket */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-[#1A1A1A]">Submit New Ticket</h3>
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief description"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    value={newTicket.message}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Describe your issue"
                    className="min-h-32"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting || !newTicket.subject || !newTicket.message}
                  className="w-full bg-[#D50000] hover:bg-[#B00000]"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Ticket
                </Button>
              </form>
            </div>
          </div>

          {/* Recent Tickets */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-[#1A1A1A] mb-4">Recent Communication</h3>
              {isLoading ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {messages.length > 0 ? (
                    messages.map((msg) => (
                      <div key={msg.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-[#1A1A1A] text-sm">{msg.message.substring(0, 50)}...</p>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(msg.created_date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{msg.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">No support tickets yet</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'faq' && (
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { q: 'How long does RFQ processing take?', a: 'Usually 24-48 hours for initial review and quotation.' },
            { q: 'What documents do I need to provide?', a: 'Commercial invoice, packing list, and product photos typically required.' },
            { q: 'Can I track my shipment in real-time?', a: 'Yes, all shipments have real-time tracking available in your dashboard.' },
            { q: 'What payment methods do you accept?', a: 'We accept bank transfers, credit cards, and other standard payment methods.' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-6">
              <h4 className="font-semibold text-[#1A1A1A] mb-2">{item.q}</h4>
              <p className="text-gray-600 text-sm">{item.a}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'contact' && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <MessageCircle className="w-8 h-8 text-[#D50000] mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Live Chat</h3>
            <p className="text-gray-600 text-sm mb-4">Available 24/7 for quick support</p>
            <Button variant="outline" size="sm">Start Chat</Button>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <MessageCircle className="w-8 h-8 text-[#D50000] mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Email</h3>
            <p className="text-gray-600 text-sm mb-4">support@tactfreight.com</p>
            <Button variant="outline" size="sm">Send Email</Button>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <MessageCircle className="w-8 h-8 text-[#D50000] mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Phone</h3>
            <p className="text-gray-600 text-sm mb-4">+20 2 040 426 43</p>
            <Button variant="outline" size="sm">Call Now</Button>
          </div>
        </div>
      )}
    </div>
  );
}