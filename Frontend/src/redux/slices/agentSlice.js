import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [], // { role: 'user' | 'assistant', content: string, id: number }
  isLoading: false,
  error: null,
  isOpen: false,
};

const agentSlice = createSlice({
  name: 'agent',
  initialState,
  reducers: {
    openChat: (state) => {
      state.isOpen = true;
    },
    closeChat: (state) => {
      state.isOpen = false;
    },
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    addUserMessage: (state, action) => {
      state.messages.push({
        role: 'user',
        content: action.payload,
        id: Date.now(),
      });
    },
    addAssistantMessage: (state, action) => {
      state.messages.push({
        role: 'assistant',
        content: action.payload,
        id: Date.now() + 1,
      });
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
    clearHistory: (state) => {
      state.messages = [];
      state.error = null;
    },
  },
});

export const {
  openChat,
  closeChat,
  toggleChat,
  addUserMessage,
  addAssistantMessage,
  setLoading,
  setError,
  clearError,
  clearHistory,
} = agentSlice.actions;

export default agentSlice.reducer;
