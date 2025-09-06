import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const visitsAPI = {
  // Get all visits for the current user
  getVisits: async () => {
    const response = await api.get('/visits/user');
    return response.data;
  },

  // Schedule a visit
  scheduleVisit: async (visitData: {
    listing_id: string;
    visit_datetime: string;
    visit_notes?: string;
  }) => {
    const response = await api.post('/visits', visitData);
    return response.data;
  },

  // Update visit status
  updateVisitStatus: async (visitId: string, statusData: {
    status: 'scheduled' | 'completed' | 'cancelled';
    feedback?: string;
  }) => {
    const response = await api.put(`/visits/${visitId}/status`, statusData);
    return response.data;
  },

  // Cancel a visit
  cancelVisit: async (visitId: string) => {
    const response = await api.post(`/visits/${visitId}/cancel`);
    return response.data;
  },

  // Get visits for a specific listing
  getListingVisits: async (listingId: string) => {
    const response = await api.get(`/visits/listing/${listingId}`);
    return response.data;
  },

  // Assign representative to a visit
  assignRepresentative: async (visitId: string, repId: string) => {
    const response = await api.put(`/visits/${visitId}/assign-rep`, { repId });
    return response.data;
  },

  // Get visit statistics for a listing
  getVisitStats: async (listingId: string) => {
    const response = await api.get(`/visits/listing/${listingId}/stats`);
    return response.data;
  },
  
  // Submit tenant/owner decision on a visit
  submitDecision: async (
    visitId: string,
    data: { decision: 'interested' | 'not_interested' | 'undecided'; notes?: string }
  ) => {
    const response = await api.post(`/visits/${visitId}/decision`, data);
    return response.data;
  },
};
