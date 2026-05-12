import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  chats: [],           // sidebar list with metadata
  currentChat: null,   // { _id, isProjectChat, otherUser, projectChat }
  messages: [],        // messages for the open chat (ascending order)
  pagination: {
    page: 1,
    totalPages: 1,
    hasMore: false,
    totalMessages: 0,
  },
  loadingChats: false,
  loadingMessages: false,
  sendingMessage: false,
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
      // Reset messages when switching chats
      state.messages = [];
      state.pagination = { page: 1, totalPages: 1, hasMore: false, totalMessages: 0 };
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    // Prepend older messages when loading previous pages
    prependMessages: (state, action) => {
      state.messages = [...action.payload, ...state.messages];
    },
    // Append a newly sent message optimistically
    appendMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setPagination: (state, action) => {
      state.pagination = action.payload;
    },
    updateChatLastMessage: (state, action) => {
      const { chatId, content, sentAt } = action.payload;
      const chat = state.chats.find((c) => c._id === chatId);
      if (chat) {
        chat.lastMessage = content;
        chat.lastMessageAt = sentAt;
      }
    },
    setLoadingChats: (state, action) => {
      state.loadingChats = action.payload;
    },
    setLoadingMessages: (state, action) => {
      state.loadingMessages = action.payload;
    },
    setSendingMessage: (state, action) => {
      state.sendingMessage = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setChats,
  setCurrentChat,
  setMessages,
  prependMessages,
  appendMessage,
  setPagination,
  updateChatLastMessage,
  setLoadingChats,
  setLoadingMessages,
  setSendingMessage,
  setError,
  clearError,
} = chatSlice.actions;

export default chatSlice.reducer;

