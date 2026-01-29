// pages/WelcomePage.js
import React, { useState } from 'react';
import { useWizard } from '../context/WizardContext';
import { ArrowRightIcon } from '@heroicons/react/24/solid';

const WelcomePage = () => {
  const { companyName, nextStep, formData, updateFormData } = useWizard();
  const [showInvitation, setShowInvitation] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    primaryContactName: formData.primaryContactName || '',
    primaryContactEmail: formData.primaryContactEmail || '',
    primaryContactPhone: formData.primaryContactPhone || '',
    notes: formData.notes || ''
  });

  const handleInviteChange = (e) => {
    const { name, value } = e.target;
    setInviteForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveInvite = (e) => {
    e.preventDefault();
    updateFormData(inviteForm);
    setShowInvitation(false);
  };

  const handleContinue = () => {
    updateFormData(inviteForm);
    nextStep();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-3xl w-full text-center space-y-8">
        <h1 className="text-5xl font-bold">
          Welcome to flowCUSTODIAN, <span className="text-primary-400">{companyName}</span>!
        </h1>
        
        <p className="text-xl text-dark-300">
          We're delighted to have you here. Think of us as your personal workflow
          concierge — here to make everything smoother, smarter, and more
          enjoyable from day one.
        </p>

        <div className="card text-left space-y-4 max-w-2xl mx-auto">
          <p className="text-lg">
            Hello, we're thrilled {companyName} chose flowCUSTODIAN as your Concierge-Powered
            Workflow Co-Pilot.
          </p>
          
          <p className="text-dark-300">
            In the next few minutes, we'll confirm a few details, handle the essentials, and add a couple of thoughtful
            touches — just like checking into your favorite hotel.
          </p>
          
          <div className="flex items-start gap-3 text-primary-400 pt-4">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">
              Most clients complete this in under 7 minutes. Ready when you are?
            </p>
          </div>
        </div>

        {/* Invitation Form Section */}
        {showInvitation && (
          <div className="card max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-left">Pre-filled Information</h3>
            <p className="text-dark-300 text-sm text-left mb-6">
              If you'd like, you can pre-fill some details from your Revenue Operations process. This helps us get your setup just right.
            </p>
            <form onSubmit={handleSaveInvite} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium mb-2">Primary Contact Name</label>
                <input
                  type="text"
                  name="primaryContactName"
                  value={inviteForm.primaryContactName}
                  onChange={handleInviteChange}
                  placeholder="E.g., Alex Thompson"
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Primary Contact Email</label>
                <input
                  type="email"
                  name="primaryContactEmail"
                  value={inviteForm.primaryContactEmail}
                  onChange={handleInviteChange}
                  placeholder="E.g., alex@company.com"
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Primary Contact Phone</label>
                <input
                  type="tel"
                  name="primaryContactPhone"
                  value={inviteForm.primaryContactPhone}
                  onChange={handleInviteChange}
                  placeholder="E.g., (555) 123-4567"
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={inviteForm.notes}
                  onChange={handleInviteChange}
                  placeholder="Any special requests or notes..."
                  rows="3"
                  className="input-field"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Save & Continue
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowInvitation(false)}
                  className="btn-secondary flex-1"
                >
                  Skip This
                </button>
              </div>
            </form>
          </div>
        )}

        {!showInvitation && (
          <div className="flex flex-col gap-4 max-w-2xl mx-auto">
            <button
              onClick={() => setShowInvitation(true)}
              className="btn-secondary text-lg"
            >
              📋 Add Pre-filled Information
            </button>
            
            <button
              onClick={handleContinue}
              className="btn-primary text-lg"
            >
              Begin Your Concierge Setup
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        <p className="text-sm text-dark-400 pt-8">
          Need anything at all? We're here around the clock.{' '}
          <a href="#" className="text-primary-400 hover:underline">
            Connect with Concierge
          </a>
        </p>
      </div>
    </div>
  );
};

export default WelcomePage;
