// pages/ServiceOrderPage.js - Step 3: Confirm Service Order
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
        const tiersResponse = await configAPI.getServiceTiers();
        setServiceTiers(tiersResponse.data);

        const orderResponse = await serviceOrderAPI.get(sessionId);
        if (orderResponse.data && Object.keys(orderResponse.data).length > 0) {
          setOrder(orderResponse.data);
          setConfirmed(orderResponse.data.confirmationAccepted);
        } else {
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

  const orderDetails = [
    {
      label: 'Service Tier',
      value: order.serviceTier,
      icon: (
        <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      label: 'Start Date',
      value: new Date(order.startDate).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
      }),
      icon: (
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Contract Term',
      value: `${order.contractTerm} Months`,
      icon: (
        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Monthly Commitment',
      value: `$${order.monthlyCommitment.toLocaleString('en-US', {
        minimumFractionDigits: 2, maximumFractionDigits: 2
      })}`,
      icon: (
        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Confirming Your Service Order</h1>
        <p className="text-dark-300 text-lg">
          Just a quick double-check so everything starts perfectly aligned.
        </p>
      </div>

      <div className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orderDetails.map((detail, index) => (
            <div
              key={index}
              className="group flex items-start gap-4 p-4 rounded-lg hover:bg-dark-700/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center flex-shrink-0 group-hover:bg-dark-600 transition-colors">
                {detail.icon}
              </div>
              <div>
                <p className="text-dark-400 text-sm mb-1">{detail.label}</p>
                <p className="text-xl font-semibold">{detail.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-dark-700">
          <div className="flex items-center gap-3 mb-3">
            <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-dark-400 text-sm">Included Features</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {order.includedFeatures.map((feature, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-600/10 border border-primary-600/20 text-sm text-primary-300"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </span>
            ))}
          </div>
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
