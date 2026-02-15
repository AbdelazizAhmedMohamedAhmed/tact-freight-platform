import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Save, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ClientPreferences() {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const prefs = await base44.entities.NotificationPreferences.filter({ user_email: currentUser.email });
      
      if (prefs.length > 0) {
        setPreferences(prefs[0]);
      } else {
        // Create default preferences
        const newPrefs = await base44.entities.NotificationPreferences.create({
          user_email: currentUser.email,
          rfq_status_updates: true,
          shipment_status_updates: true,
          quotation_received: true,
          new_messages: true,
          notification_method: 'email',
          phone_number: currentUser.phone || '',
        });
        setPreferences(newPrefs);
      }
    } catch (error) {
      toast.error('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.NotificationPreferences.update(preferences.id, preferences);
      setSaved(true);
      toast.success('Preferences saved successfully');
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const updatePref = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D50000]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A1A1A] flex items-center gap-3">
          <Bell className="w-8 h-8 text-[#D50000]" />
          Notification Preferences
        </h1>
        <p className="text-gray-600 mt-2">Manage how you receive updates about your shipments and quotes</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
        {/* Notification Types */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">Notification Types</h2>
          
          <div className="flex items-center justify-between py-4 border-b">
            <div>
              <p className="font-medium text-[#1A1A1A]">RFQ Status Updates</p>
              <p className="text-sm text-gray-500">Get notified when your RFQ status changes</p>
            </div>
            <Switch 
              checked={preferences?.rfq_status_updates} 
              onCheckedChange={(v) => updatePref('rfq_status_updates', v)}
            />
          </div>

          <div className="flex items-center justify-between py-4 border-b">
            <div>
              <p className="font-medium text-[#1A1A1A]">Shipment Status Updates</p>
              <p className="text-sm text-gray-500">Get notified when your shipment status changes</p>
            </div>
            <Switch 
              checked={preferences?.shipment_status_updates} 
              onCheckedChange={(v) => updatePref('shipment_status_updates', v)}
            />
          </div>

          <div className="flex items-center justify-between py-4 border-b">
            <div>
              <p className="font-medium text-[#1A1A1A]">Quotation Ready</p>
              <p className="text-sm text-gray-500">Get notified when your quotation is ready</p>
            </div>
            <Switch 
              checked={preferences?.quotation_received} 
              onCheckedChange={(v) => updatePref('quotation_received', v)}
            />
          </div>

          <div className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-[#1A1A1A]">New Messages</p>
              <p className="text-sm text-gray-500">Get notified when you receive new messages</p>
            </div>
            <Switch 
              checked={preferences?.new_messages} 
              onCheckedChange={(v) => updatePref('new_messages', v)}
            />
          </div>
        </div>

        {/* Notification Method */}
        <div className="space-y-4 pt-6 border-t">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">Notification Method</h2>
          
          <div className="space-y-2">
            <Label>How would you like to receive notifications?</Label>
            <Select 
              value={preferences?.notification_method} 
              onValueChange={(v) => updatePref('notification_method', v)}
            >
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email Only</SelectItem>
                <SelectItem value="sms">SMS Only (Coming Soon)</SelectItem>
                <SelectItem value="both">Both Email & SMS (Coming Soon)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(preferences?.notification_method === 'sms' || preferences?.notification_method === 'both') && (
            <div className="space-y-2">
              <Label>Phone Number for SMS</Label>
              <Input 
                type="tel" 
                placeholder="+20 xxx xxx xxxx"
                className="h-12"
                value={preferences?.phone_number || ''}
                onChange={(e) => updatePref('phone_number', e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6 border-t">
          <Button 
            onClick={handleSave} 
            disabled={saving || saved}
            className="bg-[#D50000] hover:bg-[#B00000] h-12 px-8"
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Saved
              </>
            ) : saving ? (
              'Saving...'
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}