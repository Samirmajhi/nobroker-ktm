import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { visitsAPI } from '../../services/visitsAPI';
import { AsyncThunkConfig } from '../store';

export interface Visit {
  visit_id: string;
  listing_id: string;
  tenant_id: string;
  rep_id?: string;
  visit_datetime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  visit_notes?: string;
  tenant_feedback?: string;
  rep_feedback?: string;
  tenant_decision?: 'interested' | 'not_interested' | 'undecided';
  owner_decision?: 'interested' | 'not_interested' | 'undecided';
  tenant_decision_notes?: string;
  owner_decision_notes?: string;
  created_at: string;
  updated_at: string;
  listing_title?: string;
  listing_location?: string;
  listing_price?: number;
  listing_photo?: string;
  owner_name?: string;
  tenant_name?: string;
  tenant_phone?: string;
}

interface VisitsState {
  visits: Visit[];
  currentVisit: Visit | null;
  loading: boolean;
  error: string | null;
}

const initialState: VisitsState = {
  visits: [],
  currentVisit: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchVisits = createAsyncThunk<
  Visit[],
  void,
  AsyncThunkConfig
>(
  'visits/fetchVisits',
  async (_, { rejectWithValue }) => {
    try {
      const response = await visitsAPI.getVisits();
      return response.visits || response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch visits');
    }
  }
);

export const scheduleVisit = createAsyncThunk<
  Visit,
  {
    listing_id: string;
    visit_datetime: string;
    visit_notes?: string;
  },
  AsyncThunkConfig
>(
  'visits/scheduleVisit',
  async (visitData, { rejectWithValue }) => {
    try {
      const response = await visitsAPI.scheduleVisit(visitData);
      return response.visit || response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to schedule visit');
    }
  }
);

export const updateVisitStatus = createAsyncThunk<
  Visit,
  {
    visit_id: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    feedback?: string;
  },
  AsyncThunkConfig
>(
  'visits/updateVisitStatus',
  async ({ visit_id, status, feedback }, { rejectWithValue }) => {
    try {
      const response = await visitsAPI.updateVisitStatus(visit_id, { status, feedback });
      return response.visit || response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update visit');
    }
  }
);

export const submitVisitDecision = createAsyncThunk<
  Visit,
  {
    visit_id: string;
    decision: 'interested' | 'not_interested' | 'undecided';
    notes?: string;
  },
  AsyncThunkConfig
>(
  'visits/submitDecision',
  async ({ visit_id, decision, notes }, { rejectWithValue }) => {
    try {
      const response = await visitsAPI.submitDecision(visit_id, { decision, notes });
      return response.visit || response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to submit decision');
    }
  }
);

export const cancelVisit = createAsyncThunk<
  string,
  string,
  AsyncThunkConfig
>(
  'visits/cancelVisit',
  async (visit_id, { rejectWithValue }) => {
    try {
      await visitsAPI.cancelVisit(visit_id);
      return visit_id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to cancel visit');
    }
  }
);

const visitsSlice = createSlice({
  name: 'visits',
  initialState,
  reducers: {
    setVisits: (state, action: PayloadAction<Visit[]>) => {
      state.visits = action.payload;
    },
    setCurrentVisit: (state, action: PayloadAction<Visit>) => {
      state.currentVisit = action.payload;
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
      // Fetch Visits
      .addCase(fetchVisits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVisits.fulfilled, (state, action) => {
        state.loading = false;
        state.visits = action.payload;
        state.error = null;
      })
      .addCase(fetchVisits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Schedule Visit
      .addCase(scheduleVisit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(scheduleVisit.fulfilled, (state, action) => {
        state.loading = false;
        state.visits.unshift(action.payload);
        state.error = null;
      })
      .addCase(scheduleVisit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Visit Status
      .addCase(updateVisitStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVisitStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.visits.findIndex(visit => visit.visit_id === action.payload.visit_id);
        if (index !== -1) {
          state.visits[index] = action.payload;
        }
        if (state.currentVisit?.visit_id === action.payload.visit_id) {
          state.currentVisit = action.payload;
        }
        state.error = null;
      })
      .addCase(updateVisitStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Submit Decision
      .addCase(submitVisitDecision.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitVisitDecision.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.visits.findIndex(visit => visit.visit_id === action.payload.visit_id);
        if (index !== -1) {
          state.visits[index] = action.payload;
        }
        if (state.currentVisit?.visit_id === action.payload.visit_id) {
          state.currentVisit = action.payload;
        }
        state.error = null;
      })
      .addCase(submitVisitDecision.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Cancel Visit
      .addCase(cancelVisit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelVisit.fulfilled, (state, action) => {
        state.loading = false;
        state.visits = state.visits.filter(visit => visit.visit_id !== action.payload);
        if (state.currentVisit?.visit_id === action.payload) {
          state.currentVisit = null;
        }
        state.error = null;
      })
      .addCase(cancelVisit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setVisits, setCurrentVisit, setLoading, setError, clearError } = visitsSlice.actions;
export default visitsSlice.reducer;
