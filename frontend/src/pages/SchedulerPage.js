// pages/SchedulerPage.js - Step 3: Schedule Kickoff Call via Microsoft Bookings
import React from 'react';
import { useWizard } from '../context/WizardContext';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

const BOOKINGS_URL = 'https://outlook.office365.com/owa/calendar/mBRANEPROOFKickoff@m-theorygrp.com/bookings/';

const SchedulerPage = () => {
  const { nextStep, previousStep } = useWizard();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Schedule Your Kickoff Call</h1>
        <p className="text-dark-300 text-lg">
          Select a date and time for your kickoff call with our project management team using the calendar below.
          You can also skip this step and schedule later.
        </p>
      </div>

      {/* Embedded Microsoft Bookings */}
      <div className="card p-0 overflow-hidden" style={{ minHeight: '650px' }}>
        <iframe
          src={BOOKINGS_URL}
          title="Schedule mBRANE PROOF Kickoff Call"
          width="100%"
          height="650"
          frameBorder="0"
          scrolling="yes"
          style={{
            border: 'none',
            borderRadius: '12px',
            background: '#1e293b',
          }}
          allow="clipboard-write"
        />
      </div>

      <div className="mt-4 p-3 bg-dark-800 rounded-lg">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-dark-400">
            After booking, you'll receive a confirmation email with an Outlook calendar invite. If you prefer to schedule later, click "Skip for Now" below.
          </p>
        </div>
      </div>

      <div className="mt-12 flex justify-between">
        <button onClick={previousStep} className="btn-secondary">
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </button>

        <div className="flex gap-4">
          <button
            onClick={nextStep}
            className="btn-secondary"
          >
            Skip for Now
            <ArrowRightIcon className="w-5 h-5" />
          </button>
          <button
            onClick={nextStep}
            className="btn-primary"
          >
            Continue
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchedulerPage;
