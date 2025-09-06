import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
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

export interface CreateListingData {
  title: string;
  description: string;
  price: number;
  deposit: number;
  size: number;
  bedrooms: number;
  bathrooms: number;
  location: string;
  latitude?: number;
  longitude?: number;
  amenities: string[];
  availabilityDate?: string;
  propertyType: string;
  furnishingStatus: 'furnished' | 'semi-furnished' | 'unfurnished';
  parkingAvailable: boolean;
  petFriendly: boolean;
}

export interface Listing {
  listing_id: string;
  owner_id: string;
  title: string;
  description: string;
  price: number;
  deposit: number;
  size: number;
  bedrooms: number;
  bathrooms: number;
  location: string;
  latitude?: number;
  longitude?: number;
  amenities: string[];
  availability_date?: string;
  safe_rent_verified: boolean;
  property_type: string;
  furnishing_status: 'furnished' | 'semi-furnished' | 'unfurnished';
  parking_available: boolean;
  pet_friendly: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  primary_photo?: string;
  owner_name?: string;
  owner_kyc_status?: string;
  photos?: Array<{
    photo_id: string;
    photo_url: string;
    photo_type: string;
    is_primary: boolean;
    created_at: string;
  }>;
  ratings?: {
    average: number;
    total: number;
  };
}

export const listingsAPI = {
  // Create new listing (JSON)
  createListing: async (listingData: CreateListingData) => {
    const response = await api.post('/listings', listingData);
    return response.data;
  },

  // Upload listing photos (multipart)
  uploadPhotos: async (listingId: string, files: File[], isPrimaryFirst: boolean = true) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('photos', file));
    if (isPrimaryFirst) {
      formData.append('isPrimary', 'true');
    }
    const response = await api.post(`/listings/${listingId}/photos`, formData);
    return response.data;
  },

  // Get all listings
  getListings: async (filters?: any) => {
    const response = await api.get('/listings', { params: filters });
    return response.data;
  },

  // Get listing by ID
  getListing: async (id: string) => {
    const response = await api.get(`/listings/${id}`);
    return response.data;
  },

  // Update listing
  updateListing: async (id: string, listingData: Partial<CreateListingData>) => {
    const response = await api.put(`/listings/${id}`, listingData);
    return response.data;
  },

  // Delete listing
  deleteListing: async (id: string) => {
    const response = await api.delete(`/listings/${id}`);
    return response.data;
  },

  // Get user's listings
  getUserListings: async () => {
    const response = await api.get('/listings/my-listings');
    return response.data;
  },
};
