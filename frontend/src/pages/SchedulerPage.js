// pages/SchedulerPage.js - Step 3: Schedule Kickoff Call via Microsoft Bookings
import React, { useState } from 'react';
import { useWizard } from '../context/WizardContext';
import { ArrowLeftIcon, ArrowRightIcon, CalendarIcon } from '@heroicons/react/24/solid';

const BOOKINGS_URL = 'https://outlook.office365.com/owa/calendar/mBRANEPROOFKickoff@m-theorygrp.com/bookings/';

const SchedulerPage = () => {
  const { nextStep, previousStep } = useWizard();
  const [hasScheduled, setHasScheduled] = useState(false);

  const handleOpenBookings = () => {
    window.open(BOOKINGS_URL, '_blank');
    setHasScheduled(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Schedule Your Kickoff Call</h1>
        <p className="text-dark-300 text-lg">
          Book a time with our project management team to kick off your mBRANE PROOF deployment.
        </p>
      </div>

      {/* Booking Card */}
      <div className="card text-center py-12">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-primary-600/20 flex items-center justify-center">
            <CalendarIcon className="w-10 h-10 text-primary-400" />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-3">mBRANE PROOF Kickoff</h2>

        <div className="space-y-2 text-dark-300 mb-8">
          <p className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            60 minutes
          </p>
          <p className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            M-Theory Project Management Team
          </p>
          <p className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Microsoft Teams Meeting
          </p>
        </div>

        <button
          onClick={handleOpenBookings}
          className="btn-primary text-lg px-10 py-4 mx-auto"
        >
          <CalendarIcon className="w-6 h-6" />
          {hasScheduled ? 'Open Booking Page Again' : 'Schedule Kickoff Call'}
        </button>

        {hasScheduled && (
          <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg inline-block animate-fade-in">
            <div className="flex items-center gap-2 text-green-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="font-medium">Booking page opened — select your preferred time slot</p>
            </div>
            <p className="text-sm text-dark-400 mt-1">You'll receive a confirmation email with an Outlook calendar invite.</p>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-dark-800 rounded-lg">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-dark-400">
            If you prefer to schedule later, click "Skip for Now" to continue with the remaining steps.
          </p>
        </div>
      </div>

      <div className="mt-12 flex justify-between">
        <button onClick={previousStep} className="btn-secondary">
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </button>

        <div className="flex gap-4">
          {!hasScheduled && (
            <button
              onClick={nextStep}
              className="btn-secondary"
            >
              Skip for Now
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          )}
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
