import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import '../api/api';
import { getDataFromStrava } from '../api/api';

export const fetchStravaData = createAsyncThunk(
  'strava/fetchData',
  async () => {
    const response = await getDataFromStrava();
    return response;
  }
);

const stravaSlice = createSlice({
  name: 'strava',
  initialState: {
    data: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchStravaData.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchStravaData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchStravaData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default stravaSlice.reducer;
