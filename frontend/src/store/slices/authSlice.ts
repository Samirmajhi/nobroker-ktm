import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import { AsyncThunkConfig } from '../store';

export interface User {
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
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean; // Add this for backward compatibility
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  loading: false, // Add this for backward compatibility
  error: null,
};

// Async thunks
export const login = createAsyncThunk<
  { user: User; token: string },
  { email: string; password: string },
  AsyncThunkConfig
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('token', response.token);
      // Ensure the user object has all required properties
      const user: User = {
        user_id: response.user.user_id,
        full_name: response.user.full_name,
        email: response.user.email,
        phone: response.user.phone,
        role: response.user.role,
        kyc_status: response.user.kyc_status,
        profile_picture_url: response.user.profile_picture_url,
        email_verified: response.user.email_verified,
        phone_verified: response.user.phone_verified,
        created_at: response.user.created_at,
      };
      return { user, token: response.token };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Login failed');
    }
  }
);

export const register = createAsyncThunk<
  { user: User; token: string },
  {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: 'tenant' | 'owner' | 'staff';
  },
  AsyncThunkConfig
>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      localStorage.setItem('token', response.token);
      // Ensure the user object has all required properties
      const user: User = {
        user_id: response.user.user_id,
        full_name: response.user.full_name,
        email: response.user.email,
        phone: response.user.phone,
        role: response.user.role,
        kyc_status: response.user.kyc_status,
        profile_picture_url: response.user.profile_picture_url,
        email_verified: response.user.email_verified,
        phone_verified: response.user.phone_verified,
        created_at: response.user.created_at,
      };
      return { user, token: response.token };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Registration failed');
    }
  }
);

export const getProfile = createAsyncThunk<
  User,
  void,
  AsyncThunkConfig
>(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      // Ensure the user object has all required properties
      const user: User = {
        user_id: response.user.user_id,
        full_name: response.user.full_name,
        email: response.user.email,
        phone: response.user.phone,
        role: response.user.role,
        kyc_status: response.user.kyc_status,
        profile_picture_url: response.user.profile_picture_url,
        email_verified: response.user.email_verified,
        phone_verified: response.user.phone_verified,
        created_at: response.user.created_at,
      };
      return user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk<
  User,
  {
    fullName?: string;
    phone?: string;
    profilePictureUrl?: string;
  },
  AsyncThunkConfig
>(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(profileData);
      // Ensure the user object has all required properties
      const user: User = {
        user_id: response.user.user_id,
        full_name: response.user.full_name,
        email: response.user.email,
        phone: response.user.phone,
        role: response.user.role,
        kyc_status: response.user.kyc_status,
        profile_picture_url: response.user.profile_picture_url,
        email_verified: response.user.email_verified,
        phone_verified: response.user.phone_verified,
        created_at: response.user.created_at,
      };
      return user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update profile');
    }
  }
);

export const changePassword = createAsyncThunk<
  void,
  {
    currentPassword: string;
    newPassword: string;
  },
  AsyncThunkConfig
>(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      await authService.changePassword(passwordData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to change password');
    }
  }
);

export const logout = createAsyncThunk<
  null,
  void,
  AsyncThunkConfig
>(
  'auth/logout',
  async () => {
    localStorage.removeItem('token');
    return null;
  }
);

// New action for staff login that bypasses the normal login flow
export const staffLogin = createAsyncThunk<
  { user: User; token: string },
  { user: User; token: string },
  AsyncThunkConfig
>(
  'auth/staffLogin',
  async (data) => {
    // For staff login, we already have the user data and token
    // Just return them to update the state
    return data;
  }
);

// SSO login action for handling OAuth callbacks
export const ssoLogin = createAsyncThunk<
  User,
  string, // token
  AsyncThunkConfig
>(
  'auth/ssoLogin',
  async (token, { rejectWithValue }) => {
    try {
      // Set token in localStorage
      localStorage.setItem('token', token);
      
      // Get user profile
      const response = await authService.getProfile();
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'SSO login failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload);
    },
    clearToken: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      // Staff Login
      .addCase(staffLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      // SSO Login
      .addCase(ssoLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(ssoLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.token = localStorage.getItem('token');
        state.error = null;
      })
      .addCase(ssoLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setToken, clearToken, updateUser } = authSlice.actions;
export default authSlice.reducer;
