// pages/CompletionPage.js
import React, { useEffect, useState } from 'react';
import { useWizard } from '../context/WizardContext';
import { configAPI } from '../services/api';
import { CheckCircleIcon, CalendarIcon } from '@heroicons/react/24/solid';

const CompletionPage = () => {
  const { companyName, completeWizard } = useWizard();
  const [concierge, setConcierge] = useState(null);

  useEffect(() => {
    const loadConcierge = async () => {
      try {
        const response = await configAPI.getConcierges();
        if (response.data && response.data.length > 0) {
          setConcierge(response.data[0]);
        }
      } catch (error) {
        console.error('Error loading concierge:', error);
      }
    };
    loadConcierge();
  }, []);

  useEffect(() => {
    // Mark wizard as complete
    completeWizard();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-3xl w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-green-600/20 flex items-center justify-center animate-pulse">
            <CheckCircleIcon className="w-16 h-16 text-green-500" />
          </div>
        </div>

        <h1 className="text-5xl font-bold">
          Welcome aboard, <span className="text-primary-400">{companyName}</span>!
        </h1>
        
        <p className="text-xl text-dark-300">
          Your flowCUSTODIAN journey is officially underway.
        </p>

        <div className="card text-left space-y-6 max-w-2xl mx-auto">
          <div className="flex items-start gap-4 pb-4 border-b border-dark-700">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">
              1
            </div>
            <div>
              <p className="font-medium mb-1">Your concierge <span className="text-primary-400">{concierge?.name || 'our team'}</span> will reach out within 24 hours to schedule your kickoff call.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 pb-4 border-b border-dark-700">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">
              2
            </div>
            <div>
              <p className="font-medium mb-1">Employee access provisioning begins today. Expect the first batch confirmations tomorrow morning.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">
              3
            </div>
            <div>
              <p className="font-medium mb-1">Welcome gift package ordered — arriving at your primary office in 5–7 days.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="btn-primary text-lg"
          >
            View Your Concierge Dashboard →
          </button>
          
          <button 
            onClick={() => {
              const event = {
                title: `flowCUSTODIAN Kickoff Call with ${concierge?.name || 'Team'}`,
                description: 'Kickoff call to discuss your flowCUSTODIAN implementation',
                start: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
                duration: 60
              };
              const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&description=${encodeURIComponent(event.description)}&dates=${event.start.replace(/-/g, '')}/${event.start.replace(/-/g, '')}`;
              window.open(googleCalendarUrl, '_blank');
            }}
            className="btn-secondary text-lg flex items-center justify-center gap-2"
          >
            <CalendarIcon className="w-5 h-5" />
            Add to calendar: Kickoff Call
          </button>
        </div>

        <p className="text-sm text-dark-400 pt-8">
          Need anything at all? We're here around the clock.{' '}
          <a href="#" className="text-primary-400 hover:underline">
            Connect with Concierge
          </a>
        </p>

        <div className="pt-12 border-t border-dark-800">
          <p className="text-xs text-dark-500">
            © 2026 M-Theory. All rights reserved. | mtheorygroup.com | info@m-theorygrp.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompletionPage;
