// pages/WelcomePage.js
import React from 'react';
import { useWizard } from '../context/WizardContext';
import { ArrowRightIcon } from '@heroicons/react/24/solid';

const FeatureItem = ({ icon, title, description, delay }) => (
  <div
    className="flex items-start gap-4 group animate-fade-in"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="w-10 h-10 rounded-lg bg-primary-600/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-600/30 transition-colors">
      {icon}
    </div>
    <div>
      <p className="font-medium mb-1">{title}</p>
      <p className="text-sm text-dark-400">{description}</p>
    </div>
  </div>
);

const WelcomePage = () => {
  const { companyName, nextStep, loading, prefilledData } = useWizard();

  // If loading prefilled data, show loading state
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

  const hasCompany = companyName && prefilledData;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary-600/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl w-full text-center space-y-8 relative z-10">
        {/* Shield icon with animation */}
        <div className="flex justify-center animate-scale-in">
          <div className="w-20 h-20 rounded-2xl bg-primary-600/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-primary-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
            </svg>
          </div>
        </div>

        <div className="animate-fade-in">
          <h1 className="text-5xl font-bold mb-4">
            {hasCompany ? (
              <>Welcome to flowCUSTODIAN, <span className="text-primary-400">{companyName}</span>!</>
            ) : (
              <>Welcome to <span className="text-primary-400">flowCUSTODIAN</span>!</>
            )}
          </h1>

          <p className="text-xl text-dark-300">
            {hasCompany
              ? "We're delighted to have you here. Think of us as your personal workflow concierge — here to make everything smoother, smarter, and more enjoyable from day one."
              : "We're delighted to have you here. Think of us as your personal workflow concierge — here to make everything smoother, smarter, and more enjoyable from day one."
            }
          </p>
        </div>

        <div className="card text-left space-y-5 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
          <p className="text-lg">
            {hasCompany
              ? `We're thrilled ${companyName} chose flowCUSTODIAN as your Concierge-Powered Workflow Co-Pilot.`
              : "Let's get started with your flowCUSTODIAN onboarding!"
            }
          </p>

          <p className="text-dark-300">
            In the next few minutes, we'll confirm a few details, handle the essentials, and add a couple of thoughtful
            touches — just like checking into your favorite hotel.
          </p>

          <div className="border-t border-dark-700 pt-5 space-y-4">
            <FeatureItem
              delay={300}
              icon={<svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
              title="Key Contacts"
              description="Confirm billing, tech, and emergency contacts"
            />
            <FeatureItem
              delay={400}
              icon={<svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
              title="Service & HR Setup"
              description="Verify your plan and configure HR integrations"
            />
            <FeatureItem
              delay={500}
              icon={<svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>}
              title="Hardware & Welcome Touches"
              description="Choose devices and a welcome gift for your team"
            />
          </div>

          <div className="flex items-start gap-3 text-primary-400 pt-2">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">
              Most clients complete this in under 7 minutes. Ready when you are?
            </p>
          </div>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '600ms' }}>
          <button
            onClick={nextStep}
            className="btn-primary text-lg"
          >
            Begin Your Concierge Setup
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>

        {hasCompany && (
          <p className="text-sm text-dark-400 pt-8">
            Need anything at all? We're here around the clock.{' '}
            <a href="mailto:info@m-theorygrp.com" className="text-primary-400 hover:underline">
              Connect with Concierge
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default WelcomePage;
