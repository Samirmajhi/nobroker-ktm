import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
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

// Handle token expiration
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

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: 'tenant' | 'owner' | 'staff';
}

export interface ProfileData {
  fullName?: string;
  phone?: string;
  profilePictureUrl?: string;
}

export interface AuthResponse {
  message: string;
  user: {
    user_id: string;
    full_name: string;
    email: string;
    phone: string;
    role: 'tenant' | 'owner' | 'staff' | 'admin';
    kyc_status: 'pending' | 'verified' | 'rejected';
    profile_picture_url?: string;
    email_verified: boolean;
    phone_verified: boolean;
    created_at: string;
  };
  token: string;
}

export interface ProfileResponse {
  user: {
    user_id: string;
    full_name: string;
    email: string;
    phone: string;
    role: 'tenant' | 'owner' | 'staff' | 'admin';
    kyc_status: 'pending' | 'verified' | 'rejected';
    profile_picture_url?: string;
    email_verified: boolean;
    phone_verified: boolean;
    created_at: string;
  };
}

export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Register user
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Get user profile
  async getProfile(): Promise<ProfileResponse> {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Update user profile
  async updateProfile(profileData: ProfileData): Promise<ProfileResponse> {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Change password
  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },

  // Forgot password
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  async resetPassword(resetData: {
    token: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const response = await api.post('/auth/reset-password', resetData);
    return response.data;
  },

  // Verify email
  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  // Resend verification email
  async resendVerificationEmail(): Promise<{ message: string }> {
    const response = await api.post('/auth/resend-verification');
    return response.data;
  },

  // Logout (client-side only)
  logout(): void {
    localStorage.removeItem('token');
    // Redirect to login page
    window.location.href = '/login';
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('token');
  },

  // Set token
  setToken(token: string): void {
    localStorage.setItem('token', token);
  },

  // Clear token
  clearToken(): void {
    localStorage.removeItem('token');
  },

  // Google SSO Methods
  async getLinkedAccounts(): Promise<{ linkedAccounts: any[] }> {
    const response = await api.get('/auth/linked-accounts');
    return response.data;
  },

  // Google OAuth URL
  getGoogleAuthUrl(): string {
    return `${API_URL}/auth/google`;
  },
};

export default authService;
