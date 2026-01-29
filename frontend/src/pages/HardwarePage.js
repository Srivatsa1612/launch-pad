// pages/HardwarePage.js - Placeholder for Step 5
import React, { useState, useEffect } from 'react';
import { useWizard } from '../context/WizardContext';
import { hardwareAPI, configAPI } from '../services/api';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

const HardwarePage = () => {
  const { sessionId, nextStep, previousStep } = useWizard();
  const [loading, setLoading] = useState(false);
  const [procurement, setProcurement] = useState('custom');
  const [requirements, setRequirements] = useState('');
  const [gift, setGift] = useState('standard');
  const [hardwareOptions, setHardwareOptions] = useState({ deviceProcurement: [], welcomeGifts: [] });

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await configAPI.getAll();
        setHardwareOptions(response.data.hardwareOptions || { deviceProcurement: [], welcomeGifts: [] });
      } catch (error) {
        console.error('Error loading hardware config:', error);
      }
    };
    loadConfig();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      await hardwareAPI.save(sessionId, {
        deviceProcurement: procurement,
        deviceRequirements: requirements,
        welcomeGift: gift
      });
      nextStep();
    } catch (error) {
      console.error('Error saving hardware:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-12">Hardware & Welcome Touches</h1>
      
      <div className="space-y-6">
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Device Procurement</h3>
          <div className="space-y-3">
            {[...hardwareOptions.deviceProcurement].sort((a, b) => a.name.localeCompare(b.name)).map(option => (
              <label key={option.id} className="flex items-start gap-3">
                <input 
                  type="radio" 
                  name="procurement" 
                  value={option.id} 
                  checked={procurement === option.id} 
                  onChange={(e) => setProcurement(e.target.value)} 
                  className="mt-1"
                />
                <div>
                  <span className="font-medium">{option.name}</span>
                  <p className="text-sm text-dark-400">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
          {procurement === 'custom' && (
            <textarea 
              value={requirements} 
              onChange={(e) => setRequirements(e.target.value)} 
              className="input-field mt-4" 
              rows="3"
              placeholder="Specify your custom hardware requirements..."
            />
          )}
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Welcome Gift</h3>
          <div className="grid grid-cols-2 gap-4">
            {[...hardwareOptions.welcomeGifts].sort((a, b) => a.name.localeCompare(b.name)).map(giftOption => (
              <label key={giftOption.id} className="card cursor-pointer hover:border-primary-500 transition-all">
                <input 
                  type="radio" 
                  name="gift" 
                  value={giftOption.id} 
                  checked={gift === giftOption.id} 
                  onChange={(e) => setGift(e.target.value)} 
                />
                <div className="ml-3">
                  <span className="font-medium">{giftOption.name}</span>
                  <p className="text-xs text-dark-400 mt-1">{giftOption.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-between">
        <button onClick={previousStep} className="btn-secondary">
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </button>
        <button onClick={handleSave} disabled={loading} className="btn-primary">
          Selections complete — next
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default HardwarePage;
