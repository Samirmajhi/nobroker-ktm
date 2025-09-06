import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Agreement {
  agreement_id: string;
  listing_id: string;
  tenant_id: string;
  owner_id: string;
  signed_date: string;
  rent: number;
  deposit: number;
  escrow_enabled: boolean;
  platform_fee: number;
  agreement_pdf_url?: string;
  start_date: string;
  end_date: string;
  terms_conditions?: string;
  status: 'draft' | 'active' | 'expired' | 'terminated';
  created_at: string;
  updated_at: string;
}

interface AgreementsState {
  agreements: Agreement[];
  currentAgreement: Agreement | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AgreementsState = {
  agreements: [],
  currentAgreement: null,
  isLoading: false,
  error: null,
};

const agreementsSlice = createSlice({
  name: 'agreements',
  initialState,
  reducers: {
    setAgreements: (state, action: PayloadAction<Agreement[]>) => {
      state.agreements = action.payload;
    },
    setCurrentAgreement: (state, action: PayloadAction<Agreement>) => {
      state.currentAgreement = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setAgreements, setCurrentAgreement, setLoading, setError } = agreementsSlice.actions;
export default agreementsSlice.reducer;
