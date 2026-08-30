import { create } from 'zustand';

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('campuswise_theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Global animation lock to prevent Chromium GPU compositor crashes (STATUS_BREAKPOINT)
let isTransitionInProgress = false;
let currentWebAnimation = null;

export const useThemeStore = create((set, get) => ({
  theme: getInitialTheme(),
  isTransitioning: false,

  initTheme: () => {
    const current = get().theme;
    const root = document.documentElement;
    if (current === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }

    // Pre-warm CSS engine & GPU textures for cold theme switch
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        const prewarm = document.createElement('div');
        prewarm.className = 'dark light';
        prewarm.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;';
        document.body?.appendChild(prewarm);
        requestAnimationFrame(() => {
          prewarm.remove();
        });
      });
    }
  },

  toggleTheme: async () => {
    // 🛡️ Prevent overlapping transition collisions that trigger Chromium STATUS_BREAKPOINT
    if (isTransitionInProgress) return;
    isTransitionInProgress = true;
    set({ isTransitioning: true });

    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('campuswise_theme', nextTheme);

    const applyTheme = () => {
      const root = document.documentElement;
      if (nextTheme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
      set({ theme: nextTheme });
    };

    // Check if View Transition API is supported
    if (typeof document !== 'undefined' && document.startViewTransition) {
      try {
        // Cancel any lingering animation safely
        if (currentWebAnimation) {
          try {
            currentWebAnimation.cancel();
          } catch (_) { }
          currentWebAnimation = null;
        }

        const doc = document.documentElement;
        const width = Math.max(window.innerWidth || 0, doc.clientWidth || 0, doc.scrollWidth || 0);
        const height = Math.max(window.innerHeight || 0, doc.clientHeight || 0, doc.scrollHeight || 0);
        const maxDistance = Math.hypot(width / 2, height);
        const endRadius = Math.ceil(maxDistance * 1.5);

        const transition = document.startViewTransition(() => {
          applyTheme();
        });

        await transition.ready.catch(() => { });

        const clipPath = [
          'circle(0px at 50% 0%)',
          `circle(${endRadius}px at 50% 0%)`,
        ];

        currentWebAnimation = document.documentElement.animate(
          {
            clipPath: clipPath,
          },
          {
            duration: 3500,
            easing: 'linear',
            fill: 'forwards',
            pseudoElement: '::view-transition-new(root)',
          }
        );

        await currentWebAnimation.finished.catch(() => { });
        await transition.finished.catch(() => { });
      } catch (err) {
        applyTheme();
      } finally {
        currentWebAnimation = null;
        isTransitionInProgress = false;
        set({ isTransitioning: false });
      }
    } else {
      applyTheme();
      isTransitionInProgress = false;
      set({ isTransitioning: false });
    }
  },

  setTheme: async (theme) => {
    if (isTransitionInProgress) return;
    isTransitionInProgress = true;
    set({ isTransitioning: true });

    localStorage.setItem('campuswise_theme', theme);

    const applyTheme = () => {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
      set({ theme });
    };

    if (typeof document !== 'undefined' && document.startViewTransition) {
      try {
        if (currentWebAnimation) {
          try {
            currentWebAnimation.cancel();
          } catch (_) { }
          currentWebAnimation = null;
        }

        const doc = document.documentElement;
        const width = Math.max(window.innerWidth || 0, doc.clientWidth || 0, doc.scrollWidth || 0);
        const height = Math.max(window.innerHeight || 0, doc.clientHeight || 0, doc.scrollHeight || 0);
        const maxDistance = Math.hypot(width / 2, height);
        const endRadius = Math.ceil(maxDistance * 1.5);

        const transition = document.startViewTransition(() => {
          applyTheme();
        });

        await transition.ready.catch(() => { });

        const clipPath = [
          'circle(0px at 50% 0%)',
          `circle(${endRadius}px at 50% 0%)`,
        ];

        currentWebAnimation = document.documentElement.animate(
          {
            clipPath: clipPath,
          },
          {
            duration: 800,
            easing: 'linear',
            fill: 'forwards',
            pseudoElement: '::view-transition-new(root)',
          }
        );

        await currentWebAnimation.finished.catch(() => { });
        await transition.finished.catch(() => { });
      } catch (err) {
        applyTheme();
      } finally {
        currentWebAnimation = null;
        isTransitionInProgress = false;
        set({ isTransitioning: false });
      }
    } else {
      applyTheme();
      isTransitionInProgress = false;
      set({ isTransitioning: false });
    }
  },
}));
