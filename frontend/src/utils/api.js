import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('onsite-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('onsite-token');
      localStorage.removeItem('onsite-user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/login', { email, password }),
  logout: () => {
    localStorage.removeItem('onsite-token');
    localStorage.removeItem('onsite-user');
  },
  getUser: () => {
    const user = localStorage.getItem('onsite-user');
    return user ? JSON.parse(user) : null;
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('onsite-token');
  }
};

// Checklist API
export const checklistAPI = {
  getChecklist: (locationId) => api.get(`/checklist/${locationId}`),
  submitChecklist: (locationId, formData) =>
    api.post(`/checklist/${locationId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

// Dashboard API
export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard'),
  getSubmissionDetails: (submissionId) => api.get(`/submissions/${submissionId}`),
  getLocations: () => api.get('/locations'),
  getVendors: () => api.get('/vendors'),
  getIVRs: () => api.get('/ivrs'),
  getDebugData: () => api.get('/debug'),
};
