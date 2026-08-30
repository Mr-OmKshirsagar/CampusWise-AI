import axios from 'axios';

let rawBaseUrl = (import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');
if (rawBaseUrl.startsWith('http') && !rawBaseUrl.endsWith('/api')) {
  rawBaseUrl = `${rawBaseUrl}/api`;
}

// Get backend root URL (e.g., https://campuswise-api.onrender.com)
export const getBackendBaseUrl = () => {
  if (rawBaseUrl.startsWith('http')) {
    return rawBaseUrl.replace(/\/api\/?$/, '');
  }
  return '';
};

// Resolve full file URL whether relative (/uploads/...) or absolute
export const getFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  const backendBase = getBackendBaseUrl();
  return `${backendBase}${cleanPath}`;
};

const api = axios.create({
  baseURL: rawBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campuswise_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle auth expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and on protected page, clear token
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        localStorage.removeItem('campuswise_token');
        localStorage.removeItem('campuswise_user');
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// Authentication APIs
// ==========================================
export const authApi = {
  async register(data) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  async login(data) {
    const res = await api.post('/auth/login', data);
    return res.data;
  },
  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

// ==========================================
// Admin Document APIs
// ==========================================
export const documentApi = {
  async listAll() {
    const res = await api.get('/admin/documents');
    return res.data;
  },
  async upload(formData, onProgress) {
    const res = await api.post('/admin/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });
    return res.data;
  },
  async getById(id) {
    const res = await api.get(`/admin/documents/${id}`);
    return res.data;
  },
  async delete(id) {
    const res = await api.delete(`/admin/documents/${id}`);
    return res.data;
  },
  async getStats() {
    const res = await api.get('/admin/stats');
    return res.data;
  },
};

// ==========================================
// Chat & RAG Query APIs
// ==========================================
export const chatApi = {
  async listConversations() {
    const res = await api.get('/chat/conversations');
    return res.data;
  },
  async createConversation(title) {
    const res = await api.post('/chat/conversations', { title });
    return res.data;
  },
  async getConversation(id) {
    const res = await api.get(`/chat/conversations/${id}`);
    return res.data;
  },
  async sendQuery(conversationId, { query, categoryFilter }) {
    const res = await api.post(`/chat/conversations/${conversationId}/query`, {
      query,
      categoryFilter,
    });
    return res.data;
  },
  async renameConversation(id, title) {
    const res = await api.patch(`/chat/conversations/${id}`, { title });
    return res.data;
  },
  async deleteConversation(id) {
    const res = await api.delete(`/chat/conversations/${id}`);
    return res.data;
  },
};

export default api;
