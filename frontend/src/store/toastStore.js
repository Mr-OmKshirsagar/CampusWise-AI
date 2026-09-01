import { create } from 'zustand';

const toastTimers = new Map();

export const useToastStore = create((set, get) => ({
  toasts: [],

  addToast: ({ type = 'info', title = '', message = '', duration = 4000, id = null }) => {
    const now = Date.now();
    const currentToasts = get().toasts;

    // Deduplication check: Match either explicit ID or identical content (type + title + message)
    const existingToast = id
      ? currentToasts.find((t) => t.id === id)
      : currentToasts.find(
          (t) => t.type === type && t.title === title && t.message === message
        );

    const toastId = existingToast ? existingToast.id : (id || `${now}-${Math.random().toString(36).substring(2, 7)}`);

    // Clear any existing auto-dismiss timer for this ID
    if (toastTimers.has(toastId)) {
      clearTimeout(toastTimers.get(toastId));
      toastTimers.delete(toastId);
    }

    set((state) => {
      const idx = state.toasts.findIndex((t) => t.id === toastId);
      if (idx !== -1) {
        // Update existing toast in-place with refreshed timestamp and duration
        const updated = [...state.toasts];
        updated[idx] = {
          id: toastId,
          type,
          title,
          message,
          duration,
          updatedAt: now,
        };
        return { toasts: updated };
      }
      // Add new toast
      return {
        toasts: [...state.toasts, { id: toastId, type, title, message, duration, updatedAt: now }],
      };
    });

    if (duration > 0) {
      const timer = setTimeout(() => {
        get().removeToast(toastId);
        toastTimers.delete(toastId);
      }, duration);
      toastTimers.set(toastId, timer);
    }

    return toastId;
  },

  removeToast: (id) => {
    if (toastTimers.has(id)) {
      clearTimeout(toastTimers.get(id));
      toastTimers.delete(id);
    }
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  success: (message, title = 'Success', duration = 4000, id = null) => {
    return get().addToast({ type: 'success', title, message, duration, id });
  },

  error: (message, title = 'Error', duration = 5000, id = null) => {
    return get().addToast({ type: 'error', title, message, duration, id });
  },

  info: (message, title = 'Notice', duration = 3500, id = null) => {
    return get().addToast({ type: 'info', title, message, duration, id });
  },

  cancel: (message, title = 'Cancelled', duration = 3000, id = null) => {
    return get().addToast({ type: 'cancel', title, message, duration, id });
  },
}));

// Convenience singleton export
export const toast = {
  success: (msg, title, dur, id) => useToastStore.getState().success(msg, title, dur, id),
  error: (msg, title, dur, id) => useToastStore.getState().error(msg, title, dur, id),
  info: (msg, title, dur, id) => useToastStore.getState().info(msg, title, dur, id),
  cancel: (msg, title, dur, id) => useToastStore.getState().cancel(msg, title, dur, id),
};
