import { create } from 'zustand';
import axios from 'axios';
import { toast } from './toastStore.js';

const getHealthUrl = () => {
  const rawBaseUrl = (import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');
  return rawBaseUrl.endsWith('/api') ? `${rawBaseUrl}/health` : `${rawBaseUrl}/api/health`;
};

export const useServerHealthStore = create((set, get) => ({
  status: 'online', // 'online' | 'warming_up' | 'offline'
  isServerOnline: true,
  wasServerOffline: false,
  healthCheckTimer: null,

  setServerOnline: () => {
    const { wasServerOffline, healthCheckTimer, status } = get();
    if (healthCheckTimer) {
      clearInterval(healthCheckTimer);
    }

    const wasDown = wasServerOffline || status !== 'online';

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

    if (wasDown) {
      // Broadcast event so all active components and stores reload their data immediately
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('campuswise:server-online'));
      }
    }
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
      const healthUrl = getHealthUrl();

      const timer = setInterval(async () => {
        try {
          const res = await axios.get(healthUrl, { timeout: 6000 });
          if (res.status === 200) {
            get().setServerOnline();
          }
        } catch (e) {
          // Still waiting for backend to spin up or restart
        }
      }, 3000);

      set({ healthCheckTimer: timer });
    }
  },

  checkHealth: async (silent = true) => {
    try {
      const healthUrl = getHealthUrl();
      const res = await axios.get(healthUrl, { timeout: 6000 });
      if (res.status === 200) {
        get().setServerOnline();
      }
    } catch (e) {
      get().setServerOffline(null, silent);
    }
  },
}));

// Auto-check health when window gains focus or network reconnects
if (typeof window !== 'undefined') {
  window.addEventListener('focus', () => {
    useServerHealthStore.getState().checkHealth(true);
  });
  window.addEventListener('online', () => {
    useServerHealthStore.getState().checkHealth(false);
  });
}

