// pages/PrerequisitesPage.js - Step 4: Prerequisites for mBRANE deployment
import React, { useState } from 'react';
import { useWizard } from '../context/WizardContext';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

const PrerequisitesPage = () => {
  const { nextStep, previousStep } = useWizard();

  // Service selection
  const [selectedService, setSelectedService] = useState('');

  // CrowdStrike VM count (only if STRIKE selected)
  const [vmCount, setVmCount] = useState('');

  // Data sources
  const [dataSources, setDataSources] = useState({
    api: {
      entraId: false,
      m365: false,
      edr: false,
      googleWorkspace: false,
    },
    syslog: {
      firewall: false,
      switch: false,
      activeDirectory: false,
    },
    agentSensor: {
      windowsServers: false,
    },
  });

  // VM Resource requirements acknowledgment
  const [vmRequirementsAcknowledged, setVmRequirementsAcknowledged] = useState(false);

  // Customer notes
  const [customerNotes, setCustomerNotes] = useState('');

  const handleDataSourceChange = (category, key) => {
    setDataSources((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key],
      },
    }));
  };

  const handleContinue = () => {
    nextStep();
  };

  const DataSourceCheckbox = ({ label, checked, onChange }) => (
    <label className="flex items-center gap-3 cursor-pointer group py-2">
      <div className="relative">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
          checked
            ? 'bg-primary-600 border-primary-600'
            : 'border-dark-500 group-hover:border-dark-400'
        }`}>
          {checked && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <span className="text-dark-200">{label}</span>
    </label>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Prerequisites</h1>
        <p className="text-dark-300 text-lg">
          Select your service and provide the information we need to deploy successfully.
          You can fill this now or have it ready by your kickoff call.
        </p>
      </div>

      {/* Service Selection */}
      <div className="card mb-8">
        <h2 className="text-2xl font-semibold mb-6">Select Your Service</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* mBRANE MDR */}
          <button
            onClick={() => setSelectedService('mdr')}
            className={`p-6 rounded-xl border-2 text-left transition-all ${
              selectedService === 'mdr'
                ? 'border-primary-500 bg-primary-900/20'
                : 'border-dark-700 hover:border-dark-500 hover:bg-dark-800/50'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                selectedService === 'mdr' ? 'border-primary-500' : 'border-dark-500'
              }`}>
                {selectedService === 'mdr' && <div className="w-2 h-2 rounded-full bg-primary-500" />}
              </div>
              <h3 className="text-xl font-semibold">mBRANE MDR</h3>
            </div>
            <p className="text-sm text-dark-400 ml-7">
              Managed Detection &amp; Response powered by <span className="text-primary-400 font-medium">Stellar</span>
            </p>
          </button>

          {/* mBRANE STRIKE */}
          <button
            onClick={() => setSelectedService('strike')}
            className={`p-6 rounded-xl border-2 text-left transition-all ${
              selectedService === 'strike'
                ? 'border-primary-500 bg-primary-900/20'
                : 'border-dark-700 hover:border-dark-500 hover:bg-dark-800/50'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                selectedService === 'strike' ? 'border-primary-500' : 'border-dark-500'
              }`}>
                {selectedService === 'strike' && <div className="w-2 h-2 rounded-full bg-primary-500" />}
              </div>
              <h3 className="text-xl font-semibold">mBRANE STRIKE</h3>
            </div>
            <p className="text-sm text-dark-400 ml-7">
              Powered by <span className="text-primary-400 font-medium">Stellar</span> and <span className="text-red-400 font-medium">CrowdStrike</span>
            </p>
          </button>
        </div>
      </div>

      {/* Service Order Details */}
      {selectedService && (
        <div className="card mb-8 animate-fade-in">
          <h2 className="text-2xl font-semibold mb-6">Service Order Details</h2>

          <div className="space-y-4">
            {selectedService === 'mdr' && (
              <div className="bg-dark-800 rounded-lg p-5">
                <h3 className="font-semibold text-lg mb-3 text-primary-400">mBRANE MDR - Powered by Stellar</h3>
                <ul className="space-y-2 text-dark-300 text-sm">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    24/7 Managed Detection &amp; Response
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Stellar SIEM &amp; SOAR Platform
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Threat Intelligence &amp; Incident Response
                  </li>
                </ul>
              </div>
            )}

            {selectedService === 'strike' && (
              <>
                <div className="bg-dark-800 rounded-lg p-5">
                  <h3 className="font-semibold text-lg mb-3 text-primary-400">mBRANE STRIKE - Powered by Stellar &amp; CrowdStrike</h3>
                  <ul className="space-y-2 text-dark-300 text-sm">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Everything in mBRANE MDR
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      CrowdStrike Falcon EDR
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Advanced Endpoint Protection
                    </li>
                  </ul>
                </div>

                {/* VM License Count */}
                <div className="bg-red-900/10 border border-red-500/30 rounded-lg p-5">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                    CrowdStrike VM Licenses
                  </h3>
                  <p className="text-sm text-dark-400 mb-3">
                    Specify the number of virtual machines requiring CrowdStrike protection (max 50 licenses available).
                  </p>
                  <div className="max-w-xs">
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={vmCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val > 50) setVmCount('50');
                        else setVmCount(e.target.value);
                      }}
                      placeholder="Number of VMs (1-50)"
                      className="input-field"
                    />
                    <p className="text-xs text-dark-500 mt-1">Maximum 50 licenses available for PROOF</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Data Sources */}
      <div className="card mb-8">
        <h2 className="text-2xl font-semibold mb-2">Data Sources</h2>
        <p className="text-dark-400 text-sm mb-6">
          Select the data sources you have available. You can fill this now or have it ready by your kickoff call.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* API Sources */}
          <div className="bg-dark-800 rounded-lg p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              API
            </h3>
            <div className="space-y-1">
              <DataSourceCheckbox
                label="Entra ID"
                checked={dataSources.api.entraId}
                onChange={() => handleDataSourceChange('api', 'entraId')}
              />
              <DataSourceCheckbox
                label="M365"
                checked={dataSources.api.m365}
                onChange={() => handleDataSourceChange('api', 'm365')}
              />
              <DataSourceCheckbox
                label="EDR"
                checked={dataSources.api.edr}
                onChange={() => handleDataSourceChange('api', 'edr')}
              />
              <DataSourceCheckbox
                label="Google Workspace"
                checked={dataSources.api.googleWorkspace}
                onChange={() => handleDataSourceChange('api', 'googleWorkspace')}
              />
            </div>
          </div>

          {/* Syslog Sources */}
          <div className="bg-dark-800 rounded-lg p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              Syslog
            </h3>
            <div className="space-y-1">
              <DataSourceCheckbox
                label="Firewall"
                checked={dataSources.syslog.firewall}
                onChange={() => handleDataSourceChange('syslog', 'firewall')}
              />
              <DataSourceCheckbox
                label="Switch"
                checked={dataSources.syslog.switch}
                onChange={() => handleDataSourceChange('syslog', 'switch')}
              />
              <DataSourceCheckbox
                label="Active Directory"
                checked={dataSources.syslog.activeDirectory}
                onChange={() => handleDataSourceChange('syslog', 'activeDirectory')}
              />
            </div>
          </div>

          {/* Agent Sensor */}
          <div className="bg-dark-800 rounded-lg p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              Agent Sensor
            </h3>
            <div className="space-y-1">
              <DataSourceCheckbox
                label="Windows Servers"
                checked={dataSources.agentSensor.windowsServers}
                onChange={() => handleDataSourceChange('agentSensor', 'windowsServers')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* VM Resource Requirements */}
      <div className="card mb-8">
        <h2 className="text-2xl font-semibold mb-4">Virtual Machine Requirements for Sensors</h2>
        <p className="text-dark-400 text-sm mb-6">
          To deploy sensors in your environment, the following VM resources are required:
        </p>

        <div className="bg-dark-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left py-3 px-4 text-dark-400 font-medium">Resource</th>
                <th className="text-left py-3 px-4 text-dark-400 font-medium">Minimum</th>
                <th className="text-left py-3 px-4 text-dark-400 font-medium">Recommended</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-dark-700/50">
                <td className="py-3 px-4 font-medium">vCPU</td>
                <td className="py-3 px-4 text-dark-300">4 cores</td>
                <td className="py-3 px-4 text-primary-400">8 cores</td>
              </tr>
              <tr className="border-b border-dark-700/50">
                <td className="py-3 px-4 font-medium">RAM</td>
                <td className="py-3 px-4 text-dark-300">8 GB</td>
                <td className="py-3 px-4 text-primary-400">16 GB</td>
              </tr>
              <tr className="border-b border-dark-700/50">
                <td className="py-3 px-4 font-medium">Storage</td>
                <td className="py-3 px-4 text-dark-300">100 GB SSD</td>
                <td className="py-3 px-4 text-primary-400">250 GB SSD</td>
              </tr>
              <tr className="border-b border-dark-700/50">
                <td className="py-3 px-4 font-medium">Network</td>
                <td className="py-3 px-4 text-dark-300">1 Gbps</td>
                <td className="py-3 px-4 text-primary-400">1 Gbps</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">OS</td>
                <td className="py-3 px-4 text-dark-300" colSpan="2">Ubuntu 22.04 LTS or CentOS 8+</td>
              </tr>
            </tbody>
          </table>
        </div>

        <label className="flex items-center gap-3 cursor-pointer group mt-4">
          <div className="relative">
            <input
              type="checkbox"
              checked={vmRequirementsAcknowledged}
              onChange={(e) => setVmRequirementsAcknowledged(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
              vmRequirementsAcknowledged
                ? 'bg-primary-600 border-primary-600'
                : 'border-dark-500 group-hover:border-dark-400'
            }`}>
              {vmRequirementsAcknowledged && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-sm text-dark-300">I acknowledge the VM resource requirements listed above</span>
        </label>
      </div>

      {/* Customer Notes */}
      <div className="card mb-8">
        <h2 className="text-2xl font-semibold mb-4">Notes &amp; Guidance</h2>
        <p className="text-dark-400 text-sm mb-4">
          Share any specific notes, guidance, or priorities so we can align on what success looks like.
        </p>
        <textarea
          value={customerNotes}
          onChange={(e) => setCustomerNotes(e.target.value)}
          placeholder="Any special requirements, security considerations, compliance needs, or priorities you'd like us to know about..."
          rows={5}
          className="input-field resize-none"
        />
      </div>

      <div className="mt-12 flex justify-between">
        <button onClick={previousStep} className="btn-secondary">
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </button>

        <button
          onClick={handleContinue}
          className="btn-primary"
        >
          Continue
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PrerequisitesPage;
