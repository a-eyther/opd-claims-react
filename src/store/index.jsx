import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import diagnosisReducer from './slices/diagnosisSlice';
import symptomsReducer from './slices/symptomsSlice';

/**
 * Configure Redux store
 * Combines all reducers and applies middleware
 */
const store = configureStore({
  reducer: {
    auth: authReducer,
    diagnosis: diagnosisReducer,
    symptoms: symptomsReducer,
    // Add other reducers here as your app grows
    // e.g., user: userReducer,
    //       posts: postsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization check
        ignoredActions: ['auth/login/pending', 'auth/logout/pending'],
      },
    }),
  devTools: import.meta.env.MODE !== 'production', // Enable Redux DevTools in development
});

export default store;
