import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  requests: [],
  currentRequest: null,
  isLoading: false,
  error: null,
  filter: {
    status: 'pending', // pending, accepted, rejected
  },
};

const collabSlice = createSlice({
  name: 'collab',
  initialState,
  reducers: {
    setRequests: (state, action) => {
      state.requests = action.payload;
    },
    setCurrentRequest: (state, action) => {
      state.currentRequest = action.payload;
    },
    updateRequest: (state, action) => {
      const index = state.requests.findIndex(r => r._id === action.payload._id);
      if (index !== -1) {
        state.requests[index] = action.payload;
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setFilter: (state, action) => {
      state.filter = { ...state.filter, ...action.payload };
    },
  },
});

export const { 
  setRequests, 
  setCurrentRequest,
  updateRequest,
  setLoading,
  setError,
  setFilter,
} = collabSlice.actions;

export default collabSlice.reducer;
