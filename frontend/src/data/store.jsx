import { configureStore } from '@reduxjs/toolkit';
import stravaReducer from './stravaSlice';

export const store = configureStore({
  reducer: {
    strava: stravaReducer,
  },
});

export default store;
