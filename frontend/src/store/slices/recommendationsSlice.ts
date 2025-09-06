import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Recommendation {
  recommendation_id: string;
  user_id: string;
  listing_id: string;
  score: number;
  reason: string;
  created_at: string;
}

interface RecommendationsState {
  recommendations: Recommendation[];
  isLoading: boolean;
  error: string | null;
}

const initialState: RecommendationsState = {
  recommendations: [],
  isLoading: false,
  error: null,
};

const recommendationsSlice = createSlice({
  name: 'recommendations',
  initialState,
  reducers: {
    setRecommendations: (state, action: PayloadAction<Recommendation[]>) => {
      state.recommendations = action.payload;
    },
    addRecommendation: (state, action: PayloadAction<Recommendation>) => {
      state.recommendations.push(action.payload);
    },
    clearRecommendations: (state) => {
      state.recommendations = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { 
  setRecommendations, 
  addRecommendation, 
  clearRecommendations, 
  setLoading, 
  setError 
} = recommendationsSlice.actions;
export default recommendationsSlice.reducer;
