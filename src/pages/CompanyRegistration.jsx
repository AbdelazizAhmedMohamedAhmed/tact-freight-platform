import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, Phone, ChevronRight, ChevronLeft, CheckCircle2, Globe, Briefcase } from 'lucide-react';

const INDUSTRIES = [
  'Manufacturing', 'Retail & E-commerce', 'Pharmaceuticals & Healthcare',
  'Food & Beverage', 'Automotive', 'Electronics & Technology',
  'Construction & Infrastructure', 'Oil, Gas & Energy', 'Chemicals',
  'Agriculture & Commodities', 'Textiles & Apparel', 'Aerospace & Defense', 'Other'
];

const COUNTRIES = [
  'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman',
  'Egypt', 'Jordan', 'Lebanon', 'Turkey', 'United States', 'United Kingdom',
  'Germany', 'France', 'Netherlands', 'China', 'India', 'Singapore',
  'Hong Kong', 'Japan', 'South Korea', 'Australia', 'Canada', 'Brazil', 'Other'
];

const steps = [
  { id: 1, label: 'Company', icon: Building2 },
  { id: 2, label: 'Location', icon: MapPin },
  { id: 3, label: 'Contact', icon: Phone },
];

export default function CompanyRegistration() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);

  const [form, setForm] = useState({
    name: '',
    industry: '',
    country: '',
    city: '',
    phone: '',
  });

  useEffect(() => {
    base44.auth.me()
      .then(u => {
        setUser(u);
        // If already has a company, skip registration
        if (u.company_id) {
          navigate(createPageUrl('ClientDashboard'));
        }
      })
      .catch(() => base44.auth.redirectToLogin(createPageUrl('CompanyRegistration')))
      .finally(() => setCheckingUser(false));
  }, []);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const canProceedStep1 = form.name.trim() && form.industry;
  const canProceedStep2 = form.country && form.city.trim();
  const canProceedStep3 = form.phone.trim();

  const handleSubmit = async () => {
    setLoading(true);
    const company = await base44.entities.ClientCompany.create({
      name: form.name.trim(),
      industry: form.industry,
      country: form.country,
      city: form.city.trim(),
      phone: form.phone.trim(),
      primary_contact_email: user.email,
      member_emails: [user.email],
    });
    await base44.auth.updateMe({ company_id: company.id, company_name: form.name.trim() });
    navigate(createPageUrl('ClientDashboard'));
  };

  if (checkingUser) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D50000] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-[#1A1A1A] via-[#0F0F0F] to-[#000000] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-32 right-0 w-80 h-80 bg-[#D50000]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-32 left-0 w-80 h-80 bg-[#D50000]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D50000] to-[#B00000] flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-black text-xl tracking-tight">TACT FREIGHT</span>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-black text-white leading-tight">
                Set Up Your<br />
                <span className="text-[#D50000]">Company Profile</span>
              </h1>
              <p className="text-white/60 mt-4 text-lg leading-relaxed">
                Complete your company details to unlock full access to quotes, shipment tracking, and your logistics dashboard.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              {[
                { icon: Briefcase, text: 'Personalised freight quotes' },
                { icon: Globe, text: 'Real-time shipment tracking' },
                { icon: CheckCircle2, text: 'Dedicated account team' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[#D50000]" />
                  </div>
                  <span className="text-white/70 text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step indicators */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            {steps.map((s, i) => (
              <React.Fragment key={s.id}>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${step >= s.id ? 'bg-[#D50000]/20' : 'bg-white/5'}`}>
                  <s.icon className={`w-4 h-4 ${step >= s.id ? 'text-[#D50000]' : 'text-white/30'}`} />
                  <span className={`text-xs font-semibold ${step >= s.id ? 'text-white' : 'text-white/30'}`}>{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-px ${step > s.id ? 'bg-[#D50000]/40' : 'bg-white/10'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-white/30 text-xs mt-4">Step {step} of {steps.length}</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-[#F8F8F8] flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D50000] to-[#B00000] flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="text-[#1A1A1A] font-black text-lg">TACT FREIGHT</span>
          </div>

          {/* Mobile step bar */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            {steps.map(s => (
              <div key={s.id} className={`h-1.5 flex-1 rounded-full transition-all ${step >= s.id ? 'bg-[#D50000]' : 'bg-gray-200'}`} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                <div className="mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#D50000]/10 flex items-center justify-center mb-4">
                    <Building2 className="w-6 h-6 text-[#D50000]" />
                  </div>
                  <h2 className="text-2xl font-black text-[#1A1A1A]">Your Company</h2>
                  <p className="text-gray-500 mt-1">Tell us about the business you represent</p>
                </div>
                <div className="space-y-5">
                  <div>
                    <Label className="text-sm font-semibold text-[#1A1A1A] mb-2 block">Company Name <span className="text-[#D50000]">*</span></Label>
                    <Input
                      value={form.name}
                      onChange={e => update('name', e.target.value)}
                      placeholder="e.g. Acme Trading Co."
                      className="h-12 bg-white border-gray-200 focus:border-[#D50000] focus:ring-[#D50000]/20 text-[#1A1A1A] rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-[#1A1A1A] mb-2 block">Industry <span className="text-[#D50000]">*</span></Label>
                    <Select value={form.industry} onValueChange={v => update('industry', v)}>
                      <SelectTrigger className="h-12 bg-white border-gray-200 rounded-xl">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className="w-full mt-8 h-12 bg-[#D50000] hover:bg-[#B00000] text-white font-semibold rounded-xl text-base"
                >
                  Continue <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                <div className="mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#D50000]/10 flex items-center justify-center mb-4">
                    <MapPin className="w-6 h-6 text-[#D50000]" />
                  </div>
                  <h2 className="text-2xl font-black text-[#1A1A1A]">Location</h2>
                  <p className="text-gray-500 mt-1">Where is your company based?</p>
                </div>
                <div className="space-y-5">
                  <div>
                    <Label className="text-sm font-semibold text-[#1A1A1A] mb-2 block">Country <span className="text-[#D50000]">*</span></Label>
                    <Select value={form.country} onValueChange={v => update('country', v)}>
                      <SelectTrigger className="h-12 bg-white border-gray-200 rounded-xl">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-[#1A1A1A] mb-2 block">City <span className="text-[#D50000]">*</span></Label>
                    <Input
                      value={form.city}
                      onChange={e => update('city', e.target.value)}
                      placeholder="e.g. Dubai"
                      className="h-12 bg-white border-gray-200 focus:border-[#D50000] rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <Button onClick={() => setStep(1)} variant="outline" className="flex-1 h-12 rounded-xl border-gray-200">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button onClick={() => setStep(3)} disabled={!canProceedStep2} className="flex-1 h-12 bg-[#D50000] hover:bg-[#B00000] text-white font-semibold rounded-xl">
                    Continue <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                <div className="mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#D50000]/10 flex items-center justify-center mb-4">
                    <Phone className="w-6 h-6 text-[#D50000]" />
                  </div>
                  <h2 className="text-2xl font-black text-[#1A1A1A]">Contact Details</h2>
                  <p className="text-gray-500 mt-1">How should we reach your company?</p>
                </div>

                {/* Summary */}
                <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Summary</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-[#D50000] flex-shrink-0" />
                    <span className="font-semibold text-[#1A1A1A]">{form.name}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-500">{form.industry}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-[#D50000] flex-shrink-0" />
                    <span className="text-gray-600">{form.city}, {form.country}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-[#1A1A1A] mb-2 block">Phone Number <span className="text-[#D50000]">*</span></Label>
                  <Input
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                    placeholder="e.g. +971 50 123 4567"
                    className="h-12 bg-white border-gray-200 focus:border-[#D50000] rounded-xl"
                  />
                </div>

                <div className="flex gap-3 mt-8">
                  <Button onClick={() => setStep(2)} variant="outline" className="flex-1 h-12 rounded-xl border-gray-200">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button onClick={handleSubmit} disabled={!canProceedStep3 || loading} className="flex-1 h-12 bg-[#D50000] hover:bg-[#B00000] text-white font-semibold rounded-xl">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Setting up...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" /> Complete Setup
                      </span>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-gray-400 text-center mt-4">
                  You can update these details anytime in your profile settings
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}