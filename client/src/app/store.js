import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './apiSlice';
import uiReducer from '../features/ui/uiSlice'; // Import the new reducer

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    ui: uiReducer, // Add the ui reducer to the store
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});