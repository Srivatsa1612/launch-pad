// pages/DashboardPage.js
import React, { useEffect, useState } from 'react';
import { useWizard } from '../context/WizardContext';
import { sessionAPI } from '../services/api';
import { 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  ShoppingCartIcon,
  UsersIcon,
  ComputerDesktopIcon,
  LifebuoyIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const { sessionId, companyName } = useWizard();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessionData = async () => {
      // Try to use current sessionId, or check localStorage for a saved one
      let activeSessionId = sessionId || localStorage.getItem('wizardSessionId');
      
      if (!activeSessionId) {
        setError('No active session found');
        setLoading(false);
        return;
      }

      try {
        const response = await sessionAPI.get(activeSessionId);
        setSessionData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-dark-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-400">No Session Found</h2>
          <p className="text-dark-300 mb-6">Please start a new wizard session first.</p>
          <a href="/" className="btn-primary inline-block">Start New Session</a>
        </div>
      </div>
    );
  }

  const { session, contacts, serviceOrder, hrSetup, hardware, support } = sessionData;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <BuildingOfficeIcon className="w-10 h-10 text-primary-400" />
                {companyName || session.company_name}
              </h1>
              <p className="text-dark-300 mt-2">launchPAD Configuration Dashboard</p>
            </div>
            {session.status === 'completed' && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-600/20 rounded-lg border border-green-600/30">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <span className="text-green-400 font-medium">Setup Complete</span>
              </div>
            )}
          </div>
          <div className="flex gap-4 text-sm text-dark-400">
            <span>Session: {session.session_id}</span>
            <span>•</span>
            <span>Created: {new Date(session.created_at).toLocaleDateString()}</span>
            {session.completed_at && (
              <>
                <span>•</span>
                <span>Completed: {new Date(session.completed_at).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Key Contacts */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <UserGroupIcon className="w-6 h-6 text-primary-400" />
              <h2 className="text-2xl font-bold">Key Contacts</h2>
            </div>
            {contacts ? (
              <div className="space-y-4">
                <div className="p-4 bg-dark-800/50 rounded-lg">
                  <p className="text-xs text-dark-400 mb-1">Billing Contact</p>
                  <p className="font-medium">{contacts.billing_name}</p>
                  <p className="text-sm text-dark-300">{contacts.billing_email}</p>
                  <p className="text-sm text-dark-300">{contacts.billing_phone}</p>
                </div>
                <div className="p-4 bg-dark-800/50 rounded-lg">
                  <p className="text-xs text-dark-400 mb-1">Technical Contact</p>
                  <p className="font-medium">{contacts.tech_name}</p>
                  <p className="text-sm text-dark-300">{contacts.tech_email}</p>
                  <p className="text-sm text-dark-300">{contacts.tech_phone}</p>
                </div>
                <div className="p-4 bg-dark-800/50 rounded-lg">
                  <p className="text-xs text-dark-400 mb-1">Emergency Contact</p>
                  <p className="font-medium">{contacts.emergency_name}</p>
                  <p className="text-sm text-dark-300">{contacts.emergency_email}</p>
                  <p className="text-sm text-dark-300">{contacts.emergency_phone}</p>
                </div>
              </div>
            ) : (
              <p className="text-dark-400 italic">Not configured</p>
            )}
          </div>

          {/* Service Order */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <ShoppingCartIcon className="w-6 h-6 text-primary-400" />
              <h2 className="text-2xl font-bold">Service Order</h2>
            </div>
            {serviceOrder ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-dark-400 mb-1">Service Tier</p>
                  <p className="text-xl font-bold text-primary-400">{serviceOrder.service_tier}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-dark-400 mb-1">Start Date</p>
                    <p className="font-medium">{new Date(serviceOrder.start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-dark-400 mb-1">Contract Term</p>
                    <p className="font-medium">{serviceOrder.contract_term} months</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-dark-400 mb-1">Monthly Commitment</p>
                  <p className="text-2xl font-bold">${serviceOrder.monthly_commitment.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-dark-400 mb-2">Included Features</p>
                  <div className="flex flex-wrap gap-2">
                    {JSON.parse(serviceOrder.included_features || '[]').map((feature, idx) => (
                      <span key={idx} className="px-3 py-1 bg-primary-600/20 text-primary-300 rounded-full text-sm">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-dark-400 italic">Not configured</p>
            )}
          </div>

          {/* HR Setup */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <UsersIcon className="w-6 h-6 text-primary-400" />
              <h2 className="text-2xl font-bold">HR Setup</h2>
            </div>
            {hrSetup ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-dark-400 mb-1">HRIS System</p>
                  <p className="font-medium">{hrSetup.hris_system}</p>
                </div>
                <div>
                  <p className="text-xs text-dark-400 mb-1">Update Method</p>
                  <p className="font-medium">{hrSetup.update_method}</p>
                </div>
                <div>
                  <p className="text-xs text-dark-400 mb-1">Employee Count</p>
                  <p className="text-xl font-bold text-primary-400">{hrSetup.employee_count || 0}</p>
                </div>
                {hrSetup.employee_file_path && (
                  <div>
                    <p className="text-xs text-dark-400 mb-1">Employee File</p>
                    <p className="text-sm font-mono bg-dark-800/50 p-2 rounded">{hrSetup.employee_file_path}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-dark-400 italic">Not configured</p>
            )}
          </div>

          {/* Hardware Preferences */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <ComputerDesktopIcon className="w-6 h-6 text-primary-400" />
              <h2 className="text-2xl font-bold">Hardware Preferences</h2>
            </div>
            {hardware ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-dark-400 mb-1">Device Procurement</p>
                  <p className="font-medium capitalize">{hardware.device_procurement}</p>
                </div>
                {hardware.device_requirements && (
                  <div>
                    <p className="text-xs text-dark-400 mb-1">Requirements</p>
                    <p className="text-sm text-dark-300">{hardware.device_requirements}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-dark-400 mb-1">Welcome Gift</p>
                  <p className="font-medium capitalize">{hardware.welcome_gift}</p>
                </div>
              </div>
            ) : (
              <p className="text-dark-400 italic">Not configured</p>
            )}
          </div>

          {/* Support Connections */}
          <div className="card lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <LifebuoyIcon className="w-6 h-6 text-primary-400" />
              <h2 className="text-2xl font-bold">Support Connections</h2>
            </div>
            {support ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-dark-400 mb-1">Default Ticket Severity</p>
                  <p className="font-medium capitalize">{support.default_ticket_severity}</p>
                </div>
                <div>
                  <p className="text-xs text-dark-400 mb-1">Primary Contact Channel</p>
                  <p className="font-medium capitalize">{support.primary_contact_channel}</p>
                </div>
                <div>
                  <p className="text-xs text-dark-400 mb-1">After-Hours Support</p>
                  <p className="font-medium">{support.after_hours_support ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>
            ) : (
              <p className="text-dark-400 italic">Not configured</p>
            )}
          </div>

        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <a href="/" className="btn-secondary">
            Start New Session
          </a>
          <button 
            onClick={() => window.print()} 
            className="btn-secondary"
          >
            Print Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
