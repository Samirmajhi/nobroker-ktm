import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Payment {
  payment_id: string;
  agreement_id: string;
  tenant_id: string;
  owner_id: string;
  amount: number;
  payment_type: 'rent' | 'deposit' | 'platform_fee' | 'other';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: 'bank_transfer' | 'credit_card' | 'digital_wallet' | 'cash';
  transaction_id?: string;
  payment_date: string;
  due_date: string;
  created_at: string;
  updated_at: string;
}

interface PaymentsState {
  payments: Payment[];
  currentPayment: Payment | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PaymentsState = {
  payments: [],
  currentPayment: null,
  isLoading: false,
  error: null,
};

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    setPayments: (state, action: PayloadAction<Payment[]>) => {
      state.payments = action.payload;
    },
    setCurrentPayment: (state, action: PayloadAction<Payment>) => {
      state.currentPayment = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setPayments, setCurrentPayment, setLoading, setError } = paymentsSlice.actions;
export default paymentsSlice.reducer;
