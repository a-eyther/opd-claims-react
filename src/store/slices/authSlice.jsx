import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import storageService from '../../utils/storage';

/**
 * Initial state for auth slice
 */
const initialState = {
  user: storageService.getUserData(),
  token: storageService.getAuthToken(),
  isAuthenticated: !!storageService.getAuthToken(),
  isLoading: false,
  error: null,
};

/**
 * Async thunk for user login
 */
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);

      // Store token in localStorage
      if (response.token || response.access) {
        const token = response.token || response.access;
        storageService.setAuthToken(token);

        // Store refresh token if available
        if (response.refresh) {
          storageService.setRefreshToken(response.refresh);
        }

        // Store user data if available
        if (response.user) {
          storageService.setUserData(response.user);
        }

        return {
          token,
          user: response.user || null,
          refresh: response.refresh || null,
        };
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      // Handle different error scenarios
      if (error.response) {
        // Server responded with error
        return rejectWithValue(
          error.response.data?.message ||
          error.response.data?.detail ||
          'Login failed. Please check your credentials.'
        );
      } else if (error.request) {
        // Request made but no response
        return rejectWithValue('Network error. Please check your connection.');
      } else {
        // Something else happened
        return rejectWithValue(error.message || 'An unexpected error occurred');
      }
    }
  }
);

/**
 * Async thunk for user logout
 */
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      storageService.clearAuthData();
      return null;
    } catch (error) {
      // Clear data even if API call fails
      storageService.clearAuthData();
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

/**
 * Async thunk for fetching current user
 */
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const userData = await authService.getCurrentUser();
      storageService.setUserData(userData);
      return userData;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        'Failed to fetch user data'
      );
    }
  }
);

/**
 * Async thunk for refreshing token
 */
export const refreshAuthToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const refreshToken = storageService.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authService.refreshToken(refreshToken);
      const newToken = response.access || response.token;

      storageService.setAuthToken(newToken);
      return { token: newToken };
    } catch (error) {
      storageService.clearAuthData();
      return rejectWithValue('Session expired. Please login again.');
    }
  }
);

/**
 * Auth slice
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Synchronous actions
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      storageService.clearAuthData();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload || 'Login failed';
      })

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Clear state even on error
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = null;
      })

    // Fetch current user
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

    // Refresh token
    builder
      .addCase(refreshAuthToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(refreshAuthToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      });
  },
});

// Export actions
export const { setCredentials, clearAuth, clearError } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;

// Export reducer
export default authSlice.reducer;
