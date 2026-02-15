import React, { useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from 'framer-motion';

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, role: 'support', text: 'Hello! How can we help you today?' }
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    setMessages(prev => [
      ...prev,
      { id: Date.now(), role: 'user', text: message }
    ]);
    setMessage('');
    
    // Simulate support response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, role: 'support', text: 'Thanks for your message. A support agent will respond shortly.' }
      ]);
    }, 1000);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 w-96 bg-white rounded-2xl shadow-2xl flex flex-col h-96 z-40"
          >
            {/* Header */}
            <div className="bg-[#D50000] text-white p-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="font-semibold">Support Center</h3>
              <button onClick={() => setIsOpen(false)} className="hover:bg-[#B00000] p-1 rounded transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-[#D50000] text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-4 flex gap-2">
              <Input
                placeholder="Type message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="h-10"
              />
              <Button
                onClick={handleSend}
                size="icon"
                className="bg-[#D50000] hover:bg-[#B00000] h-10"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-[#D50000] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#B00000] transition-colors z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>
    </>
  );
}