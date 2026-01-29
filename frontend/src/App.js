// App.js
import React, { useState } from 'react';
import { WizardProvider, useWizard } from './context/WizardContext';
import ProgressBar from './components/ProgressBar';
import WelcomePage from './pages/WelcomePage';
import KeyContactsPage from './pages/KeyContactsPage';
import ServiceOrderPage from './pages/ServiceOrderPage';
import HRSetupPage from './pages/HRSetupPage';
import HardwarePage from './pages/HardwarePage';
import SupportPage from './pages/SupportPage';
import CompletionPage from './pages/CompletionPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ConciergeManagement from './pages/admin/ConciergeManagement';
import ServiceTierManagement from './pages/admin/ServiceTierManagement';
import HRISManagement from './pages/admin/HRISManagement';
import HardwareManagement from './pages/admin/HardwareManagement';
import InvitationsManagement from './pages/admin/InvitationsManagement';
import CustomerPreSetup from './pages/admin/CustomerPreSetup';

const WizardContent = () => {
  const { currentStep, sessionId, createSession } = useWizard();
  const [companyInput, setCompanyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

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

  // Show dashboard if requested
  if (showDashboard || window.location.pathname === '/dashboard') {
    return <DashboardPage />;
  }

  const handleStart = async (e) => {
    e.preventDefault();
    if (!companyInput.trim()) return;

    try {
      setLoading(true);
      await createSession(companyInput);
    } catch (error) {
      alert('Failed to start wizard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show company name input if no session
  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-dark-950">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <svg className="w-12 h-12 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
              </svg>
              <span className="text-3xl font-bold italic">FLOWCUSTODIAN</span>
            </div>
            <p className="text-xl text-dark-300 mb-2">Welcome Wizard</p>
            <p className="text-sm text-dark-400">Concierge-Powered Workflow Co-Pilot</p>
          </div>

          <form onSubmit={handleStart} className="card space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Company Name</label>
              <input
                type="text"
                value={companyInput}
                onChange={(e) => setCompanyInput(e.target.value)}
                placeholder="Enter your company name"
                className="input-field"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !companyInput.trim()}
              className="btn-primary w-full justify-center"
            >
              {loading ? 'Starting...' : 'Start Setup'}
            </button>

            <p className="text-xs text-dark-500 text-center">
              A complimentary service provided by M-Theory with an M365 Subscription
            </p>
          </form>

          <p className="text-center text-xs text-dark-500 mt-8">
            © 2026 M-Theory. All rights reserved.
          </p>
        </div>
      </div>
    );
  }

  // Render the appropriate step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomePage />;
      case 2:
        return <KeyContactsPage />;
      case 3:
        return <ServiceOrderPage />;
      case 4:
        return <HRSetupPage />;
      case 5:
        return <HardwarePage />;
      case 6:
        return <SupportPage />;
      case 7:
        return <CompletionPage />;
      default:
        return <WelcomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      {currentStep < 7 && <ProgressBar currentStep={currentStep} />}
      <div className={currentStep < 7 ? 'pt-24' : ''}>
        {renderStep()}
      </div>
    </div>
  );
};

function App() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  );
}

export default App;
