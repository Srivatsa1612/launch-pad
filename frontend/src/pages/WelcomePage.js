// pages/WelcomePage.js - Step 1: launchPAD Welcome
import React from 'react';
import { useWizard } from '../context/WizardContext';

const BulletItem = ({ text, delay }) => (
  <div
    className="flex items-start gap-3 animate-fade-in"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="w-2 h-2 rounded-full bg-primary-400 mt-2 flex-shrink-0" />
    <p className="text-dark-200 leading-relaxed">{text}</p>
  </div>
);

const WelcomePage = () => {
  const { companyName, nextStep, loading, prefilledData } = useWizard();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="max-w-3xl w-full text-center space-y-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-lg text-dark-400">Loading your setup information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary-600/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl w-full text-center space-y-8 relative z-10">
        {/* M-Theory Logo */}
        <div className="flex justify-center animate-scale-in">
          <div className="w-20 h-20 rounded-2xl bg-primary-600/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-primary-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="animate-fade-in">
          <p className="text-sm font-semibold text-primary-400 uppercase tracking-widest mb-3">M-Theory Group</p>
          <h1 className="text-5xl font-bold mb-4">
            Welcome to <span className="text-primary-400">launchPAD</span>
          </h1>
          <p className="text-xl text-dark-300">
            Your Service Onboarding Launch Orchestrator.
          </p>
        </div>

        {/* Main content card */}
        <div className="card text-left space-y-6 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="bg-primary-900/30 border border-primary-700/50 rounded-lg p-4">
            <p className="text-lg font-semibold text-white leading-relaxed">
              We're thrilled you've been selected for our limited PROOFS&trade; program for mBRANE Managed Detection &amp; Response.
            </p>
          </div>

          <p className="text-dark-300 leading-relaxed">
            We built this Extended Proof-of-Production because trials don't reflect reality, so you
            experience the full solution, in production, over time, exactly as it's meant to be used.
          </p>

          <div className="border-t border-dark-700 pt-5">
            <p className="text-lg font-semibold text-white mb-4">
              M-Theory's launchPAD will help us get started by:
            </p>

            <div className="space-y-3">
              <BulletItem
                delay={300}
                text="Confirming key contacts and stakeholders for your PROOF"
              />
              <BulletItem
                delay={400}
                text="Providing a link to schedule your kickoff call with our project management team"
              />
              <BulletItem
                delay={500}
                text="Collecting the prerequisites we need to deploy successfully"
              />
              <BulletItem
                delay={600}
                text="Giving you an opportunity to share guidance and priorities so we can align on what success looks like"
              />
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="animate-fade-in" style={{ animationDelay: '700ms' }}>
          <button
            onClick={nextStep}
            className="btn-primary text-lg px-10 py-4"
          >
            Go for Launch!
            <svg className="w-5 h-5 ml-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11l-3-3m0 0l-3 3m3-3v8M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-4l-2-2H9L7 7H5a2 2 0 00-2 2z" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-dark-400 pt-4">
          Need anything at all? We're here around the clock.{' '}
          <a href="mailto:info@m-theorygrp.com" className="text-primary-400 hover:underline">
            Contact M-Theory
          </a>
        </p>
      </div>
    </div>
  );
};

export default WelcomePage;
