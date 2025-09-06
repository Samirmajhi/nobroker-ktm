import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { listingsAPI, CreateListingData } from '../../services/listingsAPI';
import { AsyncThunkConfig } from '../store';

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

interface ListingsState {
  listings: Listing[];
  currentListing: Listing | null;
  loading: boolean;
  error: string | null;
}

const initialState: ListingsState = {
  listings: [],
  currentListing: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchListings = createAsyncThunk<
  Listing[],
  any,
  AsyncThunkConfig
>(
  'listings/fetchListings',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await listingsAPI.getListings(filters);
      return response.listings || response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch listings');
    }
  }
);

export const fetchListingById = createAsyncThunk<
  Listing,
  string,
  AsyncThunkConfig
>(
  'listings/fetchListingById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await listingsAPI.getListing(id);
      return response.listing || response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch listing');
    }
  }
);

export const createListing = createAsyncThunk<
  Listing,
  { data: CreateListingData; photos?: File[] },
  AsyncThunkConfig
>(
  'listings/createListing',
  async ({ data, photos }, { rejectWithValue }) => {
    try {
      const response = await listingsAPI.createListing(data);
      const created: Listing = response.listing || response;

      // Upload photos if provided
      if (photos && photos.length > 0) {
        await listingsAPI.uploadPhotos(created.listing_id, photos, true);
      }

      return created;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create listing');
    }
  }
);

export const updateListing = createAsyncThunk<
  Listing,
  { id: string; data: any },
  AsyncThunkConfig
>(
  'listings/updateListing',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await listingsAPI.updateListing(id, data);
      return response.listing || response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update listing');
    }
  }
);

export const deleteListing = createAsyncThunk<
  string,
  string,
  AsyncThunkConfig
>(
  'listings/deleteListing',
  async (id, { rejectWithValue }) => {
    try {
      await listingsAPI.deleteListing(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete listing');
    }
  }
);

export const fetchUserListings = createAsyncThunk<
  Listing[],
  void,
  AsyncThunkConfig
>(
  'listings/fetchUserListings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await listingsAPI.getUserListings();
      return response.listings || response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch user listings');
    }
  }
);

const listingsSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {
    setListings: (state, action: PayloadAction<Listing[]>) => {
      state.listings = action.payload;
    },
    setCurrentListing: (state, action: PayloadAction<Listing>) => {
      state.currentListing = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Listings
      .addCase(fetchListings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchListings.fulfilled, (state, action) => {
        state.loading = false;
        state.listings = action.payload;
        state.error = null;
      })
      .addCase(fetchListings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Listing by ID
      .addCase(fetchListingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchListingById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentListing = action.payload;
        state.error = null;
      })
      .addCase(fetchListingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Listing
      .addCase(createListing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createListing.fulfilled, (state, action) => {
        state.loading = false;
        state.listings.unshift(action.payload);
        state.error = null;
      })
      .addCase(createListing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Listing
      .addCase(updateListing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateListing.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.listings.findIndex(listing => listing.listing_id === action.payload.listing_id);
        if (index !== -1) {
          state.listings[index] = action.payload;
        }
        if (state.currentListing?.listing_id === action.payload.listing_id) {
          state.currentListing = action.payload;
        }
        state.error = null;
      })
      .addCase(updateListing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Listing
      .addCase(deleteListing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteListing.fulfilled, (state, action) => {
        state.loading = false;
        state.listings = state.listings.filter(listing => listing.listing_id !== action.payload);
        if (state.currentListing?.listing_id === action.payload) {
          state.currentListing = null;
        }
        state.error = null;
      })
      .addCase(deleteListing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch User Listings
      .addCase(fetchUserListings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserListings.fulfilled, (state, action) => {
        state.loading = false;
        state.listings = action.payload;
        state.error = null;
      })
      .addCase(fetchUserListings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setListings, setCurrentListing, setLoading, setError, clearError } = listingsSlice.actions;
export default listingsSlice.reducer;
