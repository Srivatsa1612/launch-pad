// pages/KeyContactsPage.js - Step 2: Key Contacts for launchPAD
import React, { useState, useEffect } from 'react';
import { useWizard } from '../context/WizardContext';
import { contactsAPI } from '../services/api';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPhone = (phone) => {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
};

const ContactSection = ({ title, description, icon, iconColor, contacts, onChange, showErrors }) => (
  <div className="card group hover:border-dark-600 transition-all">
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-10 h-10 rounded-lg ${iconColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-semibold">{title}</h3>
        {description && <p className="text-xs text-dark-400">{description}</p>}
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-xs text-dark-400 mb-1.5 font-medium">Full Name</label>
        <input
          type="text"
          placeholder="John Smith"
          value={contacts.name}
          onChange={(e) => onChange({ ...contacts, name: e.target.value })}
          className="input-field"
        />
        {showErrors && !contacts.name.trim() && (
          <p className="text-red-400 text-xs mt-1">Name is required</p>
        )}
      </div>
      <div>
        <label className="block text-xs text-dark-400 mb-1.5 font-medium">Email Address</label>
        <input
          type="email"
          placeholder="john@company.com"
          value={contacts.email}
          onChange={(e) => onChange({ ...contacts, email: e.target.value })}
          className="input-field"
        />
        {showErrors && !contacts.email.trim() && (
          <p className="text-red-400 text-xs mt-1">Email is required</p>
        )}
        {showErrors && contacts.email.trim() && !isValidEmail(contacts.email) && (
          <p className="text-red-400 text-xs mt-1">Enter a valid email address</p>
        )}
      </div>
      <div>
        <label className="block text-xs text-dark-400 mb-1.5 font-medium">Phone Number</label>
        <input
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={contacts.phone}
          onChange={(e) => onChange({ ...contacts, phone: e.target.value })}
          className="input-field"
        />
        {showErrors && !contacts.phone.trim() && (
          <p className="text-red-400 text-xs mt-1">Phone is required</p>
        )}
        {showErrors && contacts.phone.trim() && !isValidPhone(contacts.phone) && (
          <p className="text-red-400 text-xs mt-1">Enter a valid phone number (7-15 digits)</p>
        )}
      </div>
    </div>
  </div>
);

const KeyContactsPage = () => {
  const { sessionId, nextStep, previousStep } = useWizard();
  const [loading, setLoading] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [allSamePerson, setAllSamePerson] = useState(false);
  const [contacts, setContacts] = useState({
    tech: { name: '', email: '', phone: '' },
    billing: { name: '', email: '', phone: '' },
    projectOwner: { name: '', email: '', phone: '' },
  });

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const response = await contactsAPI.get(sessionId);
        if (response.data && Object.keys(response.data).length > 0) {
          // Map from old format if needed
          const data = response.data;
          setContacts({
            tech: data.tech || { name: '', email: '', phone: '' },
            billing: data.billing || { name: '', email: '', phone: '' },
            projectOwner: data.projectOwner || data.emergency || { name: '', email: '', phone: '' },
          });
        }
      } catch (error) {
        console.error('Error loading contacts:', error);
      }
    };

    if (sessionId) {
      loadContacts();
    }
  }, [sessionId]);

  // When "all same person" is toggled on, copy tech contact to all others
  useEffect(() => {
    if (allSamePerson) {
      setContacts((prev) => ({
        tech: prev.tech,
        billing: { ...prev.tech },
        projectOwner: { ...prev.tech },
      }));
    }
  }, [allSamePerson]);

  // When tech contact changes and allSamePerson is on, sync others
  const handleTechChange = (tech) => {
    if (allSamePerson) {
      setContacts({
        tech,
        billing: { ...tech },
        projectOwner: { ...tech },
      });
    } else {
      setContacts((prev) => ({ ...prev, tech }));
    }
  };

  const isContactValid = (contact) => {
    return (
      contact.name.trim() &&
      contact.email.trim() && isValidEmail(contact.email) &&
      contact.phone.trim() && isValidPhone(contact.phone)
    );
  };

  const isValid = () => {
    return (
      isContactValid(contacts.tech) &&
      isContactValid(contacts.billing) &&
      isContactValid(contacts.projectOwner)
    );
  };

  const handleSave = async () => {
    setAttempted(true);
    setSaveError('');

    if (!isValid()) return;

    try {
      setLoading(true);
      // Map projectOwner to emergency for backend compatibility
      await contactsAPI.save(sessionId, {
        tech: contacts.tech,
        billing: contacts.billing,
        emergency: contacts.projectOwner,
      });
      nextStep();
    } catch (error) {
      console.error('Error saving contacts:', error);

      let errorMessage = 'Failed to save contacts. Please try again.';

      if (error.response?.data) {
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          errorMessage = 'Validation errors:\n' +
            error.response.data.errors.map(e => `- ${e.msg} (${e.path || e.param || 'unknown'})`).join('\n');
        } else if (error.response.data.details) {
          errorMessage = `Failed to save contacts: ${error.response.data.details}`;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }

      setSaveError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Your Key Contacts</h1>
        <p className="text-dark-300 text-lg">
          Please confirm the key contacts and stakeholders for your PROOF. These should be prefilled where possible — feel free to edit.
        </p>
      </div>

      {/* Same person checkbox */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={allSamePerson}
              onChange={(e) => setAllSamePerson(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
              allSamePerson
                ? 'bg-primary-600 border-primary-600'
                : 'border-dark-500 group-hover:border-dark-400'
            }`}>
              {allSamePerson && (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-dark-200 font-medium">All contacts are the same person</span>
        </label>
      </div>

      <div className="space-y-6">
        <ContactSection
          title="Technical Contact"
          description="For technical integration, API access, and system configuration"
          icon={
            <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
          iconColor="bg-blue-600/20"
          contacts={contacts.tech}
          onChange={handleTechChange}
          showErrors={attempted}
        />

        <ContactSection
          title="Billing Contact"
          description="For invoices, payment queries, and financial correspondence"
          icon={
            <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
          iconColor="bg-purple-600/20"
          contacts={contacts.billing}
          onChange={(billing) => setContacts({ ...contacts, billing })}
          showErrors={attempted}
        />

        <ContactSection
          title="Primary Project Owner"
          description="Main point of contact responsible for project success and escalations"
          icon={
            <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          iconColor="bg-green-600/20"
          contacts={contacts.projectOwner}
          onChange={(projectOwner) => setContacts({ ...contacts, projectOwner })}
          showErrors={attempted}
        />
      </div>

      {saveError && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg animate-fade-in">
          <p className="text-sm text-red-400 font-medium">{saveError}</p>
        </div>
      )}

      <div className="mt-12 flex justify-between">
        <button onClick={previousStep} className="btn-secondary">
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </button>

        <button
          onClick={handleSave}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Saving...' : 'Continue'}
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default KeyContactsPage;
