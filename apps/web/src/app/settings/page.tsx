'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Key, Bell, Palette, Save, CheckCircle } from 'lucide-react';

interface BusinessProfile {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  businessDescription: string;
  businessLogo?: string;
}

interface IntegrationSettings {
  whatsappPhoneNumberId: string;
  whatsappAccessToken: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  googleCalendarEnabled: boolean;
  googleClientId: string;
  googleClientSecret: string;
}

const settingsApi = {
  getProfile: async (): Promise<BusinessProfile> => {
    const res = await fetch('/api/settings/profile');
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },
  updateProfile: async (data: BusinessProfile) => {
    const res = await fetch('/api/settings/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },
  getIntegrations: async (): Promise<IntegrationSettings> => {
    const res = await fetch('/api/settings/integrations');
    if (!res.ok) throw new Error('Failed to fetch integrations');
    return res.json();
  },
  updateIntegrations: async (data: IntegrationSettings) => {
    const res = await fetch('/api/settings/integrations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update integrations');
    return res.json();
  },
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'integrations' | 'notifications'>('profile');
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['settings', 'profile'],
    queryFn: settingsApi.getProfile,
  });

  const { data: integrations } = useQuery({
    queryKey: ['settings', 'integrations'],
    queryFn: settingsApi.getIntegrations,
  });

  const updateProfileMutation = useMutation({
    mutationFn: settingsApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'profile'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const updateIntegrationsMutation = useMutation({
    mutationFn: settingsApi.updateIntegrations,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'integrations'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const [profileForm, setProfileForm] = useState<BusinessProfile>(
    profile || {
      businessName: '',
      businessEmail: '',
      businessPhone: '',
      businessAddress: '',
      businessDescription: '',
    }
  );

  const [integrationsForm, setIntegrationsForm] = useState<IntegrationSettings>(
    integrations || {
      whatsappPhoneNumberId: '',
      whatsappAccessToken: '',
      razorpayKeyId: '',
      razorpayKeySecret: '',
      googleCalendarEnabled: false,
      googleClientId: '',
      googleClientSecret: '',
    }
  );

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  const handleIntegrationsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateIntegrationsMutation.mutate(integrationsForm);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your business profile and integrations</p>
      </div>

      {saved && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800">Settings saved successfully!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Business Profile
              </div>
            </button>
            <button
              onClick={() => setActiveTab('integrations')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'integrations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Integrations
              </div>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </div>
            </button>
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={profileForm.businessName}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, businessName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Email
                  </label>
                  <input
                    type="email"
                    value={profileForm.businessEmail}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, businessEmail: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Phone
                  </label>
                  <input
                    type="tel"
                    value={profileForm.businessPhone}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, businessPhone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Address
                </label>
                <input
                  type="text"
                  value={profileForm.businessAddress}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, businessAddress: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description
                </label>
                <textarea
                  value={profileForm.businessDescription}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, businessDescription: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <form onSubmit={handleIntegrationsSubmit} className="p-6">
            <div className="space-y-8">
              {/* WhatsApp */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">WhatsApp Cloud API</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number ID
                    </label>
                    <input
                      type="text"
                      value={integrationsForm.whatsappPhoneNumberId}
                      onChange={(e) =>
                        setIntegrationsForm({
                          ...integrationsForm,
                          whatsappPhoneNumberId: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Access Token
                    </label>
                    <input
                      type="password"
                      value={integrationsForm.whatsappAccessToken}
                      onChange={(e) =>
                        setIntegrationsForm({
                          ...integrationsForm,
                          whatsappAccessToken: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Razorpay */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Razorpay Payments</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key ID
                    </label>
                    <input
                      type="text"
                      value={integrationsForm.razorpayKeyId}
                      onChange={(e) =>
                        setIntegrationsForm({
                          ...integrationsForm,
                          razorpayKeyId: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key Secret
                    </label>
                    <input
                      type="password"
                      value={integrationsForm.razorpayKeySecret}
                      onChange={(e) =>
                        setIntegrationsForm({
                          ...integrationsForm,
                          razorpayKeySecret: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Google Calendar */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Google Calendar</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={integrationsForm.googleCalendarEnabled}
                      onChange={(e) =>
                        setIntegrationsForm({
                          ...integrationsForm,
                          googleCalendarEnabled: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Enable Google Calendar Integration
                    </label>
                  </div>
                  {integrationsForm.googleCalendarEnabled && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Client ID
                        </label>
                        <input
                          type="text"
                          value={integrationsForm.googleClientId}
                          onChange={(e) =>
                            setIntegrationsForm({
                              ...integrationsForm,
                              googleClientId: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Client Secret
                        </label>
                        <input
                          type="password"
                          value={integrationsForm.googleClientSecret}
                          onChange={(e) =>
                            setIntegrationsForm({
                              ...integrationsForm,
                              googleClientSecret: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updateIntegrationsMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {updateIntegrationsMutation.isPending ? 'Saving...' : 'Save Integrations'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Payment Reminders</h4>
                  <p className="text-sm text-gray-500">Send automated payment reminders</p>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Booking Reminders</h4>
                  <p className="text-sm text-gray-500">Send booking confirmation and reminders</p>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Lead Follow-ups</h4>
                  <p className="text-sm text-gray-500">Automated follow-up sequences</p>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
