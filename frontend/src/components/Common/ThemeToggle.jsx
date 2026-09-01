import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore.js';

export default function ThemeToggle({ className = '', showLabel = false }) {
  const { theme, toggleTheme, isTransitioning } = useThemeStore();
  const isDark = theme === 'dark';
  const [isClicking, setIsClicking] = useState(false);

  const handleToggle = (e) => {
    if (isTransitioning) return;
    setIsClicking(true);
    toggleTheme(e);
    setTimeout(() => setIsClicking(false), 300);
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      {/* ══════════════════════════════════════════════════════════════
          Apple WWDC25 Liquid Glass Dual-Track Theme Switch (70px Sliding Droplet)
         ══════════════════════════════════════════════════════════════ */}
      <button
        type="button"
        disabled={isTransitioning}
        onClick={handleToggle}
        className={`relative flex items-center p-1 rounded-full glass-panel-elevated border border-slate-200/90 dark:border-white/[0.14] shadow-liquid-sm select-none cursor-pointer w-[70px] h-[36px] transition-all duration-300 hover:scale-[1.03] active:scale-95 bg-white/80 dark:bg-white/[0.04] backdrop-blur-2xl ${
          isTransitioning ? 'cursor-wait pointer-events-none opacity-80' : ''
        }`}
        title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        aria-label="Toggle Theme"
      >
        {/* Sliding Liquid Glass Droplet Slider (Pixel-Perfect 28px Square within 4px Padding) */}
        <div
          style={{
            transform: `translateX(${isDark ? '32px' : '0px'}) scale(${isClicking ? 0.92 : 1})`,
          }}
          className={`absolute top-1 left-1 w-7 h-7 rounded-full border backdrop-blur-2xl pointer-events-none transition-all duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isDark
              ? 'bg-gradient-to-b from-sky-400/35 via-sky-400/20 to-indigo-500/35 border-sky-400/70 shadow-[0_0_16px_rgba(56,189,248,0.45),inset_0_1.5px_2px_0_rgba(255,255,255,0.9),inset_0_-1.5px_2px_0_rgba(56,189,248,0.6)]'
              : 'bg-gradient-to-b from-amber-400/35 via-amber-300/20 to-orange-400/35 border-amber-400/70 shadow-[0_0_16px_rgba(245,158,11,0.45),inset_0_1.5px_2px_0_rgba(255,255,255,0.9),inset_0_-1.5px_2px_0_rgba(251,191,36,0.6)]'
          }`}
        >
          {/* Top-down Specular Reflection Sheen */}
          <div className="absolute inset-x-1.5 top-0.5 h-1/2 bg-gradient-to-b from-white/80 to-transparent dark:from-white/50 rounded-full pointer-events-none" />

          {/* Bottom Chromatic Dispersion Rainbow Refraction Line */}
          <div
            className={`absolute inset-x-2 bottom-0 h-[1.5px] bg-gradient-to-r ${
              isDark
                ? 'from-pink-500/70 via-cyan-400/90 to-emerald-400/70'
                : 'from-amber-400/80 via-orange-400/90 to-rose-400/80'
            } blur-[0.5px] rounded-full pointer-events-none opacity-90`}
          />
        </div>

        {/* Dual Track Icons: Left = Sun (28px slot), Right = Moon (28px slot, 4px gap) */}
        <div className="relative z-10 w-full flex items-center justify-between pointer-events-none">
          {/* Sun Icon Slot (28px x 28px) */}
          <div
            className={`w-7 h-7 flex items-center justify-center transition-all duration-500 ${
              !isDark
                ? 'text-amber-500 scale-105 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]'
                : 'text-slate-400 dark:text-slate-500 opacity-40 scale-90'
            }`}
          >
            <Sun className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>

          {/* Moon Icon Slot (28px x 28px) */}
          <div
            className={`w-7 h-7 flex items-center justify-center transition-all duration-500 ${
              isDark
                ? 'text-sky-400 scale-105 drop-shadow-[0_0_6px_rgba(56,189,248,0.6)]'
                : 'text-slate-400 dark:text-slate-500 opacity-40 scale-90'
            }`}
          >
            <Moon className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
        </div>
      </button>

      {showLabel && (
        <span className="text-xs font-semibold select-none capitalize pl-2">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </div>
  );
}
