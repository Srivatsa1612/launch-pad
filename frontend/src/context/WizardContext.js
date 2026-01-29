// context/WizardContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { sessionAPI, adminAPI } from '../services/api';

const WizardContext = createContext();

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
};

export const WizardProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [invitationCode, setInvitationCode] = useState(null);
  const [prefilledData, setPrefilledData] = useState(null);
  const [formData, setFormData] = useState({
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    notes: ''
  });

  // Load session from localStorage and check for invite code on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('wizardSessionId');
    const savedCompanyName = localStorage.getItem('wizardCompanyName');
    const savedStep = localStorage.getItem('wizardCurrentStep');

    if (savedSessionId) {
      setSessionId(savedSessionId);
      setCompanyName(savedCompanyName || '');
      setCurrentStep(parseInt(savedStep) || 1);
    }

    // Check URL for invite parameter
    const params = new URLSearchParams(window.location.search);
    const inviteCode = params.get('invite');
    if (inviteCode && !savedSessionId) {
      setInvitationCode(inviteCode);
      loadPrefilledData(inviteCode);
    }
  }, []);

  // Load customer pre-setup profile from invitation code
  const loadPrefilledData = async (code) => {
    try {
      setLoading(true);
      const response = await adminAPI.getCustomerProfile?.(code);
      if (response?.data) {
        setPrefilledData(response.data);
        setCompanyName(response.data.companyName);
        setFormData({
          primaryContactName: response.data.contactName || '',
          primaryContactEmail: response.data.contactEmail || '',
          primaryContactPhone: response.data.contactPhone || '',
          notes: response.data.notes || ''
        });
      }
    } catch (err) {
      console.warn('Could not load prefilled data:', err.message);
      setError(null); // Don't show error for missing invites
    } finally {
      setLoading(false);
    }
  };

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('wizardSessionId', sessionId);
      localStorage.setItem('wizardCompanyName', companyName);
      localStorage.setItem('wizardCurrentStep', currentStep.toString());
    }
  }, [sessionId, companyName, currentStep]);

  const createSession = async (company, inviteCode) => {
    try {
      setLoading(true);
      setError(null);
      const response = await sessionAPI.create(company, inviteCode);
      setSessionId(response.data.sessionId);
      setCompanyName(company);
      setCurrentStep(1);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadSession = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await sessionAPI.get(id);
      const data = response.data;
      setSessionId(id);
      setCompanyName(data.session.company_name);
      setCurrentStep(data.session.current_step);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 7));
  };

  const previousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const completeWizard = async () => {
    try {
      setLoading(true);
      setError(null);
      await sessionAPI.complete(sessionId);
      // Clear localStorage
      localStorage.removeItem('wizardSessionId');
      localStorage.removeItem('wizardCompanyName');
      localStorage.removeItem('wizardCurrentStep');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetWizard = () => {
    setSessionId(null);
    setCompanyName('');
    setCurrentStep(1);
    setFormData({
      primaryContactName: '',
      primaryContactEmail: '',
      primaryContactPhone: '',
      notes: ''
    });
    localStorage.removeItem('wizardSessionId');
    localStorage.removeItem('wizardCompanyName');
    localStorage.removeItem('wizardCurrentStep');
  };

  const updateFormData = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const value = {
    sessionId,
    companyName,
    currentStep,
    loading,
    error,
    formData,
    invitationCode,
    prefilledData,
    updateFormData,
    createSession,
    loadSession,
    loadPrefilledData,
    nextStep,
    previousStep,
    goToStep,
    completeWizard,
    resetWizard,
  };

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
};
