import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import WhatsAppButton from '../components/shared/WhatsAppButton';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s+\-()]+$/.test(form.phone) || form.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!form.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!form.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!form.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (form.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: 'operation@tactfreight.com',
      subject: `Contact Form: ${form.subject}`,
      body: `Name: ${form.name}\nCompany: ${form.company}\nEmail: ${form.email}\nPhone: ${form.phone}\n\nSubject: ${form.subject}\n\nMessage:\n${form.message}`,
    });
    setForm({ name: '', email: '', phone: '', company: '', subject: '', message: '' });
    setSent(true);
    setSending(false);
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div>
      <section className="relative py-32 bg-[#1A1A1A]">
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <span className="text-[#D50000] text-sm font-semibold uppercase tracking-widest">Contact</span>
          <h1 className="text-4xl md:text-6xl font-black text-white mt-4">Get In Touch</h1>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-[#1A1A1A]">Tact Freight</h3>
                <p className="mt-3 text-gray-500 leading-relaxed">
                  Reach out to our team for any inquiry about our services, pricing, or partnership opportunities.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#D50000]/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#D50000]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A1A1A]">Address</p>
                    <p className="text-gray-500 text-sm mt-1">29 Ahmad Kassem Gouda St., Nasr City, Cairo 11371, Egypt</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#D50000]/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#D50000]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A1A1A]">Phone</p>
                    <p className="text-gray-500 text-sm mt-1">(202) 4042643</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#D50000]/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#D50000]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A1A1A]">Email</p>
                    <p className="text-gray-500 text-sm mt-1">operation@tactfreight.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#D50000]/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#D50000]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A1A1A]">Working Hours</p>
                    <p className="text-gray-500 text-sm mt-1">Sun – Thu: 9:00 AM – 5:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              {sent ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0 }}
                  className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center py-20"
                >
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                  <h3 className="text-2xl font-bold text-[#1A1A1A] mt-6">Message Sent Successfully!</h3>
                  <p className="text-gray-600 mt-2">Thank you for contacting us. Our team will get back to you within 24 hours.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-[#F2F2F2] rounded-2xl p-8 space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Full Name *</Label>
                      <Input 
                        placeholder="Your name" 
                        className={`bg-white border-0 h-12 ${errors.name ? 'ring-2 ring-red-500' : ''}`}
                        value={form.name} 
                        onChange={e => { setForm({...form, name: e.target.value}); if (errors.name) setErrors({...errors, name: ''}) }} 
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Email *</Label>
                      <Input 
                        type="email" 
                        placeholder="your@email.com" 
                        className={`bg-white border-0 h-12 ${errors.email ? 'ring-2 ring-red-500' : ''}`}
                        value={form.email} 
                        onChange={e => { setForm({...form, email: e.target.value}); if (errors.email) setErrors({...errors, email: ''}) }} 
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Phone *</Label>
                      <Input 
                        placeholder="+20 xxx xxx xxxx" 
                        className={`bg-white border-0 h-12 ${errors.phone ? 'ring-2 ring-red-500' : ''}`}
                        value={form.phone} 
                        onChange={e => { setForm({...form, phone: e.target.value}); if (errors.phone) setErrors({...errors, phone: ''}) }} 
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Company Name *</Label>
                      <Input 
                        placeholder="Your company" 
                        className={`bg-white border-0 h-12 ${errors.company ? 'ring-2 ring-red-500' : ''}`}
                        value={form.company} 
                        onChange={e => { setForm({...form, company: e.target.value}); if (errors.company) setErrors({...errors, company: ''}) }} 
                      />
                      {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Subject *</Label>
                    <Input 
                      placeholder="How can we help?" 
                      className={`bg-white border-0 h-12 ${errors.subject ? 'ring-2 ring-red-500' : ''}`}
                      value={form.subject} 
                      onChange={e => { setForm({...form, subject: e.target.value}); if (errors.subject) setErrors({...errors, subject: ''}) }} 
                    />
                    {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Message *</Label>
                    <Textarea 
                      placeholder="Tell us about your requirements..." 
                      className={`bg-white border-0 min-h-[150px] ${errors.message ? 'ring-2 ring-red-500' : ''}`}
                      value={form.message} 
                      onChange={e => { setForm({...form, message: e.target.value}); if (errors.message) setErrors({...errors, message: ''}) }} 
                    />
                    {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                  </div>
                  <Button type="submit" disabled={sending} className="w-full bg-[#D50000] hover:bg-[#B00000] text-white h-12 font-semibold">
                    {sending ? 'Sending...' : 'Send Message'}
                    <Send className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
      <WhatsAppButton />
    </div>
  );
}