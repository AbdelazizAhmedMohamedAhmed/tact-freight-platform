import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { resolveOrCreateCompany } from '../components/utils/companyResolver';

const INDUSTRIES = [
  'Manufacturing',
  'Retail & E-commerce',
  'Automotive',
  'Electronics',
  'Pharmaceuticals',
  'Food & Beverage',
  'Textiles & Apparel',
  'Construction Materials',
  'Chemicals',
  'Energy & Oil',
  'Agriculture',
  'Technology',
  'Healthcare',
  'Other'
];

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'China', 'Japan',
  'India', 'Australia', 'Brazil', 'Mexico', 'Spain', 'Italy', 'Netherlands',
  'Singapore', 'Hong Kong', 'United Arab Emirates', 'Saudi Arabia', 'South Korea',
  'Malaysia', 'Thailand', 'Indonesia', 'Vietnam', 'Philippines', 'Other'
];

export default function Register() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  const [formData, setFormData] = useState({
    company_name: '',
    industry: '',
    country: '',
    city: '',
    phone: '',
  });

  useEffect(() => {
    base44.auth.me()
      .then(async (userData) => {
        setUser(userData);
        
        // Check if user already has a company
        if (userData.company_id) {
          const companies = await base44.entities.ClientCompany.filter({ id: userData.company_id });
          if (companies.length > 0) {
            // Already registered, redirect to portal
            navigate(createPageUrl('Portal'));
            return;
          }
        }
        
        setLoading(false);
      })
      .catch(() => {
        // Not logged in, redirect to login
        base44.auth.redirectToLogin(createPageUrl('Register'));
      });
  }, [navigate]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.company_name || !formData.industry || !formData.country || !formData.city || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      // Create or link company
      const companyId = await resolveOrCreateCompany({
        company_name: formData.company_name,
        email: user.email,
        industry: formData.industry,
        country: formData.country,
        city: formData.city,
        phone: formData.phone,
      });

      // Update user with company_id
      await base44.auth.updateMe({
        company_id: companyId,
        company_name: formData.company_name,
      });

      setCompleted(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(createPageUrl('Portal'));
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to complete registration. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F2F2F2] to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D50000] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Registration Complete!</h2>
          <p className="text-gray-600">Redirecting you to your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1A1A] via-gray-900 to-black py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1 pb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D50000] to-[#B00000] flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-black text-center">Complete Your Registration</CardTitle>
            <CardDescription className="text-center text-base">
              Welcome, <span className="font-semibold text-[#D50000]">{user?.full_name}</span>! Tell us about your company to get started.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => handleChange('company_name', e.target.value)}
                    placeholder="Enter your company name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Select value={formData.industry} onValueChange={(val) => handleChange('industry', val)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map(ind => (
                        <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select value={formData.country} onValueChange={(val) => handleChange('country', val)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Enter city"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(createPageUrl('Portal'))}
                  className="flex-1"
                  disabled={submitting}
                >
                  Skip for Now
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#D50000] to-[#B00000] hover:shadow-lg"
                  disabled={submitting}
                >
                  {submitting ? (
                    'Saving...'
                  ) : (
                    <>
                      Complete Registration <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-400 mt-6">
          By completing registration, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}