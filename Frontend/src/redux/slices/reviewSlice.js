import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  reviews: [],
  currentReview: null,
  isLoading: false,
  error: null,
};

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    setReviews: (state, action) => {
      state.reviews = action.payload;
    },
    setCurrentReview: (state, action) => {
      state.currentReview = action.payload;
    },
    addReview: (state, action) => {
      state.reviews.push(action.payload);
    },
    deleteReview: (state, action) => {
      state.reviews = state.reviews.filter(r => r._id !== action.payload);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { 
  setReviews, 
  setCurrentReview,
  addReview,
  deleteReview,
  setLoading,
  setError,
} = reviewSlice.actions;

export default reviewSlice.reducer;
