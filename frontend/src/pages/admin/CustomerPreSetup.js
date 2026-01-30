// pages/admin/CustomerPreSetup.js
import React, { useEffect, useState } from 'react';
import { configAPI, adminAPI } from '../../services/api';
import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

const CustomerPreSetup = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  const totalSteps = 7;
  
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
    
    // Check for invite code in URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get('invite');
    if (code) {
      loadInviteData(code);
    }
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

  const loadInviteData = async (code) => {
    try {
      const response = await adminAPI.getCustomerProfile(code);
      if (response?.data) {
        const data = response.data;
        setForm(prev => ({
          ...prev,
          companyName: data.companyName || '',
          contactName: data.contactName || '',
          contactEmail: data.contactEmail || '',
          contactPhone: data.contactPhone || '',
          billingName: data.billingName || '',
          billingEmail: data.billingEmail || '',
          billingPhone: data.billingPhone || '',
          techName: data.techName || '',
          techEmail: data.techEmail || '',
          techPhone: data.techPhone || '',
          emergencyName: data.emergencyName || '',
          emergencyEmail: data.emergencyEmail || '',
          emergencyPhone: data.emergencyPhone || '',
          serviceTier: data.serviceTier || '',
          hrisSystem: data.hrisSystem || '',
          updateMethod: data.updateMethod || '',
          deviceChoice: data.deviceChoice || '',
          giftChoice: data.giftChoice || ''
        }));
        setInviteCode(code);
      }
    } catch (error) {
      console.error('Error loading invite data:', error);
    }
  };

  const handleFormChange = (updates) => {
    setForm(prev => ({ ...prev, ...updates }));
    setUnsavedChanges(true);
  };

  const generateInviteCode = () => {
    return 'PRE-' + Math.random().toString(36).substring(2, 15).toUpperCase();
  };

  const handleSaveAndCreateInvitation = async () => {
    if (!form.companyName.trim()) {
      alert('Company name is required');
      return;
    }

    try {
      setLoading(true);
      const code = inviteCode || generateInviteCode();
      
      const profile = {
        id: code,
        code,
        ...form,
        customFields: form.customFields ? form.customFields.split('\n').map(f => f.trim()).filter(Boolean) : [],
        createdAt: new Date().toISOString(),
        used: false,
        status: 'draft' // Save to staging first
      };

      // Save to staging table for review
      await adminAPI.saveStagingProfile(profile);
      
      setSavedProfiles((prev) => {
        const exists = prev.some(p => p.code === code);
        if (exists) {
          return prev.map(p => (p.code === code ? { ...p, ...profile } : p));
        }
        return [...prev, profile];
      });
      setInviteCode(code);
      setUnsavedChanges(false);
      
      // Ask if they want to submit for review
      const submitNow = window.confirm(
        `Profile saved to staging!\n\nInvite code: ${code}\n\n` +
        `Would you like to submit this profile for review now?\n\n` +
        `- Click OK to submit for review\n` +
        `- Click Cancel to keep as draft and review later`
      );
      
      if (submitNow) {
        await adminAPI.submitProfileForReview(code, { submittedBy: 'admin@m-theorygrp.com' });
        alert('Profile submitted for review! Go to Profile Review page to approve.');
      } else {
        copyInviteUrl(code);
        alert('Profile saved as draft. You can edit and submit for review later.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      let errorMessage = 'Failed to save profile';
      if (error.response?.data?.error) {
        errorMessage += ': ' + error.response.data.error;
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please ensure the backend server is running on port 3001.';
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (unsavedChanges && !window.confirm('Discard unsaved changes?')) {
      return;
    }
    window.location.href = '/admin';
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const copyInviteUrl = (code) => {
    const url = `${window.location.origin}/?invite=${code}`;
    navigator.clipboard.writeText(url);
  };

  const progressPercent = (currentStep / totalSteps) * 100;

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1: // Basic Info
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Company Information</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Company Name *</label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => handleFormChange({ companyName: e.target.value })}
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
                  onChange={(e) => handleFormChange({ contactName: e.target.value })}
                  className="input-field"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => handleFormChange({ contactEmail: e.target.value })}
                  className="input-field"
                  placeholder="john@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => handleFormChange({ contactPhone: e.target.value })}
                  className="input-field"
                  placeholder="+1-555-0123"
                />
              </div>
            </div>
          </div>
        );

      case 2: // Key Contacts
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Key Contacts</h2>
            
            {['billing', 'tech', 'emergency'].map(type => (
              <div key={type} className="p-4 border border-dark-700 rounded-lg">
                <h3 className="font-semibold mb-3 capitalize">{type} Contact</h3>
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={form[`${type}Name`]}
                    onChange={(e) => handleFormChange({ [`${type}Name`]: e.target.value })}
                    className="input-field"
                    placeholder="Name"
                  />
                  <input
                    type="email"
                    value={form[`${type}Email`]}
                    onChange={(e) => handleFormChange({ [`${type}Email`]: e.target.value })}
                    className="input-field"
                    placeholder="Email"
                  />
                  <input
                    type="tel"
                    value={form[`${type}Phone`]}
                    onChange={(e) => handleFormChange({ [`${type}Phone`]: e.target.value })}
                    className="input-field"
                    placeholder="Phone"
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 3: // Service Order
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Service Order</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Service Tier</label>
              <select
                value={form.serviceTier}
                onChange={(e) => handleFormChange({ serviceTier: e.target.value })}
                className="input-field"
              >
                <option value="">Select Tier</option>
                {[...config.serviceTiers].sort((a, b) => a.name.localeCompare(b.name)).map(tier => (
                  <option key={tier.id} value={tier.name}>{tier.name} (${tier.monthlyPrice}/mo)</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => handleFormChange({ startDate: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Contract Term (months)</label>
                <input
                  type="number"
                  value={form.contractTerm}
                  onChange={(e) => handleFormChange({ contractTerm: parseInt(e.target.value) })}
                  className="input-field"
                  min="1"
                  max="60"
                />
              </div>
            </div>
          </div>
        );

      case 4: // HR Setup
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">HR / People Setup</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">HRIS / HR System in use</label>
              <select
                value={form.hrisSystem}
                onChange={(e) => handleFormChange({ hrisSystem: e.target.value })}
                className="input-field"
              >
                <option value="">Select System</option>
                {[...config.hrisSystems].sort((a, b) => a.name.localeCompare(b.name)).map(system => (
                  <option key={system.id} value={system.name}>{system.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Update Method</label>
              <select
                value={form.updateMethod}
                onChange={(e) => handleFormChange({ updateMethod: e.target.value })}
                className="input-field"
              >
                <option value="">Select Method</option>
                {[...config.updateMethods].sort((a, b) => a.name.localeCompare(b.name)).map(method => (
                  <option key={method.id} value={method.name}>{method.name}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case 5: // Hardware
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Hardware Preferences</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Device Preference</label>
              <select
                value={form.deviceChoice}
                onChange={(e) => handleFormChange({ deviceChoice: e.target.value })}
                className="input-field"
              >
                <option value="">Select Device</option>
                {config.hardwareOptions
                  ?.filter(h => h.option_type === 'device')
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(device => (
                    <option key={device.id} value={device.name}>{device.name} (~${device.estimated_value})</option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Welcome Gift</label>
              <select
                value={form.giftChoice}
                onChange={(e) => handleFormChange({ giftChoice: e.target.value })}
                className="input-field"
              >
                <option value="">Select Gift</option>
                {config.hardwareOptions
                  ?.filter(h => h.option_type === 'gift')
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(gift => (
                    <option key={gift.id} value={gift.name}>{gift.name} (~${gift.estimated_value})</option>
                  ))}
              </select>
            </div>
          </div>
        );

      case 6: // Support
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Support & SLA</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Ticket Severity Default</label>
              <select
                value={form.ticketSeverity}
                onChange={(e) => handleFormChange({ ticketSeverity: e.target.value })}
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
                onChange={(e) => handleFormChange({ contactChannel: e.target.value })}
                className="input-field"
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="slack">Slack</option>
                <option value="teams">Microsoft Teams</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.afterHoursSupport}
                onChange={(e) => handleFormChange({ afterHoursSupport: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">After-hours support (24/7)</span>
            </label>
          </div>
        );

      case 7: // API Configuration
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">API Configuration (Optional)</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">API Key</label>
              <input
                type="password"
                value={form.apiKey}
                onChange={(e) => handleFormChange({ apiKey: e.target.value })}
                className="input-field"
                placeholder="Enter API key if applicable"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">API Endpoint</label>
              <input
                type="url"
                value={form.apiEndpoint}
                onChange={(e) => handleFormChange({ apiEndpoint: e.target.value })}
                className="input-field"
                placeholder="https://api.example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Webhook URL</label>
              <input
                type="url"
                value={form.webhookUrl}
                onChange={(e) => handleFormChange({ webhookUrl: e.target.value })}
                className="input-field"
                placeholder="https://webhook.example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Sync Frequency</label>
              <select
                value={form.syncFrequency}
                onChange={(e) => handleFormChange({ syncFrequency: e.target.value })}
                className="input-field"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Custom Fields</label>
              <textarea
                value={form.customFields}
                onChange={(e) => handleFormChange({ customFields: e.target.value })}
                className="input-field"
                rows="4"
                placeholder="department_id&#10;cost_center&#10;employee_id_format"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-8 bg-dark-950">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a href="/admin" className="text-primary-400 hover:underline mb-4 inline-flex items-center gap-2">
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Admin Dashboard
          </a>
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-bold">Customer Pre-Setup Wizard</h1>
            <div className="text-2xl font-semibold text-primary-300">
              {form.companyName?.trim() ? form.companyName : 'New Customer'}
            </div>
            <p className="text-dark-300">Pre-enter customer details before invitation. Changes are NOT saved until final step.</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm font-medium text-primary-400">{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full bg-dark-800 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="card space-y-6">
              {renderStep()}

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-6 border-t border-dark-700">
                {currentStep > 1 && (
                  <button
                    onClick={handlePrevious}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                    Back
                  </button>
                )}

                {currentStep < totalSteps && (
                  <button
                    onClick={handleNext}
                    className="btn-primary flex items-center gap-2 ml-auto"
                  >
                    Next
                    <ArrowRightIcon className="w-5 h-5" />
                  </button>
                )}

                {currentStep === totalSteps && (
                  <button
                    onClick={handleSaveAndCreateInvitation}
                    disabled={loading || !form.companyName.trim()}
                    className="btn-primary flex items-center gap-2 ml-auto"
                  >
                    {loading ? 'Saving...' : 'Save & Create Invitation'}
                    <CheckCircleIcon className="w-5 h-5" />
                  </button>
                )}

                {currentStep === 1 && (
                  <button
                    onClick={handleCancel}
                    className="btn-secondary flex items-center gap-2 ml-auto"
                  >
                    <XMarkIcon className="w-5 h-5" />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Saved Profiles */}
          <div className="lg:col-span-1">
            <div className="card space-y-4 sticky top-8">
              <h3 className="text-xl font-bold mb-4">Recent Profiles</h3>
              
              {inviteCode && (
                <div className="p-3 bg-primary-500/10 border border-primary-500/30 rounded-lg">
                  <div className="text-xs uppercase tracking-wide text-dark-400 mb-2">Current Invite Code</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inviteCode}
                      readOnly
                      className="input-field text-xs flex-1"
                    />
                    <button
                      onClick={() => copyInviteUrl(inviteCode)}
                      className="btn-secondary text-xs"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
              
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
