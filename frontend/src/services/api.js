// services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor — attach admin API key for /admin/ routes
api.interceptors.request.use(
  (config) => {
    const adminKey = process.env.REACT_APP_ADMIN_API_KEY;
    if (adminKey && config.url?.includes('/admin')) {
      config.headers['x-admin-api-key'] = adminKey;
    }
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
    return Promise.reject(error);
  }
);

export const sessionAPI = {
  create: (companyName, inviteCode) => api.post('/sessions', { companyName, inviteCode }),
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
  deleteInvitation: (id) => api.delete(`/admin/config/invitations/${id}`),
  
  // Customer Pre-Setup (store complete customer profile)
  saveCustomerProfile: (data) => api.post('/admin/customer-profiles', data),
  getCustomerProfile: (code) => api.get(`/admin/customer-profiles/${code}`),
  getCustomerProfiles: () => api.get('/admin/customer-profiles'),
  updateCustomerProfile: (code, data) => api.put(`/admin/customer-profiles/${code}`, data),
  deleteCustomerProfile: (code) => api.delete(`/admin/customer-profiles/${code}`),
  
  // Staging & Approval Workflow
  saveStagingProfile: (data) => api.post('/admin/staging/profiles', data),
  getStagingProfiles: (status = 'all') => api.get('/admin/staging/profiles', { params: { status } }),
  getStagingProfile: (code) => api.get(`/admin/staging/profiles/${code}`),
  submitProfileForReview: (code, data) => api.post(`/admin/staging/profiles/${code}/submit`, data),
  approveProfile: (code, data) => api.post(`/admin/staging/profiles/${code}/approve`, data),
  rejectProfile: (code, data) => api.post(`/admin/staging/profiles/${code}/reject`, data),
  archiveProfile: (code, data) => api.post(`/admin/staging/profiles/${code}/archive`, data),
  getProfileAuditHistory: (code) => api.get(`/admin/staging/profiles/${code}/audit`)
};

export default api;
