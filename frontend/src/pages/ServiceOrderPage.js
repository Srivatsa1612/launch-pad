// pages/ServiceOrderPage.js
import React, { useState, useEffect } from 'react';
import { useWizard } from '../context/WizardContext';
import { serviceOrderAPI, configAPI } from '../services/api';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '@heroicons/react/24/solid';

const ServiceOrderPage = () => {
  const { sessionId, nextStep, previousStep } = useWizard();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [serviceTiers, setServiceTiers] = useState([]);
  const [order, setOrder] = useState({
    serviceTier: 'Enterprise Elite',
    startDate: '2026-02-01',
    contractTerm: 12,
    monthlyCommitment: 2450.00,
    includedFeatures: ['24/7 Concierge', 'Priority Patching', 'Custom Modules'],
    confirmationAccepted: false
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load service tiers from config
        const tiersResponse = await configAPI.getServiceTiers();
        setServiceTiers(tiersResponse.data);

        // Load saved order if exists
        const orderResponse = await serviceOrderAPI.get(sessionId);
        if (orderResponse.data && Object.keys(orderResponse.data).length > 0) {
          setOrder(orderResponse.data);
          setConfirmed(orderResponse.data.confirmationAccepted);
        } else {
          // Set default to recommended tier
          const recommended = tiersResponse.data.find(t => t.recommended);
          if (recommended) {
            setOrder(prev => ({
              ...prev,
              serviceTier: recommended.name,
              monthlyCommitment: recommended.monthlyPrice,
              includedFeatures: recommended.features
            }));
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    if (sessionId) {
      loadData();
    }
  }, [sessionId]);

  const handleSave = async () => {
    try {
      setLoading(true);
      await serviceOrderAPI.save(sessionId, { ...order, confirmationAccepted: confirmed });
      nextStep();
    } catch (error) {
      console.error('Error saving service order:', error);
      alert('Failed to save service order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Confirming Your Service Order</h1>
        <p className="text-dark-300 text-lg">
          Just a quick double-check so everything starts perfectly aligned.
        </p>
      </div>

      <div className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-dark-400 text-sm mb-2">Service Tier</p>
            <p className="text-xl font-semibold">{order.serviceTier}</p>
          </div>
          
          <div>
            <p className="text-dark-400 text-sm mb-2">Start Date</p>
            <p className="text-xl font-semibold">
              {new Date(order.startDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
          
          <div>
            <p className="text-dark-400 text-sm mb-2">Contract Term</p>
            <p className="text-xl font-semibold">{order.contractTerm} Months</p>
          </div>
          
          <div>
            <p className="text-dark-400 text-sm mb-2">Monthly Commitment</p>
            <p className="text-xl font-semibold">
              ${order.monthlyCommitment.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-dark-700">
          <p className="text-dark-400 text-sm mb-3">Included Features</p>
          <p className="text-lg font-medium">{order.includedFeatures.join(', ')}</p>
        </div>
      </div>

      <div className="mt-8">
        <label className="flex items-start gap-4 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-6 h-6 rounded border-2 border-dark-600 bg-dark-900 checked:bg-primary-600 checked:border-primary-600 cursor-pointer transition-all"
            />
            {confirmed && (
              <CheckIcon className="w-4 h-4 text-white absolute top-1 left-1 pointer-events-none" />
            )}
          </div>
          <div>
            <p className="text-lg font-medium group-hover:text-primary-400 transition-colors">
              I confirm the above details are correct
            </p>
            <p className="text-sm text-dark-400 mt-1">
              Need changes? Our sales team is one click away.
            </p>
          </div>
        </label>
      </div>

      <div className="mt-12 flex justify-between">
        <button onClick={previousStep} className="btn-secondary">
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </button>
        
        <button
          onClick={handleSave}
          disabled={!confirmed || loading}
          className="btn-primary"
        >
          {loading ? 'Saving...' : 'Confirmed — next please'}
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ServiceOrderPage;
