// pages/SupportPage.js - Step 6: Support & Leadership
import React, { useState, useEffect } from 'react';
import { useWizard } from '../context/WizardContext';
import { supportAPI, configAPI } from '../services/api';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

const SupportPage = () => {
  const { sessionId, nextStep, previousStep } = useWizard();
  const [loading, setLoading] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [concierge, setConcierge] = useState(null);
  const [leadership, setLeadership] = useState(null);

  useEffect(() => {
    const loadConciergeData = async () => {
      try {
        const response = await configAPI.getConcierges();
        if (response.data && response.data.length > 0) {
          setConcierge(response.data[0]);
          const leader = response.data.find(c => c.role === 'leadership' || c.role === 'escalation');
          setLeadership(leader || null);
        }
      } catch (error) {
        console.error('Error loading concierge:', error);
      }
    };
    loadConciergeData();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      await supportAPI.save(sessionId, {
        conciergeName: concierge?.name || 'Not Assigned',
        conciergeEmail: concierge?.email || '',
        conciergePhone: concierge?.phone || '',
        defaultTicketSeverity: 'medium',
        primaryContactChannel: 'teams',
        afterHoursSupport: true,
        supportProcedureAcknowledged: acknowledged
      });
      nextStep();
    } catch (error) {
      console.error('Error saving support:', error);
      setSaveError(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to save support preferences. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Support & Leadership Connections</h1>
        <p className="text-dark-300 text-lg">
          Meet your dedicated team and review our support procedures.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Concierge Card */}
        <div className="card group hover:border-primary-500/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-600 to-primary-400 opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-2xl font-bold flex-shrink-0">
              {concierge ? concierge.name.split(' ').map(n => n[0]).join('') : '?'}
            </div>
            <div>
              <h3 className="text-xl font-semibold">{concierge?.name || 'Loading...'}</h3>
              <p className="text-primary-400 text-sm">Your Dedicated Concierge</p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-dark-300 mb-5">
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-dark-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{concierge?.email || 'Loading...'}</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-dark-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{concierge?.phone || 'Loading...'}</span>
            </div>
          </div>

          <button
            onClick={() => {
              if (concierge?.email) {
                window.location.href = `mailto:${concierge.email}?subject=${encodeURIComponent('flowCUSTODIAN Kickoff Call Request')}&body=${encodeURIComponent("Hi " + (concierge.name || '') + ",\n\nI'd like to schedule a kickoff call for our flowCUSTODIAN onboarding.\n\nPlease let me know your available times.\n\nThank you!")}`;
              }
            }}
            disabled={!concierge?.email}
            className="btn-primary w-full justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Schedule Kickoff Call
          </button>
        </div>

        {/* Leadership Card */}
        <div className="card group hover:border-dark-500/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-amber-600/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Leadership Escalation</h3>
          </div>

          <p className="text-xl font-bold mb-1">{leadership?.name || 'M-Theory Leadership'}</p>
          <p className="text-dark-400 text-sm mb-4">{leadership?.title || 'VP of Customer Success'}</p>

          <div className="flex items-center gap-3 text-sm text-dark-300 mb-5">
            <svg className="w-4 h-4 text-dark-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{leadership?.email || 'info@m-theorygrp.com'}</span>
          </div>

          <div className="bg-dark-900/50 rounded-lg p-4">
            <p className="text-xs text-dark-400 italic">
              "Our leadership team is available for quarterly reviews or critical path escalations."
            </p>
          </div>
        </div>
      </div>

      {/* Support Procedures Card */}
      <div className="card mt-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="font-semibold text-lg">Support Procedures</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              label: 'Standard Support',
              detail: '24/7 Mon-Fri (Local Time)',
              icon: (
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
            {
              label: 'Critical Outage',
              detail: '15-minute response target via Emergency line',
              icon: (
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ),
            },
            {
              label: 'Non-Urgent',
              detail: 'Tickets via Dashboard or Slack integration',
              icon: (
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              ),
            },
          ].map((item, index) => (
            <div key={index} className="bg-dark-900/50 rounded-lg p-4 hover:bg-dark-900/80 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                {item.icon}
                <p className="text-sm font-medium">{item.label}</p>
              </div>
              <p className="text-xs text-dark-400">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {saveError && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg animate-fade-in">
          <p className="text-sm text-red-400 font-medium">{saveError}</p>
        </div>
      )}

      <label className="flex items-start gap-4 mt-8 cursor-pointer group">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(e) => setAcknowledged(e.target.checked)}
          className="w-6 h-6 mt-1"
        />
        <span className="text-lg group-hover:text-primary-400 transition-colors">
          I have reviewed the Support Procedure and know how to reach the team.
        </span>
      </label>

      <div className="mt-12 flex justify-between">
        <button onClick={previousStep} className="btn-secondary">
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </button>
        <button onClick={handleSave} disabled={!acknowledged || loading} className="btn-primary">
          {loading ? 'Saving...' : 'All acknowledged — let\'s finalize'}
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SupportPage;
