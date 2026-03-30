// pages/HardwarePage.js - Step 5: Hardware & Welcome Touches
import React, { useState, useEffect } from 'react';
import { useWizard } from '../context/WizardContext';
import { hardwareAPI, configAPI } from '../services/api';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

// Icon mapping for device options
const deviceIcons = {
  standard: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  premium: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  custom: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

// Icon mapping for gift options
const giftIcons = {
  swag: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A1.75 1.75 0 003 15.546V12a1 1 0 011-1h16a1 1 0 011 1v3.546zM3 11V8a1 1 0 011-1h16a1 1 0 011 1v3M12 7V3" />
    </svg>
  ),
  gift: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
    </svg>
  ),
  tech: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  none: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  ),
};

// Get a device icon based on the option name
const getDeviceIcon = (name) => {
  const lower = (name || '').toLowerCase();
  if (lower.includes('premium') || lower.includes('elite') || lower.includes('pro')) return deviceIcons.premium;
  if (lower.includes('custom') || lower.includes('byod') || lower.includes('specify')) return deviceIcons.custom;
  return deviceIcons.standard;
};

// Get a gift icon based on the option name
const getGiftIcon = (name) => {
  const lower = (name || '').toLowerCase();
  if (lower.includes('swag') || lower.includes('apparel') || lower.includes('merch')) return giftIcons.swag;
  if (lower.includes('tech') || lower.includes('gadget') || lower.includes('electronic')) return giftIcons.tech;
  if (lower.includes('none') || lower.includes('skip') || lower.includes('no ')) return giftIcons.none;
  return giftIcons.gift;
};

const HardwarePage = () => {
  const { sessionId, nextStep, previousStep } = useWizard();
  const [loading, setLoading] = useState(false);
  const [procurement, setProcurement] = useState('');
  const [requirements, setRequirements] = useState('');
  const [gift, setGift] = useState('');
  const [hardwareOptions, setHardwareOptions] = useState([]);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const configResponse = await configAPI.getAll();
        setHardwareOptions(Array.isArray(configResponse.data.hardwareOptions) ? configResponse.data.hardwareOptions : []);

        if (sessionId) {
          const savedResponse = await hardwareAPI.get(sessionId);
          if (savedResponse.data && Object.keys(savedResponse.data).length > 0) {
            if (savedResponse.data.deviceProcurement) setProcurement(savedResponse.data.deviceProcurement);
            if (savedResponse.data.welcomeGift) setGift(savedResponse.data.welcomeGift);
          }
        }
      } catch (error) {
        console.error('Error loading hardware data:', error);
      }
    };
    loadData();
  }, [sessionId]);

  const isValid = () => {
    return procurement && gift;
  };

  const handleSave = async () => {
    if (!isValid()) {
      setSaveError('Please select both a device and a welcome gift before continuing.');
      return;
    }
    try {
      setLoading(true);
      setSaveError('');
      await hardwareAPI.save(sessionId, {
        deviceProcurement: procurement,
        deviceRequirements: requirements,
        welcomeGift: gift
      });
      nextStep();
    } catch (error) {
      console.error('Error saving hardware:', error);
      setSaveError(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to save hardware preferences. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const deviceOptions = [...hardwareOptions.filter(h => h.option_type === 'device')].sort((a, b) => a.name.localeCompare(b.name));
  const giftOptions = [...hardwareOptions.filter(h => h.option_type === 'gift')].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Hardware & Welcome Touches</h1>
        <p className="text-dark-300 text-lg">
          Choose how you'd like devices provisioned and pick a welcome gift for your team.
        </p>
      </div>

      {/* Device Procurement Section */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold">Device Procurement</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {deviceOptions.map((option, index) => {
            const isSelected = procurement === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setProcurement(option.id)}
                className={`
                  card-interactive text-left relative overflow-hidden
                  ${isSelected ? 'selected' : ''}
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center animate-scale-in">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                <div className={`mb-4 transition-colors duration-200 ${isSelected ? 'text-primary-400' : 'text-dark-400'}`}>
                  {getDeviceIcon(option.name)}
                </div>
                <h4 className="font-semibold text-lg mb-2">{option.name}</h4>
                <p className="text-sm text-dark-400 leading-relaxed">{option.description}</p>
              </button>
            );
          })}
        </div>

        {/* Custom requirements textarea */}
        {procurement === 'custom' && (
          <div className="mt-4 animate-fade-in">
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="input-field"
              rows="3"
              placeholder="Specify your custom hardware requirements..."
            />
          </div>
        )}
      </div>

      {/* Welcome Gift Section */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-amber-600/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold">Welcome Gift</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {giftOptions.map((giftOption, index) => {
            const isSelected = gift === giftOption.id;
            return (
              <button
                key={giftOption.id}
                onClick={() => setGift(giftOption.id)}
                className={`
                  card-interactive text-center relative overflow-hidden
                  ${isSelected ? 'selected' : ''}
                `}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center animate-scale-in">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                <div className={`mx-auto mb-3 w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200 ${
                  isSelected ? 'bg-primary-600/20 text-primary-400' : 'bg-dark-700 text-dark-400'
                }`}>
                  {getGiftIcon(giftOption.name)}
                </div>
                <h4 className="font-medium text-sm mb-1">{giftOption.name}</h4>
                <p className="text-xs text-dark-400 leading-relaxed">{giftOption.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {saveError && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg animate-fade-in">
          <p className="text-sm text-red-400 font-medium">{saveError}</p>
        </div>
      )}

      <div className="mt-12 flex justify-between">
        <button onClick={previousStep} className="btn-secondary">
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </button>
        <button onClick={handleSave} disabled={!isValid() || loading} className="btn-primary">
          {loading ? 'Saving...' : 'Save & Continue'}
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default HardwarePage;
