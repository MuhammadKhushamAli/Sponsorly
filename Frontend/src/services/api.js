import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token'),
};

// Creator Campaign endpoints
export const creatorCampaignAPI = {
  create: (data) => api.post('/creator-campaigns/create', data),
  find: (params) => api.get('/creator-campaigns/find', { params }),
  update: (id, data) => api.patch(`/creator-campaigns/update/${id}`, data),
  delete: (id) => api.delete(`/creator-campaigns/delete/${id}`),
};

// Sponsor Campaign endpoints
export const sponsorCampaignAPI = {
  create: (data) => api.post('/sponsor-campaigns/create', data),
  find: (params) => api.get('/sponsor-campaigns/find', { params }),
  update: (id, data) => api.patch(`/sponsor-campaigns/update/${id}`, data),
  delete: (id) => api.delete(`/sponsor-campaigns/delete/${id}`),
};

// Collab endpoints
export const collabAPI = {
  creatorRequests: (campaignId) =>
    api.post(`/collabs/creator-requests/${campaignId}`),
  sponsorRequests: (campaignId) =>
    api.post(`/collabs/sponsor-requests/${campaignId}`),
  acceptSponsorRequest: (requestId) =>
    api.post(`/collabs/sponsor-requests/${requestId}/accept`),
  rejectSponsorRequest: (requestId) =>
    api.post(`/collabs/sponsor-requests/${requestId}/reject`),
  acceptCreatorRequest: (requestId) =>
    api.post(`/collabs/creator-requests/${requestId}/accept`),
  rejectCreatorRequest: (requestId) =>
    api.post(`/collabs/creator-requests/${requestId}/reject`),
  getCreatorRequests: (campaignId) =>
    api.get(`/collabs/creator/get-requests/${campaignId}`),
  getSponsorRequests: (campaignId) =>
    api.get(`/collabs/sponsor/get-requests/${campaignId}`),
};

// Chat endpoints
export const chatAPI = {
  createDirectChat: (otherUserId) =>
    api.post(`/chats/create/${otherUserId}`),
  addDirectMessage: (chatId, content) =>
    api.post(`/chats/${chatId}/message`, { content }),
  addProjectMessage: (projectId, content) =>
    api.post(`/chats/project/${projectId}/message`, { content }),
};

// Review endpoints
export const reviewAPI = {
  create: (revieweeId, data) =>
    api.post(`/reviews/${revieweeId}`, data),
  delete: (reviewId) =>
    api.delete(`/reviews/${reviewId}`),
};

// Creator/Sponsor profile endpoints
export const creatorAPI = {
  dashboard: () => api.get('/creators/dashboard'),
  updateProfile: (data) => api.post('/creators/update-profile', data),
  getCreators: (params) => api.get('/creators', { params }),
};

export const sponsorAPI = {
  dashboard: () => api.get('/sponsors/dashboard'),
  updateProfile: (data) => api.post('/sponsors/update-profile', data),
  findSponsors: (tags) => api.get(`/sponsors/industries/${tags}`),
};

export default api;
