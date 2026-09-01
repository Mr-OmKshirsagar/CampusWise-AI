import { create } from 'zustand';

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('campuswise_theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Global animation lock to prevent Chromium GPU compositor crashes
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

  toggleTheme: async (e) => {
    // 🛡️ Prevent overlapping transition collisions
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

    // Calculate origin directly from the button click coordinates for instantaneous ripple origin
    let x = window.innerWidth - 120;
    let y = 32;

    if (e && e.clientX !== undefined && e.clientY !== undefined && (e.clientX !== 0 || e.clientY !== 0)) {
      x = e.clientX;
      y = e.clientY;
    } else if (e && e.currentTarget && typeof e.currentTarget.getBoundingClientRect === 'function') {
      const rect = e.currentTarget.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }

    // Check if View Transition API is supported
    if (typeof document !== 'undefined' && document.startViewTransition) {
      try {
        if (currentWebAnimation) {
          try {
            currentWebAnimation.cancel();
          } catch (_) { }
          currentWebAnimation = null;
        }

        const endRadius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        );

        const transition = document.startViewTransition(() => {
          applyTheme();
        });

        await transition.ready.catch(() => { });

        currentWebAnimation = document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 500,
            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
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

  setTheme: async (theme, e) => {
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

    let x = window.innerWidth - 120;
    let y = 32;

    if (e && e.clientX !== undefined && e.clientY !== undefined && (e.clientX !== 0 || e.clientY !== 0)) {
      x = e.clientX;
      y = e.clientY;
    }

    if (typeof document !== 'undefined' && document.startViewTransition) {
      try {
        if (currentWebAnimation) {
          try {
            currentWebAnimation.cancel();
          } catch (_) { }
          currentWebAnimation = null;
        }

        const endRadius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        );

        const transition = document.startViewTransition(() => {
          applyTheme();
        });

        await transition.ready.catch(() => { });

        currentWebAnimation = document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 500,
            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
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
