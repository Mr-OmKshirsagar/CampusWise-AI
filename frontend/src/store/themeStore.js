import { create } from 'zustand';

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('campuswise_theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useThemeStore = create((set, get) => ({
  theme: getInitialTheme(),

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

  toggleTheme: () => {
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
      // Calculate full canvas dimensions (including scroll heights & DPR)
      const doc = document.documentElement;
      const width = Math.max(window.innerWidth || 0, doc.clientWidth || 0, doc.scrollWidth || 0);
      const height = Math.max(window.innerHeight || 0, doc.clientHeight || 0, doc.scrollHeight || 0);

      // Distance from top-center (50% 0%) to bottom corners with 1.5x safe overscan
      const maxDistance = Math.hypot(width / 2, height);
      const endRadius = Math.ceil(maxDistance * 1.5);

      const transition = document.startViewTransition(() => {
        applyTheme();
      });

      transition.ready.then(() => {
        // Origin strictly anchored to the top-center midpoint (50% 0%)
        const clipPath = [
          'circle(0px at 50% 0%)',
          `circle(${endRadius}px at 50% 0%)`,
        ];

        // Animate incoming theme radiating symmetrically with 100% full-canvas coverage
        document.documentElement.animate(
          {
            clipPath: clipPath,
          },
          {
            duration: 1600,
            easing: 'linear',
            fill: 'forwards',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      });
    } else {
      applyTheme();
    }
  },

  setTheme: (theme) => {
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
      const doc = document.documentElement;
      const width = Math.max(window.innerWidth || 0, doc.clientWidth || 0, doc.scrollWidth || 0);
      const height = Math.max(window.innerHeight || 0, doc.clientHeight || 0, doc.scrollHeight || 0);
      const maxDistance = Math.hypot(width / 2, height);
      const endRadius = Math.ceil(maxDistance * 1.5);

      const transition = document.startViewTransition(() => {
        applyTheme();
      });

      transition.ready.then(() => {
        const clipPath = [
          'circle(0px at 50% 0%)',
          `circle(${endRadius}px at 50% 0%)`,
        ];

        document.documentElement.animate(
          {
            clipPath: clipPath,
          },
          {
            duration: 1600,
            easing: 'linear',
            fill: 'forwards',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      });
    } else {
      applyTheme();
    }
  },
}));
