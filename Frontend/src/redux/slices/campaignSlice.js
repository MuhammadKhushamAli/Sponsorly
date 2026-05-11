import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  campaigns: [],
  currentCampaign: null,
  isLoading: false,
  error: null,
  filter: {
    type: 'all', // 'all', 'creator', 'sponsor'
    status: 'active',
  },
};

const campaignSlice = createSlice({
  name: 'campaigns',
  initialState,
  reducers: {
    setCampaigns: (state, action) => {
      state.campaigns = action.payload;
    },
    setCurrentCampaign: (state, action) => {
      state.currentCampaign = action.payload;
    },
    addCampaign: (state, action) => {
      state.campaigns.push(action.payload);
    },
    updateCampaign: (state, action) => {
      const index = state.campaigns.findIndex(c => c._id === action.payload._id);
      if (index !== -1) {
        state.campaigns[index] = action.payload;
      }
    },
    deleteCampaign: (state, action) => {
      state.campaigns = state.campaigns.filter(c => c._id !== action.payload);
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
  setCampaigns, 
  setCurrentCampaign, 
  addCampaign, 
  updateCampaign, 
  deleteCampaign,
  setLoading,
  setError,
  setFilter,
} = campaignSlice.actions;

export default campaignSlice.reducer;
