import { createSlice } from '@reduxjs/toolkit';

const decodeJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null;

  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;

    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

const loadStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }

    const token = localStorage.getItem('accessToken');
    const decoded = decodeJwtPayload(token);
    if (decoded?.id || decoded?.role || decoded?.email) {
      return {
        id: decoded.id,
        role: decoded.role,
        email: decoded.email,
      };
    }

    return null;
  } catch {
    return null;
  }
};

const token = localStorage.getItem('accessToken') || null;

const initialState = {
  user: loadStoredUser(),
  token,
  refreshToken: localStorage.getItem('refreshToken') || null,
  isLoading: false,
  error: null,
  isAuthenticated: !!token,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    setTokens: (state, action) => {
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      state.isAuthenticated = true;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setUser, setTokens, setLoading, setError, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
