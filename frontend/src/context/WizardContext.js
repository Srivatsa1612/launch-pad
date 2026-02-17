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
    const validateAndRestoreSession = async () => {
      // Check URL for invite parameter FIRST - it should take precedence
      const params = new URLSearchParams(window.location.search);
      let inviteCode = params.get('invite');

      // If the invite parameter is a full URL (user pasted URL as code), extract the actual code
      if (inviteCode) {
        try {
          if (inviteCode.startsWith('http://') || inviteCode.startsWith('https://')) {
            const nestedUrl = new URL(inviteCode);
            const nestedCode = nestedUrl.searchParams.get('invite');
            if (nestedCode) {
              inviteCode = nestedCode;
            }
          }
        } catch (e) {
          // Not a valid URL, use as-is
        }
      }

      if (inviteCode) {
        setInvitationCode(inviteCode);

        // Check if we already have a session for this same invite code (e.g. page refresh)
        const savedInviteCode = localStorage.getItem('wizardInviteCode');
        const savedSessionId = localStorage.getItem('wizardSessionId');

        if (savedSessionId && savedInviteCode === inviteCode) {
          // Same invite code - restore existing session (user refreshed the page)
          try {
            await sessionAPI.get(savedSessionId);
            setSessionId(savedSessionId);
            setCompanyName(localStorage.getItem('wizardCompanyName') || '');
            setCurrentStep(parseInt(localStorage.getItem('wizardCurrentStep')) || 1);
            // Still load prefilled data for context
            await loadPrefilledData(inviteCode);
            return;
          } catch (err) {
            // Session no longer exists, fall through to fresh start
          }
        }

        // Fresh start - clear any old session data
        localStorage.removeItem('wizardSessionId');
        localStorage.removeItem('wizardCompanyName');
        localStorage.removeItem('wizardCurrentStep');
        localStorage.setItem('wizardInviteCode', inviteCode);

        const data = await loadPrefilledData(inviteCode);

        // Check if data is substantially prefilled
        // If yes, jump to ReviewPage (step 8) for confirmation
        // If no, start at WelcomePage (step 1) with prefilled data in form fields
        if (isDataSubstantiallyPrefilled(data)) {
          setCurrentStep(8);
        } else {
          setCurrentStep(1);
        }
      } else {
        // No invite code in URL - clear any leftover session data
        // Customers must always access the wizard via an invite link
        localStorage.removeItem('wizardSessionId');
        localStorage.removeItem('wizardCompanyName');
        localStorage.removeItem('wizardCurrentStep');
        localStorage.removeItem('wizardInviteCode');
      }
    };

    validateAndRestoreSession();
  }, []);

  // Load customer pre-setup profile from invitation code
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
      setError(null); // Don't show error for missing invites
    } finally {
      setLoading(false);
    }
    return null;
  };

  // Check if prefilled data is "complete enough" to warrant jumping to ReviewPage
  // If only basic info (company name, contact), use normal wizard flow
  // If substantial data is pre-filled, jump to ReviewPage for confirmation
  const isDataSubstantiallyPrefilled = (data) => {
    if (!data) return false;

    const hasServiceInfo = data.serviceTier && data.serviceTier.trim() !== '';
    const hasHRInfo = data.hrisSystem && data.hrisSystem.trim() !== '';
    const hasHardwareInfo = (data.deviceChoice && data.deviceChoice.trim() !== '') ||
                           (data.giftChoice && data.giftChoice.trim() !== '');
    const hasKeyContacts = (data.billingEmail || data.techEmail || data.emergencyEmail);

    // If at least 2 of these major sections are filled, consider it substantially prefilled
    const filledSections = [hasServiceInfo, hasHRInfo, hasHardwareInfo, hasKeyContacts].filter(Boolean).length;
    return filledSections >= 2;
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
      // Backend returns session_id (snake_case), we need sessionId (camelCase)
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
      localStorage.removeItem('wizardInviteCode');
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
    localStorage.removeItem('wizardInviteCode');
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
