// App.js - launchPAD SOLO
import React, { useState, useEffect } from 'react';
import { WizardProvider, useWizard } from './context/WizardContext';
import { ToastProvider } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import PageTransition from './components/PageTransition';
import ProgressBar from './components/ProgressBar';
import SplashScreen from './components/SplashScreen';
import WelcomePage from './pages/WelcomePage';
import KeyContactsPage from './pages/KeyContactsPage';
import SchedulerPage from './pages/SchedulerPage';
import PrerequisitesPage from './pages/PrerequisitesPage';
import CompletionPage from './pages/CompletionPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ConciergeManagement from './pages/admin/ConciergeManagement';
import ServiceTierManagement from './pages/admin/ServiceTierManagement';
import HRISManagement from './pages/admin/HRISManagement';
import HardwareManagement from './pages/admin/HardwareManagement';
import InvitationsManagement from './pages/admin/InvitationsManagement';
import CustomerPreSetup from './pages/admin/CustomerPreSetup';
import ProfileReview from './pages/admin/ProfileReview';

const WizardContent = () => {
  const { currentStep, sessionId, invitationCode } = useWizard();
  const [showDashboard, setShowDashboard] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [inviteInput, setInviteInput] = useState('');

  // Show splash screen for 2 seconds on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Check URL for dashboard route
  React.useEffect(() => {
    if (window.location.pathname === '/dashboard') {
      setShowDashboard(true);
    }
  }, []);

  // Admin routes
  if (window.location.pathname.startsWith('/admin')) {
    if (window.location.pathname === '/admin/customer-setup') {
      return <CustomerPreSetup />;
    }
    if (window.location.pathname === '/admin/profile-review') {
      return <ProfileReview />;
    }
    if (window.location.pathname === '/admin/concierges') {
      return <ConciergeManagement />;
    }
    if (window.location.pathname === '/admin/service-tiers') {
      return <ServiceTierManagement />;
    }
    if (window.location.pathname === '/admin/hris') {
      return <HRISManagement />;
    }
    if (window.location.pathname === '/admin/hardware') {
      return <HardwareManagement />;
    }
    if (window.location.pathname === '/admin/invitations') {
      return <InvitationsManagement />;
    }
    return <AdminDashboard />;
  }

  // Show splash screen on initial load
  if (showSplash) {
    return <SplashScreen />;
  }

  // Show dashboard if requested
  if (showDashboard || window.location.pathname === '/dashboard') {
    return <DashboardPage />;
  }

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    let trimmed = inviteInput.trim();
    if (!trimmed) return;

    // If user pasted a full URL, extract just the invite code from it
    try {
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        const pastedUrl = new URL(trimmed);
        const codeFromUrl = pastedUrl.searchParams.get('invite');
        if (codeFromUrl) {
          trimmed = codeFromUrl;
        }
      }
    } catch (e) {
      // Not a valid URL, treat as raw invite code
    }

    // Redirect to URL with invite code so WizardContext picks it up
    window.location.href = `/?invite=${encodeURIComponent(trimmed)}`;
  };

  // Show prompt for invite code when none is provided and no session exists
  if (!sessionId && !invitationCode && !showDashboard && !window.location.pathname.startsWith('/admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-dark-950">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <svg className="w-12 h-12 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
              </svg>
            </div>
            <p className="text-3xl font-bold mb-1">
              <span className="text-primary-400">launch</span><span className="italic">PAD</span>
            </p>
            <p className="text-sm text-dark-400">Service Onboarding Launch Orchestrator</p>
            <p className="text-xs text-dark-500 mt-1">by M-Theory Group</p>
          </div>

          <div className="card space-y-6 text-center">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 font-medium mb-2">Access Required</p>
              <p className="text-sm text-dark-300">
                To get started with launchPAD, you'll need an invitation link from M-Theory.
              </p>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div className="text-left">
                <label className="block text-sm font-medium mb-2">Invitation Code</label>
                <input
                  type="text"
                  value={inviteInput}
                  onChange={(e) => setInviteInput(e.target.value)}
                  placeholder="Paste your invitation code"
                  className="input-field"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full justify-center"
                disabled={!inviteInput.trim()}
              >
                Continue
              </button>
            </form>

            <div>
              <p className="text-dark-400 text-sm mb-4">
                If you believe you should have access, please contact your M-Theory account team.
              </p>
              <a
                href="https://www.m-theorygrp.com/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:underline text-sm"
              >
                Get in Touch
              </a>
            </div>

            <p className="text-xs text-dark-500">
              &copy; 2026 M-Theory Group. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render the appropriate step (5 steps)
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomePage />;
      case 2:
        return <KeyContactsPage />;
      case 3:
        return <SchedulerPage />;
      case 4:
        return <PrerequisitesPage />;
      case 5:
        return <CompletionPage />;
      default:
        return <WelcomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      {currentStep < 5 && <ProgressBar currentStep={currentStep} />}
      <div className={currentStep < 5 ? 'pt-28' : ''}>
        <PageTransition stepKey={currentStep}>
          {renderStep()}
        </PageTransition>
      </div>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <WizardProvider>
          <WizardContent />
        </WizardProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
