// pages/WelcomePage.js
import React from 'react';
import { useWizard } from '../context/WizardContext';
import { ArrowRightIcon } from '@heroicons/react/24/solid';

const WelcomePage = () => {
  const { companyName, nextStep } = useWizard();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
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
            Hello Alex, we're thrilled {companyName} chose flowCUSTODIAN as your Concierge-Powered
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

        <div className="flex justify-center gap-4">
          <button
            onClick={nextStep}
            className="btn-primary text-lg"
          >
            Begin Your Concierge Setup
            <ArrowRightIcon className="w-5 h-5" />
          </button>
          
          <button className="btn-secondary text-lg">
            Save & finish later
          </button>
        </div>

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
