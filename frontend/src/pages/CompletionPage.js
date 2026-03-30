// pages/CompletionPage.js - Step 5: Thank You
import React, { useEffect, useState } from 'react';
import { useWizard } from '../context/WizardContext';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const CompletionPage = () => {
  const { companyName, completeWizard } = useWizard();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    completeWizard();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-green-600/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl w-full text-center space-y-8 relative z-10">
        {/* Success icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-green-600/20 flex items-center justify-center animate-scale-in">
              <CheckCircleIcon className="w-18 h-18 text-green-500" style={{ width: '72px', height: '72px' }} />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-green-500/30 animate-ping" style={{ animationDuration: '2s' }} />
          </div>
        </div>

        {/* Thank You Message */}
        <div className={`transition-all duration-700 ease-out ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h1 className="text-5xl font-bold mb-6">
            Thank You{companyName ? `, ${companyName}` : ''}!
          </h1>

          <p className="text-xl text-dark-300 mb-4 max-w-2xl mx-auto">
            Your launchPAD onboarding information has been submitted successfully. Our project management team will be in touch shortly to kick things off.
          </p>
        </div>

        {/* What's Next Card */}
        <div className={`transition-all duration-700 ease-out delay-200 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="card text-left max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">What Happens Next</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-dark-700/30 transition-all">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                <div>
                  <p className="font-medium">Our PM team will review your submission</p>
                  <p className="text-sm text-dark-400">We'll confirm your contacts, prerequisites, and service details.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-dark-700/30 transition-all">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                <div>
                  <p className="font-medium">Kickoff call scheduling</p>
                  <p className="text-sm text-dark-400">Expect a calendar invite from our project management team within 24 hours.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-dark-700/30 transition-all">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                <div>
                  <p className="font-medium">Deployment begins</p>
                  <p className="text-sm text-dark-400">Your mBRANE PROOF deployment starts after the kickoff call.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <p className="text-sm text-dark-400 pt-8">
          Questions in the meantime? Reach out anytime.{' '}
          <a href="mailto:info@m-theorygrp.com" className="text-primary-400 hover:underline">
            info@m-theorygrp.com
          </a>
        </p>

        <div className="pt-8 border-t border-dark-800">
          <p className="text-xs text-dark-500">
            &copy; 2026 M-Theory Group. All rights reserved. | mtheorygroup.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompletionPage;
