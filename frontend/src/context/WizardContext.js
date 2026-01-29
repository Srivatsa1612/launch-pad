// context/WizardContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { sessionAPI } from '../services/api';

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

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('wizardSessionId');
    const savedCompanyName = localStorage.getItem('wizardCompanyName');
    const savedStep = localStorage.getItem('wizardCurrentStep');

    if (savedSessionId) {
      setSessionId(savedSessionId);
      setCompanyName(savedCompanyName || '');
      setCurrentStep(parseInt(savedStep) || 1);
    }
  }, []);

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('wizardSessionId', sessionId);
      localStorage.setItem('wizardCompanyName', companyName);
      localStorage.setItem('wizardCurrentStep', currentStep.toString());
    }
  }, [sessionId, companyName, currentStep]);

  const createSession = async (company) => {
    try {
      setLoading(true);
      setError(null);
      const response = await sessionAPI.create(company);
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
    localStorage.removeItem('wizardSessionId');
    localStorage.removeItem('wizardCompanyName');
    localStorage.removeItem('wizardCurrentStep');
  };

  const value = {
    sessionId,
    companyName,
    currentStep,
    loading,
    error,
    createSession,
    loadSession,
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
