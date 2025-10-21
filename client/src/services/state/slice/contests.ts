import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Contest, ContestsState } from '../../types';

const initialState: ContestsState = {
  userContests: [],
  ongoingContests: [],
  upcomingContests: [],
  pastContests: [],
  loading: false,
  error: null,
};

const contestsSlice = createSlice({
  name: 'contests',
  initialState,
  reducers: {
    setUserContests: (state, action: PayloadAction<Contest[]>) => {
      state.userContests = action.payload;
    },
    setOngoingContests: (state, action: PayloadAction<Contest[]>) => {
      state.ongoingContests = action.payload;
    },
    setUpcomingContests: (state, action: PayloadAction<Contest[]>) => {
      state.upcomingContests = action.payload;
    },
    setPastContests: (state, action: PayloadAction<Contest[]>) => {
      state.pastContests = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearContests: (state) => {
      state.userContests = [];
      state.ongoingContests = [];
      state.upcomingContests = [];
      state.pastContests = [];
      state.error = null;
    },
  },
});

export const {
  setUserContests,
  setOngoingContests,
  setUpcomingContests,
  setPastContests,
  setLoading,
  setError,
  clearContests,
} = contestsSlice.actions;

export default contestsSlice.reducer;
