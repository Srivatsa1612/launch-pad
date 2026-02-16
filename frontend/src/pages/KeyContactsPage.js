// pages/KeyContactsPage.js - Step 2: Key Contacts
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
  const [contacts, setContacts] = useState({
    billing: { name: '', email: '', phone: '' },
    tech: { name: '', email: '', phone: '' },
    emergency: { name: '', email: '', phone: '' },
  });

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const response = await contactsAPI.get(sessionId);
        if (response.data && Object.keys(response.data).length > 0) {
          setContacts(response.data);
        }
      } catch (error) {
        console.error('Error loading contacts:', error);
      }
    };

    if (sessionId) {
      loadContacts();
    }
  }, [sessionId]);

  const isContactValid = (contact) => {
    return (
      contact.name.trim() &&
      contact.email.trim() && isValidEmail(contact.email) &&
      contact.phone.trim() && isValidPhone(contact.phone)
    );
  };

  const isValid = () => {
    return (
      isContactValid(contacts.billing) &&
      isContactValid(contacts.tech) &&
      isContactValid(contacts.emergency)
    );
  };

  const handleSave = async () => {
    setAttempted(true);
    setSaveError('');

    if (!isValid()) return;

    try {
      setLoading(true);
      await contactsAPI.save(sessionId, contacts);
      nextStep();
    } catch (error) {
      console.error('Error saving contacts:', error);

      let errorMessage = 'Failed to save contacts. Please try again.';

      if (error.response?.data) {
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          errorMessage = 'Validation errors:\n' +
            error.response.data.errors.map(e => `- ${e.msg} (${e.param})`).join('\n');
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
          Accurate contacts help us respond faster — especially when things move quickly.
        </p>
      </div>

      <div className="space-y-6">
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
          title="Tech Contact"
          description="For technical integration, API access, and system configuration"
          icon={
            <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
          iconColor="bg-blue-600/20"
          contacts={contacts.tech}
          onChange={(tech) => setContacts({ ...contacts, tech })}
          showErrors={attempted}
        />

        <ContactSection
          title="Emergency Contact"
          description="For critical outages, security incidents, and urgent escalations"
          icon={
            <svg className="w-5 h-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          iconColor="bg-red-600/20"
          contacts={contacts.emergency}
          onChange={(emergency) => setContacts({ ...contacts, emergency })}
          showErrors={attempted}
        />
      </div>

      <div className="mt-8 card bg-primary-900/20 border-primary-700">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-primary-200">
            "Our team treats these like VIP lines — direct, discreet, and always answered promptly."
          </p>
        </div>
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
          {loading ? 'Saving...' : 'Looks good — continue'}
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default KeyContactsPage;
