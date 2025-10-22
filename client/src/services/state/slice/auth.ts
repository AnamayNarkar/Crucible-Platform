import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as apiLogin, logout as apiLogout, getMe as apiGetMe, type LoginCredentials } from '../../api/auth';

interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoggedIn: false,
  loading: false,
  error: null,
};

export const login = createAsyncThunk('auth/login', async (credentials: LoginCredentials) => {
  const response = await apiLogin(credentials.emailOrUsername, credentials.password);
  return response;
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await apiLogout();
});

export const getMe = createAsyncThunk('auth/getMe', async () => {
  const response = await apiGetMe();
  return response;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoggedIn = true;
        state.loading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.user = null;
        state.isLoggedIn = false;
        state.loading = false;
        state.error = action.error.message || 'Failed to login';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isLoggedIn = false;
        state.error = null;
      })
      .addCase(getMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
          state.isLoggedIn = true;
        }
        state.loading = false;
      })
      .addCase(getMe.rejected, (state) => {
        state.user = null;
        state.isLoggedIn = false;
        state.loading = false;
      });
  },
});

export default authSlice.reducer;