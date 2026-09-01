import { create } from 'zustand';
import { authApi } from '../services/api.js';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('campuswise_user') || 'null'),
  token: localStorage.getItem('campuswise_token') || null,
  isAuthenticated: !!localStorage.getItem('campuswise_token'),
  isLoading: false,
  error: null,

  login: async ({ email, password }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login({ email, password });
      const { user, token } = response.data;

      localStorage.setItem('campuswise_token', token);
      localStorage.setItem('campuswise_user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return user;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Login failed.';
      set({ isLoading: false, error: errorMsg });
      throw new Error(errorMsg);
    }
  },

  register: async ({ name, email, password, role }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register({ name, email, password, role });
      const { user, token } = response.data;

      localStorage.setItem('campuswise_token', token);
      localStorage.setItem('campuswise_user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return user;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Registration failed.';
      set({ isLoading: false, error: errorMsg });
      throw new Error(errorMsg);
    }
  },

  fetchMe: async () => {
    if (!get().token) return null;
    try {
      const response = await authApi.getMe();
      const user = response.data?.user || response.user || response.data;
      if (user) {
        localStorage.setItem('campuswise_user', JSON.stringify(user));
        set({ user, isAuthenticated: true });
        return user;
      }
      return get().user;
    } catch (err) {
      // ONLY invalidate authentication if server explicitly returns 401 Unauthorized or 403 Forbidden
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        get().logout();
      }
      // Retain cached credentials during network offline or server reboot
      return get().user;
    }
  },

  logout: () => {
    localStorage.removeItem('campuswise_token');
    localStorage.removeItem('campuswise_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
