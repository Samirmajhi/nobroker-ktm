import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AsyncThunkConfig } from '../store';

export interface Favorite {
  favorite_id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
  listing: {
    listing_id: string;
    title: string;
    location: string;
    price: number;
    primary_photo?: string;
    bedrooms: number;
    bathrooms: number;
  };
}

interface FavoritesState {
  favorites: Favorite[];
  loading: boolean;
  error: string | null;
}

const initialState: FavoritesState = {
  favorites: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchFavorites = createAsyncThunk<
  Favorite[],
  void,
  AsyncThunkConfig
>(
  'favorites/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/favorites', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch favorites');
      return data.favorites || data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch favorites');
    }
  }
);

export const addToFavorites = createAsyncThunk<
  Favorite,
  string,
  AsyncThunkConfig
>(
  'favorites/addToFavorites',
  async (listingId, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ listing_id: listingId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add to favorites');
      return data.favorite || data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add to favorites');
    }
  }
);

export const removeFromFavorites = createAsyncThunk<
  string,
  string,
  AsyncThunkConfig
>(
  'favorites/removeFromFavorites',
  async (listingId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/favorites/${listingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove from favorites');
      }
      return listingId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove from favorites');
    }
  }
);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    setFavorites: (state, action: PayloadAction<Favorite[]>) => {
      state.favorites = action.payload;
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
      // Fetch Favorites
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = action.payload;
        state.error = null;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add to Favorites
      .addCase(addToFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites.push(action.payload);
        state.error = null;
      })
      .addCase(addToFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Remove from Favorites
      .addCase(removeFromFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = state.favorites.filter(fav => fav.listing_id !== action.payload);
        state.error = null;
      })
      .addCase(removeFromFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFavorites, setLoading, setError, clearError } = favoritesSlice.actions;
export default favoritesSlice.reducer;
