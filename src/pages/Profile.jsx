import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Lock, CheckCircle2, Building2, Users } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { createAndLinkCompany } from '../components/utils/companyResolver';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [updating, setUpdating] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Company state
  const [companyName, setCompanyName] = useState('');
  const [companyCountry, setCompanyCountry] = useState('');
  const [companyCity, setCompanyCity] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [savingCompany, setSavingCompany] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    base44.auth.me()
      .then(async userData => {
        setUser(userData);
        setFullName(userData.full_name || '');
        setPhone(userData.phone || '');

        if (userData.company_id) {
          const results = await base44.entities.ClientCompany.filter({ id: userData.company_id }, '', 1);
          if (results[0]) {
            const c = results[0];
            setCompany(c);
            setCompanyName(c.name || '');
            setCompanyCountry(c.country || '');
            setCompanyCity(c.city || '');
            setCompanyPhone(c.phone || '');
            setCompanyWebsite(c.website || '');
            setCompanyAddress(c.address || '');
            setCompanyIndustry(c.industry || '');
          }
        }
        setLoading(false);
      })
      .catch(() => base44.auth.redirectToLogin());
  }, []);

  const showSuccess = (msg) => {
    setErrorMessage('');
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) { setErrorMessage('Name cannot be empty'); return; }
    setUpdating(true);
    setErrorMessage('');
    await base44.auth.updateMe({ full_name: fullName, phone });
    const updatedUser = await base44.auth.me();
    setUser(updatedUser);
    setUpdating(false);
    showSuccess('Profile updated successfully!');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('All password fields are required'); return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match'); return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters'); return;
    }
    setChangingPassword(true);
    try {
      await base44.auth.changePassword({ current_password: currentPassword, new_password: newPassword });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      showSuccess('Password changed successfully!');
    } catch {
      setErrorMessage('Failed to change password. Please check your current password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCompanySave = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) { setErrorMessage('Company name is required'); return; }
    setSavingCompany(true);
    setErrorMessage('');

    const companyData = {
      name: companyName,
      country: companyCountry,
      city: companyCity,
      phone: companyPhone,
      website: companyWebsite,
      address: companyAddress,
      industry: companyIndustry,
    };

    if (company) {
      // Update existing
      await base44.entities.ClientCompany.update(company.id, companyData);
      setCompany({ ...company, ...companyData });
    } else {
      // Create new company and link user
      const newCompany = await createAndLinkCompany(user, companyData);
      setCompany(newCompany);
      const refreshed = await base44.auth.me();
      setUser(refreshed);
    }
    setSavingCompany(false);
    showSuccess('Company details saved!');
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">My Account</h1>
        <p className="text-gray-500 text-sm mt-1">
          {company ? (
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              {company.name}
            </span>
          ) : 'Manage your account and company settings'}
        </p>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Profile */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b">
          <div className="w-16 h-16 rounded-full bg-[#D50000] flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-lg font-bold text-[#1A1A1A]">Profile Information</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
        <form onSubmit={handleProfileUpdate} className="space-y-5">
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} className="h-12" placeholder="Your full name" />
          </div>
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input value={user?.email} disabled className="h-12 bg-gray-50 text-gray-500" />
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="h-12" placeholder="+1 (555) 123-4567" />
          </div>
          <Button type="submit" disabled={updating} className="bg-[#D50000] hover:bg-[#B00000] h-12 w-full">
            {updating ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>
      </div>

      {/* Company */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-3 mb-8 pb-8 border-b">
          <Building2 className="w-6 h-6 text-[#D50000]" />
          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A]">
              {company ? 'Company Details' : 'Register Your Company'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {company
                ? 'All users linked to this company share the same RFQs and shipments'
                : 'Create your company profile — colleagues can be linked to the same company'}
            </p>
          </div>
        </div>

        {company && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-800">Company Account</p>
              <p className="text-xs text-blue-600 mt-0.5">
                Multiple users can be linked to <strong>{company.name}</strong>. All your team's RFQs and shipments are shared under this company.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleCompanySave} className="space-y-4">
          <div className="space-y-2">
            <Label>Company Name *</Label>
            <Input value={companyName} onChange={e => setCompanyName(e.target.value)} className="h-12" placeholder="Your company name" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Country</Label>
              <Input value={companyCountry} onChange={e => setCompanyCountry(e.target.value)} className="h-12" placeholder="e.g. United Arab Emirates" />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={companyCity} onChange={e => setCompanyCity(e.target.value)} className="h-12" placeholder="e.g. Dubai" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Company Phone</Label>
              <Input type="tel" value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} className="h-12" placeholder="+971 4 123 4567" />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input value={companyWebsite} onChange={e => setCompanyWebsite(e.target.value)} className="h-12" placeholder="https://yourcompany.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Industry</Label>
            <Input value={companyIndustry} onChange={e => setCompanyIndustry(e.target.value)} className="h-12" placeholder="e.g. Manufacturing, Retail, Oil & Gas" />
          </div>
          <div className="space-y-2">
            <Label>Full Address</Label>
            <Textarea value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} className="min-h-[80px]" placeholder="Street address, building, P.O. Box..." />
          </div>
          <Button type="submit" disabled={savingCompany} className="bg-[#D50000] hover:bg-[#B00000] h-12 w-full">
            {savingCompany ? 'Saving...' : company ? 'Save Changes' : 'Create Company'}
          </Button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-3 mb-8 pb-8 border-b">
          <Lock className="w-6 h-6 text-[#D50000]" />
          <h2 className="text-lg font-bold text-[#1A1A1A]">Change Password</h2>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="h-12" placeholder="Enter current password" />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="h-12" placeholder="Min 8 characters" />
          </div>
          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="h-12" placeholder="Confirm new password" />
          </div>
          <Button type="submit" disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword} className="bg-[#D50000] hover:bg-[#B00000] h-12 w-full">
            {changingPassword ? 'Changing...' : 'Change Password'}
          </Button>
        </form>
      </div>
    </div>
  );
}