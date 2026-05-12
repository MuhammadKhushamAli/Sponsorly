import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  requests: [],
  currentRequest: null,
  isLoading: false,
  error: null,
  // Toast shown when a collab is accepted and a project is created
  projectToast: null, // { projectId, campaignTitle }
  filter: {
    status: 'all', // all | pending | accepted | rejected
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
      const index = state.requests.findIndex((r) => r._id === action.payload._id);
      if (index !== -1) {
        state.requests[index] = action.payload;
      }
    },
    removeRequest: (state, action) => {
      state.requests = state.requests.filter((r) => r._id !== action.payload);
    },
    clearAll: (state) => {
      state.requests = [];
      state.currentRequest = null;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setFilter: (state, action) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    setProjectToast: (state, action) => {
      state.projectToast = action.payload; // { projectId, campaignTitle } | null
    },
  },
});

export const {
  setRequests,
  setCurrentRequest,
  updateRequest,
  removeRequest,
  clearAll,
  setLoading,
  setError,
  clearError,
  setFilter,
  setProjectToast,
} = collabSlice.actions;

export default collabSlice.reducer;

