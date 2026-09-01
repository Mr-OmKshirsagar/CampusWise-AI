import axios from 'axios';
import { useServerHealthStore } from '../store/serverHealthStore.js';

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

// Response Interceptor: Global Server Health & Auth Expiration Handler
api.interceptors.response.use(
  (response) => {
    // Notify health store that server is online and active
    useServerHealthStore.getState().setServerOnline();
    return response;
  },
  (error) => {
    const isSilent = Boolean(
      error.config?.silent ||
      error.config?.headers?.['x-silent-request'] === 'true'
    );

    const isNetworkOrDown =
      !error.response ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      (error.response && [502, 503, 504].includes(error.response.status));

    if (isNetworkOrDown) {
      useServerHealthStore.getState().setServerOffline(
        error.response?.data?.error || 'Backend server is unreachable or starting up. Reconnecting in background...',
        isSilent
      );
    }

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
  async register(data, config = {}) {
    const res = await api.post('/auth/register', data, config);
    return res.data;
  },
  async login(data, config = {}) {
    const res = await api.post('/auth/login', data, config);
    return res.data;
  },
  async getMe(config = {}) {
    const res = await api.get('/auth/me', config);
    return res.data;
  },
};

// ==========================================
// Admin Document APIs
// ==========================================
export const documentApi = {
  async listAll(config = {}) {
    const res = await api.get('/admin/documents', config);
    return res.data;
  },
  async upload(formData, onStageProgress = null, config = {}) {
    const token = localStorage.getItem('campuswise_token');
    const baseUrl = getBackendBaseUrl();
    const url = `${baseUrl}/api/admin/documents/upload?stream=true`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: 'text/event-stream',
          ...(config.headers || {}),
        },
        body: formData,
      });

      if (!response.ok) {
        let errorText = 'Failed to ingest document.';
        try {
          const errJson = await response.json();
          errorText = errJson.error || errJson.message || errorText;
        } catch (_) {
          errorText = `HTTP Error ${response.status}: ${response.statusText}`;
        }
        const err = new Error(errorText);
        err.response = { status: response.status, data: { error: errorText } };
        throw err;
      }

      // Notify health store that server is online
      useServerHealthStore.getState().setServerOnline();

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finalResult = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete chunk in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;

          try {
            const jsonStr = trimmed.replace(/^data:\s*/, '');
            const event = JSON.parse(jsonStr);

            if (event.stage === 'error') {
              const err = new Error(event.error || 'Ingestion failed on backend.');
              err.response = { status: 500, data: { error: event.error } };
              throw err;
            }

            if (onStageProgress && event.message) {
              onStageProgress(event);
            }

            if (event.stage === 'complete' && event.data) {
              finalResult = event.data;
            }
          } catch (parseErr) {
            if (parseErr.message?.includes('Ingestion failed') || parseErr.response) {
              throw parseErr;
            }
          }
        }
      }

      if (finalResult) {
        return finalResult;
      }

      throw new Error('Upload completed without returning document payload.');
    } catch (err) {
      const isNetworkOrDown =
        !err.response ||
        err.name === 'TypeError' ||
        err.code === 'ERR_NETWORK' ||
        (err.response && [502, 503, 504].includes(err.response.status));

      if (isNetworkOrDown) {
        useServerHealthStore.getState().setServerOffline(
          err.message || 'Backend server is unreachable.',
          Boolean(config.silent)
        );
      }
      throw err;
    }
  },
  async getById(id, config = {}) {
    const res = await api.get(`/admin/documents/${id}`, config);
    return res.data;
  },
  async delete(id, config = {}) {
    const res = await api.delete(`/admin/documents/${id}`, config);
    return res.data;
  },
  async getStats(config = {}) {
    const res = await api.get('/admin/stats', config);
    return res.data;
  },
};

// ==========================================
// Chat & RAG Query APIs
// ==========================================
export const chatApi = {
  async listConversations(config = {}) {
    const res = await api.get('/chat/conversations', config);
    return res.data;
  },
  async createConversation(title, config = {}) {
    const res = await api.post('/chat/conversations', { title }, config);
    return res.data;
  },
  async getConversation(id, config = {}) {
    const res = await api.get(`/chat/conversations/${id}`, config);
    return res.data;
  },
  async sendQuery(conversationId, { query, categoryFilter }, config = {}) {
    const res = await api.post(
      `/chat/conversations/${conversationId}/query`,
      { query, categoryFilter },
      config
    );
    return res.data;
  },
  async renameConversation(id, title, config = {}) {
    const res = await api.patch(`/chat/conversations/${id}`, { title }, config);
    return res.data;
  },
  async deleteConversation(id, config = {}) {
    const res = await api.delete(`/chat/conversations/${id}`, config);
    return res.data;
  },
};

export default api;
