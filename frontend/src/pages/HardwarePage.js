// pages/HardwarePage.js - Placeholder for Step 5
import React, { useState } from 'react';
import { useWizard } from '../context/WizardContext';
import { hardwareAPI } from '../services/api';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

const HardwarePage = () => {
  const { sessionId, nextStep, previousStep } = useWizard();
  const [loading, setLoading] = useState(false);
  const [procurement, setProcurement] = useState('custom');
  const [requirements, setRequirements] = useState('DELL 32GB');
  const [gift, setGift] = useState('coffee_sampler');

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
            <label className="flex items-center gap-3">
              <input type="radio" name="procurement" value="standard" checked={procurement === 'standard'} onChange={(e) => setProcurement(e.target.value)} />
              <span>Yes — please coordinate standard laptop / setup</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="radio" name="procurement" value="custom" checked={procurement === 'custom'} onChange={(e) => setProcurement(e.target.value)} />
              <span>Yes — custom requirements</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="radio" name="procurement" value="internal" checked={procurement === 'internal'} onChange={(e) => setProcurement(e.target.value)} />
              <span>No — our team handles internally</span>
            </label>
          </div>
          {procurement === 'custom' && (
            <textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} className="input-field mt-4" rows="3" />
          )}
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Welcome Gift</h3>
          <div className="grid grid-cols-2 gap-4">
            {['Coffee / Tea Sampler', 'Leather Notebook Set', '$50 Charity Donation', 'Wireless Charger'].map((item, idx) => (
              <label key={idx} className="card cursor-pointer hover:border-primary-500 transition-all">
                <input type="radio" name="gift" value={item.toLowerCase().replace(/ /g, '_')} checked={gift === item.toLowerCase().replace(/ /g, '_')} onChange={(e) => setGift(e.target.value)} />
                <span className="ml-3">{item}</span>
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
