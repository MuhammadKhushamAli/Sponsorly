import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import campaignReducer from './slices/campaignSlice';
import chatReducer from './slices/chatSlice';
import collabReducer from './slices/collabSlice';
import reviewReducer from './slices/reviewSlice';
import agentReducer from './slices/agentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    campaigns: campaignReducer,
    chats: chatReducer,
    collabs: collabReducer,
    reviews: reviewReducer,
    agent: agentReducer,
  },
});

export default store;
