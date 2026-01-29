// pages/admin/CustomerPreSetup.js
import React, { useEffect, useState } from 'react';
import { configAPI, adminAPI } from '../../services/api';
import { ArrowLeftIcon, PlusIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

const CustomerPreSetup = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('basic');
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  
  const [form, setForm] = useState({
    // Basic Info
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    
    // Key Contacts
    billingName: '',
    billingEmail: '',
    billingPhone: '',
    techName: '',
    techEmail: '',
    techPhone: '',
    emergencyName: '',
    emergencyEmail: '',
    emergencyPhone: '',
    
    // Service Order
    serviceTier: '',
    startDate: new Date().toISOString().split('T')[0],
    contractTerm: 12,
    
    // HR Setup
    hrisSystem: '',
    updateMethod: '',
    
    // Hardware
    deviceChoice: '',
    giftChoice: '',
    
    // Support/SLA
    ticketSeverity: 'medium',
    contactChannel: 'email',
    afterHoursSupport: false,
    
    // API Configuration
    apiKey: '',
    apiEndpoint: '',
    webhookUrl: '',
    syncFrequency: 'daily',
    customFields: ''
  });

  useEffect(() => {
    loadConfig();
    loadProfiles();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await configAPI.getAll();
      setConfig(response.data);
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const loadProfiles = async () => {
    try {
      const response = await adminAPI.getCustomerProfiles?.();
      setSavedProfiles(response?.data || []);
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const generateInviteCode = () => {
    return 'PRE-' + Math.random().toString(36).substring(2, 15).toUpperCase();
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!form.companyName.trim()) {
      alert('Company name is required');
      return;
    }

    try {
      setLoading(true);
      const code = generateInviteCode();
      
      const profile = {
        id: code,
        code,
        ...form,
        customFields: form.customFields ? form.customFields.split('\n').map(f => f.trim()).filter(Boolean) : [],
        createdAt: new Date().toISOString(),
        used: false
      };

      await adminAPI.saveCustomerProfile?.(profile);
      setSavedProfiles([...savedProfiles, profile]);
      setInviteCode(code);
      
      // Reset form
      setForm({
        companyName: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        billingName: '',
        billingEmail: '',
        billingPhone: '',
        techName: '',
        techEmail: '',
        techPhone: '',
        emergencyName: '',
        emergencyEmail: '',
        emergencyPhone: '',
        serviceTier: '',
        startDate: new Date().toISOString().split('T')[0],
        contractTerm: 12,
        hrisSystem: '',
        updateMethod: '',
        deviceChoice: '',
        giftChoice: '',
        ticketSeverity: 'medium',
        contactChannel: 'email',
        afterHoursSupport: false,
        apiKey: '',
        apiEndpoint: '',
        webhookUrl: '',
        syncFrequency: 'daily',
        customFields: ''
      });
      
      alert(`Profile created! Invite code: ${code}`);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteUrl = (code) => {
    const url = `${window.location.origin}/?invite=${code}`;
    navigator.clipboard.writeText(url);
    alert('Invitation URL copied to clipboard!');
  };

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-dark-950">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a href="/admin" className="text-primary-400 hover:underline mb-4 inline-flex items-center gap-2">
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Admin Dashboard
          </a>
          <h1 className="text-4xl font-bold mb-2">Customer Pre-Setup</h1>
          <p className="text-dark-300">Pre-enter customer details before invitation. Data will be pre-filled when customer accepts.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-dark-700 overflow-x-auto pb-4">
          {['basic', 'contacts', 'service', 'hr', 'hardware', 'support', 'api'].map(tabName => (
            <button
              key={tabName}
              onClick={() => setTab(tabName)}
              className={`px-4 py-2 font-medium whitespace-nowrap transition-colors ${
                tab === tabName
                  ? 'text-primary-400 border-b-2 border-primary-400'
                  : 'text-dark-400 hover:text-dark-300'
              }`}
            >
              {tabName.charAt(0).toUpperCase() + tabName.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSaveProfile} className="card space-y-6">
              {/* BASIC TAB */}
              {tab === 'basic' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-6">Company Information</h2>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name *</label>
                    <input
                      type="text"
                      value={form.companyName}
                      onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                      className="input-field"
                      placeholder="Acme Corporation"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Primary Contact Name</label>
                      <input
                        type="text"
                        value={form.contactName}
                        onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                        className="input-field"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        value={form.contactEmail}
                        onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                        className="input-field"
                        placeholder="john@company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <input
                        type="tel"
                        value={form.contactPhone}
                        onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                        className="input-field"
                        placeholder="+1-555-0123"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CONTACTS TAB */}
              {tab === 'contacts' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6">Key Contacts</h2>
                  
                  {['billing', 'tech', 'emergency'].map(type => (
                    <div key={type} className="p-4 border border-dark-700 rounded-lg">
                      <h3 className="font-semibold mb-3 capitalize">{type} Contact</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <input
                          type="text"
                          value={form[`${type}Name`]}
                          onChange={(e) => setForm({ ...form, [`${type}Name`]: e.target.value })}
                          className="input-field"
                          placeholder="Name"
                        />
                        <input
                          type="email"
                          value={form[`${type}Email`]}
                          onChange={(e) => setForm({ ...form, [`${type}Email`]: e.target.value })}
                          className="input-field"
                          placeholder="Email"
                        />
                        <input
                          type="tel"
                          value={form[`${type}Phone`]}
                          onChange={(e) => setForm({ ...form, [`${type}Phone`]: e.target.value })}
                          className="input-field"
                          placeholder="Phone"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SERVICE TAB */}
              {tab === 'service' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-6">Service Order</h2>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Service Tier</label>
                    <select
                      value={form.serviceTier}
                      onChange={(e) => setForm({ ...form, serviceTier: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select Tier</option>
                      {[...config.serviceTiers].sort((a, b) => a.name.localeCompare(b.name)).map(tier => (
                        <option key={tier.id} value={tier.name}>{tier.name} (${tier.monthlyPrice}/mo)</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Start Date</label>
                      <input
                        type="date"
                        value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Contract Term (months)</label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={form.contractTerm}
                        onChange={(e) => setForm({ ...form, contractTerm: parseInt(e.target.value) })}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* HR TAB */}
              {tab === 'hr' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-6">HR Setup</h2>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">HRIS System</label>
                    <select
                      value={form.hrisSystem}
                      onChange={(e) => setForm({ ...form, hrisSystem: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select System</option>
                      {[...config.hrisSystems].sort((a, b) => a.name.localeCompare(b.name)).map(sys => (
                        <option key={sys.id} value={sys.name}>{sys.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Update Method</label>
                    <select
                      value={form.updateMethod}
                      onChange={(e) => setForm({ ...form, updateMethod: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select Method</option>
                      {[...config.updateMethods].sort((a, b) => a.name.localeCompare(b.name)).map(method => (
                        <option key={method.id} value={method.name}>{method.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* HARDWARE TAB */}
              {tab === 'hardware' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-6">Hardware & Welcome Gifts</h2>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Device Procurement</label>
                    <select
                      value={form.deviceChoice}
                      onChange={(e) => setForm({ ...form, deviceChoice: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select Device</option>
                      {[...config.hardwareOptions.deviceProcurement].sort((a, b) => a.name.localeCompare(b.name)).map(device => (
                        <option key={device.id} value={device.name}>{device.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Welcome Gift</label>
                    <select
                      value={form.giftChoice}
                      onChange={(e) => setForm({ ...form, giftChoice: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select Gift</option>
                      {[...config.hardwareOptions.welcomeGifts].sort((a, b) => a.name.localeCompare(b.name)).map(gift => (
                        <option key={gift.id} value={gift.name}>{gift.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* SUPPORT TAB */}
              {tab === 'support' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-6">Support & SLA</h2>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Default Ticket Severity</label>
                    <select
                      value={form.ticketSeverity}
                      onChange={(e) => setForm({ ...form, ticketSeverity: e.target.value })}
                      className="input-field"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Primary Contact Channel</label>
                    <select
                      value={form.contactChannel}
                      onChange={(e) => setForm({ ...form, contactChannel: e.target.value })}
                      className="input-field"
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="chat">Chat</option>
                      <option value="ticket">Support Ticket</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.afterHoursSupport}
                      onChange={(e) => setForm({ ...form, afterHoursSupport: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span className="font-medium">Include After-Hours Support</span>
                  </label>
                </div>
              )}

              {/* API TAB */}
              {tab === 'api' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-6">API Configuration</h2>
                  <p className="text-dark-400 text-sm mb-4">Store API credentials and integration settings for this customer</p>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">API Key</label>
                    <input
                      type="password"
                      value={form.apiKey}
                      onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                      className="input-field"
                      placeholder="sk_live_..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">API Endpoint</label>
                    <input
                      type="url"
                      value={form.apiEndpoint}
                      onChange={(e) => setForm({ ...form, apiEndpoint: e.target.value })}
                      className="input-field"
                      placeholder="https://api.example.com/v1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Webhook URL</label>
                    <input
                      type="url"
                      value={form.webhookUrl}
                      onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })}
                      className="input-field"
                      placeholder="https://example.com/webhook"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Sync Frequency</label>
                    <select
                      value={form.syncFrequency}
                      onChange={(e) => setForm({ ...form, syncFrequency: e.target.value })}
                      className="input-field"
                    >
                      <option value="realtime">Real-time</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Custom Fields (one per line)</label>
                    <textarea
                      value={form.customFields}
                      onChange={(e) => setForm({ ...form, customFields: e.target.value })}
                      className="input-field"
                      rows="4"
                      placeholder="department_id&#10;cost_center&#10;employee_id_format"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-dark-700">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  {loading ? 'Saving...' : 'Save & Create Invitation'}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar - Saved Profiles */}
          <div className="lg:col-span-1">
            <div className="card space-y-4 sticky top-8">
              <h3 className="text-xl font-bold mb-4">Recent Profiles</h3>
              
              {savedProfiles.length === 0 ? (
                <p className="text-dark-400 text-sm">No profiles created yet</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {[...savedProfiles].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10).map(profile => (
                    <div key={profile.id} className="p-3 bg-dark-800/50 rounded border border-dark-700">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{profile.companyName}</p>
                          <p className="text-xs text-dark-400 truncate">{profile.code}</p>
                        </div>
                        {profile.used && (
                          <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0 ml-2" />
                        )}
                      </div>
                      <button
                        onClick={() => copyInviteUrl(profile.code)}
                        className="text-xs text-primary-400 hover:underline"
                      >
                        Copy URL
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPreSetup;
