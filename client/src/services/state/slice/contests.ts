import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Contest, ContestsState } from '../../types';
import { 
  createContest as apiCreateContest,
  getAllContests as apiGetAllContests,
  getUserContests as apiGetUserContests,
  type CreateContestPayload 
} from '../../api/contest';

const initialState: ContestsState = {
  userContests: [],
  ongoingContests: [],
  upcomingContests: [],
  pastContests: [],
  loading: false,
  error: null,
};

// Async thunks
export const createContest = createAsyncThunk(
  'contests/create',
  async (contestData: CreateContestPayload) => {
    const response = await apiCreateContest(contestData);
    return response;
  }
);

export const fetchAllContests = createAsyncThunk(
  'contests/fetchAll',
  async () => {
    const response = await apiGetAllContests();
    return response;
  }
);

export const fetchUserContests = createAsyncThunk(
  'contests/fetchUser',
  async () => {
    const response = await apiGetUserContests();
    return response;
  }
);

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
  extraReducers: (builder) => {
    builder
      // Create contest
      .addCase(createContest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createContest.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          // Add the created contest to user contests
          state.userContests.push(action.payload.data);
        }
      })
      .addCase(createContest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create contest';
      })
      // Fetch all contests
      .addCase(fetchAllContests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllContests.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.ongoingContests = action.payload.ongoing;
          state.upcomingContests = action.payload.upcoming;
          state.pastContests = action.payload.past;
        }
      })
      .addCase(fetchAllContests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch contests';
      })
      // Fetch user contests
      .addCase(fetchUserContests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserContests.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.userContests = action.payload;
        }
      })
      .addCase(fetchUserContests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user contests';
      });
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
