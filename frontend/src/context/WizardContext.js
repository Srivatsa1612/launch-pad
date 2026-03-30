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

const TOTAL_STEPS = 5;

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
    const validateAndRestoreSession = async () => {
      const params = new URLSearchParams(window.location.search);
      const inviteCode = params.get('invite');

      if (inviteCode) {
        localStorage.removeItem('wizardSessionId');
        localStorage.removeItem('wizardCompanyName');
        localStorage.removeItem('wizardCurrentStep');

        setInvitationCode(inviteCode);
        const data = await loadPrefilledData(inviteCode);

        if (isDataSubstantiallyPrefilled(data)) {
          setCurrentStep(1); // Always start at welcome for launchPAD
        } else {
          setCurrentStep(1);
        }
      } else {
        const savedSessionId = localStorage.getItem('wizardSessionId');
        const savedCompanyName = localStorage.getItem('wizardCompanyName');
        const savedStep = localStorage.getItem('wizardCurrentStep');

        if (savedSessionId) {
          try {
            await sessionAPI.get(savedSessionId);
            setSessionId(savedSessionId);
            setCompanyName(savedCompanyName || '');
            setCurrentStep(parseInt(savedStep) || 1);
          } catch (err) {
            localStorage.removeItem('wizardSessionId');
            localStorage.removeItem('wizardCompanyName');
            localStorage.removeItem('wizardCurrentStep');
          }
        }
      }
    };

    validateAndRestoreSession();
  }, []);

  const loadPrefilledData = async (code) => {
    try {
      setLoading(true);
      const response = await adminAPI.getCustomerProfile(code);
      if (response?.data) {
        setPrefilledData(response.data);
        setCompanyName(response.data.companyName || '');
        setFormData({
          primaryContactName: response.data.contactName || '',
          primaryContactEmail: response.data.contactEmail || '',
          primaryContactPhone: response.data.contactPhone || '',
          notes: response.data.notes || ''
        });
        return response.data;
      }
    } catch (err) {
      setError(null);
    } finally {
      setLoading(false);
    }
    return null;
  };

  const isDataSubstantiallyPrefilled = (data) => {
    if (!data) return false;

    const hasServiceInfo = data.serviceTier && data.serviceTier.trim() !== '';
    const hasHRInfo = data.hrisSystem && data.hrisSystem.trim() !== '';
    const hasHardwareInfo = (data.deviceChoice && data.deviceChoice.trim() !== '') ||
                           (data.giftChoice && data.giftChoice.trim() !== '');
    const hasKeyContacts = (data.billingEmail || data.techEmail || data.emergencyEmail);

    const filledSections = [hasServiceInfo, hasHRInfo, hasHardwareInfo, hasKeyContacts].filter(Boolean).length;
    return filledSections >= 2;
  };

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
      const sessionIdValue = response.data.sessionId || response.data.session_id;
      if (!sessionIdValue) {
        throw new Error('No session ID returned from server');
      }
      setSessionId(sessionIdValue);
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
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
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
      if (sessionId) {
        await sessionAPI.complete(sessionId);
      }
      localStorage.removeItem('wizardSessionId');
      localStorage.removeItem('wizardCompanyName');
      localStorage.removeItem('wizardCurrentStep');
    } catch (err) {
      setError(err.message);
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
