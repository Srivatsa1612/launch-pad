// services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const sessionAPI = {
  create: (companyName) => api.post('/sessions', { companyName }),
  get: (sessionId) => api.get(`/sessions/${sessionId}`),
  complete: (sessionId) => api.post(`/sessions/${sessionId}/complete`),
};

export const contactsAPI = {
  save: (sessionId, contacts) => api.post('/contacts', { sessionId, contacts }),
  get: (sessionId) => api.get(`/contacts/${sessionId}`),
};

export const serviceOrderAPI = {
  save: (sessionId, order) => api.post('/service-order', { sessionId, order }),
  get: (sessionId) => api.get(`/service-order/${sessionId}`),
};

export const hrSetupAPI = {
  save: (sessionId, hrSetup) => api.post('/hr-setup', { sessionId, hrSetup }),
  get: (sessionId) => api.get(`/hr-setup/${sessionId}`),
  uploadFile: (sessionId, file) => {
    const formData = new FormData();
    formData.append('employeeFile', file);
    return api.post(`/hr-setup/${sessionId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const hardwareAPI = {
  save: (sessionId, hardware) => api.post('/hardware', { sessionId, hardware }),
  get: (sessionId) => api.get(`/hardware/${sessionId}`),
};

export const supportAPI = {
  save: (sessionId, support) => api.post('/support', { sessionId, support }),
  get: (sessionId) => api.get(`/support/${sessionId}`),
};

export const configAPI = {
  getAll: () => api.get('/config'),
  getConcierges: () => api.get('/config/concierges'),
  getServiceTiers: () => api.get('/config/service-tiers')
};

export const adminAPI = {
  // Concierges
  addConcierge: (data) => api.post('/admin/config/concierges', data),
  updateConcierge: (id, data) => api.put(`/admin/config/concierges/${id}`, data),
  deleteConcierge: (id) => api.delete(`/admin/config/concierges/${id}`),
  
  // Service Tiers
  addServiceTier: (data) => api.post('/admin/config/service-tiers', data),
  updateServiceTier: (id, data) => api.put(`/admin/config/service-tiers/${id}`, data),
  deleteServiceTier: (id) => api.delete(`/admin/config/service-tiers/${id}`),
  
  // HRIS & Hardware
  updateHRISSystems: (data) => api.put('/admin/config/hris-systems', data),
  updateHardwareOptions: (data) => api.put('/admin/config/hardware-options', data),
  
  // Invitations
  addInvitation: (data) => api.post('/admin/config/invitations', data),
  deleteInvitation: (id) => api.delete(`/admin/config/invitations/${id}`)
};

export default api;
