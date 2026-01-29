// pages/SupportPage.js - Placeholder for Step 6
import React, { useState, useEffect } from 'react';
import { useWizard } from '../context/WizardContext';
import { supportAPI, configAPI } from '../services/api';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

const SupportPage = () => {
  const { sessionId, nextStep, previousStep } = useWizard();
  const [loading, setLoading] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [concierge, setConcierge] = useState(null);

  useEffect(() => {
    const loadConcierge = async () => {
      try {
        const response = await configAPI.getConcierges();
        if (response.data && response.data.length > 0) {
          setConcierge(response.data[0]); // Use first concierge as default
        }
      } catch (error) {
        console.error('Error loading concierge:', error);
      }
    };
    loadConcierge();
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-12">Support & Leadership Connections</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-2xl font-bold mb-4">
            {concierge ? concierge.name.split(' ').map(n => n[0]).join('') : '?'}
          </div>
          <h3 className="text-xl font-semibold mb-2">{concierge?.name || 'Loading...'}</h3>
          <p className="text-primary-400 mb-4">Your Dedicated Concierge</p>
          <div className="space-y-2 text-sm text-dark-300">
            <p>📧 {concierge?.email || 'Loading...'}</p>
            <p>📞 {concierge?.phone || 'Loading...'}</p>
            <button className="btn-primary mt-4 w-full">Schedule Kickoff Call</button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Leadership Escalation</h3>
          <p className="text-xl font-bold mb-1">Elena Vance</p>
          <p className="text-dark-400 text-sm mb-4">VP of Customer Success</p>
          <p className="text-dark-300 text-sm">evance@flowcustodian.com</p>
          <p className="text-xs text-dark-400 mt-4 italic">"Our leadership team is available for quarterly reviews or critical path escalations."</p>
        </div>
      </div>

      <div className="card mt-6">
        <h3 className="font-semibold mb-3">Support Procedures:</h3>
        <ul className="space-y-2 text-sm text-dark-300">
          <li>• Standard Support: 24/7 Mon-Fri (Local Time)</li>
          <li>• Critical Outage: 15-minute response target via Emergency line</li>
          <li>• Non-Urgent: Tickets logged via Dashboard or Slack integration</li>
        </ul>
      </div>

      <label className="flex items-start gap-4 mt-8 cursor-pointer">
        <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} className="w-6 h-6 mt-1" />
        <span className="text-lg">I have reviewed the Support Procedure and know how to reach the team.</span>
      </label>

      <div className="mt-12 flex justify-between">
        <button onClick={previousStep} className="btn-secondary">
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </button>
        <button onClick={handleSave} disabled={!acknowledged || loading} className="btn-primary">
          All acknowledged — let's finalize
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SupportPage;
