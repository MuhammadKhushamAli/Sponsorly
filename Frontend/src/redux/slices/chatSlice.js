import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  chats: [],
  currentChat: null,
  messages: [],
  isLoading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
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
  setChats, 
  setCurrentChat, 
  setMessages,
  addMessage,
  setLoading,
  setError,
} = chatSlice.actions;

export default chatSlice.reducer;
