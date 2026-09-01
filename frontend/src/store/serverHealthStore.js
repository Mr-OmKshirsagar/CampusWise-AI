import { create } from 'zustand';
import axios from 'axios';
import { toast } from './toastStore.js';

export const useServerHealthStore = create((set, get) => ({
  status: 'online', // 'online' | 'warming_up' | 'offline'
  isServerOnline: true,
  wasServerOffline: false,
  healthCheckTimer: null,

  setServerOnline: () => {
    const { wasServerOffline, healthCheckTimer } = get();
    if (healthCheckTimer) {
      clearInterval(healthCheckTimer);
    }

    if (wasServerOffline) {
      toast.success(
        'Backend server is active again & Knowledge Base is synchronized!',
        'Backend Online',
        4500,
        'server-health-toast'
      );
    }

    set({
      status: 'online',
      isServerOnline: true,
      wasServerOffline: false,
      healthCheckTimer: null,
    });
  },

  setWarmingUp: () => {
    set({
      status: 'warming_up',
      isServerOnline: false,
    });
  },

  setServerOffline: (errorMessage = null, silent = false) => {
    const { healthCheckTimer } = get();

    // Only emit toast if not in silent auto-retry mode
    if (!silent) {
      toast.error(
        errorMessage || 'Backend server is currently inactive or unreachable. Reconnecting in background...',
        'Backend Inactive',
        5000,
        'server-health-toast'
      );
    }

    set({
      status: 'offline',
      isServerOnline: false,
      wasServerOffline: true,
    });

    // Start background auto-poll heartbeat to detect when server comes back online
    if (!healthCheckTimer) {
      const rawBaseUrl = (import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');
      const healthUrl = rawBaseUrl.endsWith('/api') ? `${rawBaseUrl}/health` : `${rawBaseUrl}/api/health`;

      const timer = setInterval(async () => {
        try {
          const res = await axios.get(healthUrl, { timeout: 4500 });
          if (res.status === 200) {
            get().setServerOnline();
          }
        } catch (e) {
          // Still waiting for backend to spin up or restart
        }
      }, 5500);

      set({ healthCheckTimer: timer });
    }
  },

  checkHealth: async (silent = true) => {
    try {
      const rawBaseUrl = (import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');
      const healthUrl = rawBaseUrl.endsWith('/api') ? `${rawBaseUrl}/health` : `${rawBaseUrl}/api/health`;
      const res = await axios.get(healthUrl, { timeout: 3500 });
      if (res.status === 200) {
        get().setServerOnline();
      }
    } catch (e) {
      if (!e.response || [502, 503, 504].includes(e.response?.status)) {
        get().setServerOffline(null, silent);
      }
    }
  },
}));
