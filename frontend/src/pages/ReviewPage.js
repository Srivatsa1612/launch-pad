// pages/ReviewPage.js
import React, { useState, useEffect } from 'react';
import { useWizard } from '../context/WizardContext';
import { configAPI, adminAPI } from '../services/api';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

const ReviewPage = () => {
  const { sessionId, prefilledData, invitationCode, companyName, createSession, nextStep, previousStep } = useWizard();
  const [editingSection, setEditingSection] = useState(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
  const [saveMessage, setSaveMessage] = useState('');
  const [config, setConfig] = useState(null);

  const [editedData, setEditedData] = useState(prefilledData || {});

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await configAPI.getAll();
        setConfig(response.data);
      } catch (error) {
        console.error('Error loading config:', error);
      }
    };
    loadConfig();
  }, []);

  const handleEditField = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const handleScheduleMeeting = async () => {
    if (!scheduledDate || !scheduledTime) {
      setSaveStatus('error');
      setSaveMessage('Please select both date and time for the meeting.');
      return;
    }

    try {
      setLoading(true);
      setSaveStatus(null);

      // 1. Save edited profile data back to the customer profile
      if (invitationCode) {
        await adminAPI.updateCustomerProfile(invitationCode, {
          ...editedData,
          scheduledDate,
          scheduledTime,
          meetingNotes: notes,
          customerConfirmedAt: new Date().toISOString(),
        });
      }

      // 2. Create a wizard session if one doesn't exist yet
      if (!sessionId && invitationCode) {
        const company = editedData.companyName || companyName;
        await createSession(company, invitationCode);
      }

      setSaveStatus('success');
      setSaveMessage('Your setup has been confirmed and meeting scheduled!');

      // Brief delay so user sees success message, then proceed
      setTimeout(() => {
        nextStep();
      }, 1000);
    } catch (error) {
      console.error('Error confirming setup:', error);
      setSaveStatus('error');
      setSaveMessage(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to confirm setup. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!prefilledData) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-dark-400">Loading your setup information...</p>
      </div>
    );
  }

  const sections = [
    {
      id: 'company',
      title: 'Company Information',
      fields: [
        { key: 'companyName', label: 'Company Name', required: true },
        { key: 'contactName', label: 'Primary Contact Name', required: false },
        { key: 'contactEmail', label: 'Email', required: false },
        { key: 'contactPhone', label: 'Phone', required: false }
      ]
    },
    {
      id: 'contacts',
      title: 'Key Contacts',
      fields: [
        { key: 'billingName', label: 'Billing Contact Name', required: false },
        { key: 'billingEmail', label: 'Billing Email', required: false },
        { key: 'billingPhone', label: 'Billing Phone', required: false },
        { key: 'techName', label: 'Tech Contact Name', required: false },
        { key: 'techEmail', label: 'Tech Email', required: false },
        { key: 'techPhone', label: 'Tech Phone', required: false },
        { key: 'emergencyName', label: 'Emergency Contact Name', required: false },
        { key: 'emergencyEmail', label: 'Emergency Email', required: false },
        { key: 'emergencyPhone', label: 'Emergency Phone', required: false }
      ]
    },
    {
      id: 'service',
      title: 'Service Order',
      fields: [
        { key: 'serviceTier', label: 'Service Tier', required: true },
        { key: 'startDate', label: 'Start Date', required: false },
        { key: 'contractTerm', label: 'Contract Term (months)', required: false, type: 'number' }
      ]
    },
    {
      id: 'hr',
      title: 'HR Setup',
      fields: [
        { key: 'hrisSystem', label: 'HRIS System', required: false },
        { key: 'updateMethod', label: 'Update Method', required: false }
      ]
    },
    {
      id: 'hardware',
      title: 'Hardware & Gifts',
      fields: [
        { key: 'deviceChoice', label: 'Device', required: false },
        { key: 'giftChoice', label: 'Welcome Gift', required: false }
      ]
    }
  ];

  const isFieldEmpty = (key) => {
    const value = editedData[key];
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (typeof value === 'number') return false;
    if (Array.isArray(value)) return value.length === 0;
    return false;
  };
  
  const hasMissingRequired = (section) => section.fields.some(f => f.required && isFieldEmpty(f.key));

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Review Your Setup</h1>
        <p className="text-dark-300 text-lg">
          Please review and complete any missing information below. You can edit any field, then schedule your onboarding meeting.
        </p>
      </div>

      <div className="space-y-6 mb-12">
        {sections.map(section => {
          const sectionHasMissing = hasMissingRequired(section);
          
          return (
            <div key={section.id} className={`card ${sectionHasMissing ? 'border border-amber-500/50' : ''}`}>
              <button
                onClick={() => setEditingSection(editingSection === section.id ? null : section.id)}
                className="w-full text-left font-semibold text-lg mb-4 pb-4 border-b border-dark-700 hover:text-primary-400 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span>{section.title}</span>
                  {sectionHasMissing && (
                    <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded">Missing Info</span>
                  )}
                </div>
                <span className="text-xs text-dark-400">{editingSection === section.id ? 'Hide' : 'Edit'}</span>
              </button>

              {editingSection === section.id ? (
                // Edit Mode
                <div className="space-y-4">
                  {section.fields.map((field, idx) => (
                    <div key={idx}>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        {field.label}
                        {field.required && <span className="text-red-400">*</span>}
                        {isFieldEmpty(field.key) && <span className="text-xs text-amber-400">(empty)</span>}
                      </label>
                      
                      {/* Special handling for hardware dropdowns */}
                      {field.key === 'deviceChoice' ? (
                        <select
                          value={editedData[field.key] || ''}
                          onChange={(e) => handleEditField(field.key, e.target.value)}
                          className="input-field"
                        >
                          <option value="">Select Device</option>
                          {config?.hardwareOptions
                            ?.filter(h => h.option_type === 'device')
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(device => (
                              <option key={device.id} value={device.name}>
                                {device.name} {device.estimated_value > 0 && `(~$${device.estimated_value})`}
                              </option>
                            ))}
                        </select>
                      ) : field.key === 'giftChoice' ? (
                        <select
                          value={editedData[field.key] || ''}
                          onChange={(e) => handleEditField(field.key, e.target.value)}
                          className="input-field"
                        >
                          <option value="">Select Gift</option>
                          {config?.hardwareOptions
                            ?.filter(h => h.option_type === 'gift')
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(gift => (
                              <option key={gift.id} value={gift.name}>
                                {gift.name} {gift.estimated_value > 0 && `(~$${gift.estimated_value})`}
                              </option>
                            ))}
                        </select>
                      ) : field.key === 'serviceTier' ? (
                        <select
                          value={editedData[field.key] || ''}
                          onChange={(e) => handleEditField(field.key, e.target.value)}
                          className="input-field"
                        >
                          <option value="">Select Service Tier</option>
                          {config?.serviceTiers?.map(tier => (
                            <option key={tier.id} value={tier.name}>
                              {tier.name} - ${tier.monthly_rate}/mo
                            </option>
                          ))}
                        </select>
                      ) : field.key === 'hrisSystem' ? (
                        <select
                          value={editedData[field.key] || ''}
                          onChange={(e) => handleEditField(field.key, e.target.value)}
                          className="input-field"
                        >
                          <option value="">Select HRIS System</option>
                          {config?.hrisSystem?.map(sys => (
                            <option key={sys.id} value={sys.name}>
                              {sys.name} {sys.apiSupported && '(API)'}
                            </option>
                          ))}
                        </select>
                      ) : field.key === 'updateMethod' ? (
                        <select
                          value={editedData[field.key] || ''}
                          onChange={(e) => handleEditField(field.key, e.target.value)}
                          className="input-field"
                        >
                          <option value="">Select Update Method</option>
                          {config?.updateMethods?.map(method => (
                            <option key={method.id} value={method.name}>
                              {method.name} - {method.description}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'number' ? (
                        <input
                          type="number"
                          value={editedData[field.key] || ''}
                          onChange={(e) => handleEditField(field.key, e.target.value)}
                          className="input-field"
                          placeholder={field.required ? 'Required' : 'Optional'}
                        />
                      ) : (
                        <input
                          type={field.key.includes('Email') ? 'email' : field.key.includes('Phone') ? 'tel' : 'text'}
                          value={editedData[field.key] || ''}
                          onChange={(e) => handleEditField(field.key, e.target.value)}
                          className="input-field"
                          placeholder={field.required ? 'Required' : 'Optional'}
                        />
                      )}
                    </div>
                  ))}
                  
                  <button
                    onClick={() => setEditingSection(null)}
                    className="btn-secondary w-full mt-4"
                  >
                    Done Editing
                  </button>
                </div>
              ) : (
                // View Mode
                <div className="grid grid-cols-2 gap-4">
                  {section.fields.map((field, idx) => (
                    <div key={idx}>
                      <p className="text-sm font-medium text-dark-400 mb-1 flex items-center gap-2">
                        {field.label}
                        {field.required && <span className="text-red-400">*</span>}
                      </p>
                      <p className={`text-base font-semibold ${isFieldEmpty(field.key) ? 'text-amber-400' : ''}`}>
                        {editedData[field.key] || <span className="text-dark-500">—</span>}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Schedule Meeting Section */}
      <div className="card space-y-6 mb-12">
        <h2 className="text-2xl font-bold">Schedule Your Onboarding Meeting</h2>
        <p className="text-dark-300">
          Let's get your team set up for success. Choose a time that works best for you.
        </p>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Preferred Date *</label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Preferred Time *</label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Additional Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any questions or special requirements?"
            className="input-field"
            rows="4"
          />
        </div>

        <div className="p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg">
          <p className="text-sm text-dark-300">
            Our concierge team will send you a calendar invite and be ready to help you get the most out of flowCUSTODIAN!
          </p>
        </div>

        {/* Save status feedback */}
        {saveStatus === 'success' && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-400 font-medium">{saveMessage}</p>
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400 font-medium">{saveMessage}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-12">
        <button
          onClick={previousStep}
          className="btn-secondary flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </button>

        <button
          onClick={handleScheduleMeeting}
          disabled={loading || !scheduledDate || !scheduledTime}
          className="btn-primary flex items-center gap-2 ml-auto"
        >
          {loading ? 'Scheduling...' : 'Confirm & Schedule Meeting'}
          <CheckCircleIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ReviewPage;
