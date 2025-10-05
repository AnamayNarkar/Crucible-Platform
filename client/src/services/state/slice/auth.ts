import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as apiLogin, logout as apiLogout, type LoginCredentials } from '../../api/auth';

interface LoginState {
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: LoginState = {
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

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state) => {
        state.isLoggedIn = true;
        state.loading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoggedIn = false;
        state.loading = false;
        state.error = action.error.message || 'Failed to login';
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoggedIn = false;
      });
  },
});

export default loginSlice.reducer;