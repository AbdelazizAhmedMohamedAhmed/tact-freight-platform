import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Lock, CheckCircle2, Building2 } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Company details state
  const [companyName, setCompanyName] = useState('');
  const [companyCountry, setCompanyCountry] = useState('');
  const [companyCity, setCompanyCity] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [savingCompany, setSavingCompany] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(async userData => {
        setUser(userData);
        setFullName(userData.full_name || '');
        setEmail(userData.email || '');
        setPhone(userData.phone || '');
        // Load existing company if any
        setCompanyName(userData.company_name || '');
        setCompanyCountry(userData.company_country || '');
        setCompanyCity(userData.company_city || '');
        setCompanyPhone(userData.company_phone || '');
        setCompanyWebsite(userData.company_website || '');
        setCompanyAddress(userData.company_address || '');
        setCompanyIndustry(userData.company_industry || '');
        setLoading(false);
      })
      .catch(() => base44.auth.redirectToLogin());
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage('Name cannot be empty');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Email cannot be empty');
      return;
    }

    setUpdating(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await base44.auth.updateMe({ 
        full_name: fullName,
        email: email,
        phone: phone 
      });
      
      // Refresh user data
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
      
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters');
      return;
    }

    setChangingPassword(true);

    try {
      await base44.auth.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setSuccessMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to change password. Please check your current password.');
    } finally {
      setChangingPassword(false);
    }
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
        <h1 className="text-2xl font-bold text-[#1A1A1A]">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account settings</p>
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

      {/* Profile Information */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b">
          <div className="w-16 h-16 rounded-full bg-[#D50000] flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-lg font-bold text-[#1A1A1A]">Profile Information</p>
            <p className="text-sm text-gray-500 mt-1">Update your personal details</p>
          </div>
        </div>

        <form onSubmit={handleProfileUpdate} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-12"
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
              placeholder="your.email@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <Button
            type="submit"
            disabled={updating || (fullName === user?.full_name && email === user?.email && phone === user?.phone)}
            className="bg-[#D50000] hover:bg-[#B00000] h-12 w-full"
          >
            {updating ? 'Updating...' : 'Update Profile'}
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
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-12"
              placeholder="Enter current password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-12"
              placeholder="Enter new password (min 8 characters)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12"
              placeholder="Confirm new password"
            />
          </div>

          <Button
            type="submit"
            disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
            className="bg-[#D50000] hover:bg-[#B00000] h-12 w-full"
          >
            {changingPassword ? 'Changing...' : 'Change Password'}
          </Button>
        </form>
      </div>
    </div>
  );
}