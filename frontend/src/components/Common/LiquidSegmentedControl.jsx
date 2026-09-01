import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * Apple WWDC25 Liquid Glass Segmented Control
 * Features:
 * - Viscous fluid sliding droplet with extended 700ms momentum deceleration
 * - Soft organic squash & stretch spring morphing
 * - Top-edge specular reflection + Bottom-edge chromatic dispersion rainbow caustic rim
 * - Pixel-exact relative containment with zero border bleed
 */
export default function LiquidSegmentedControl({
  options = [],
  value,
  onChange,
  className = '',
  size = 'md', // 'sm' | 'md' | 'lg'
}) {
  const containerRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const [isStretching, setIsStretching] = useState(false);
  const prevValueRef = useRef(value);

  // Measure active option position using offsetLeft/offsetWidth for exact relative positioning
  useEffect(() => {
    if (!containerRef.current || options.length === 0) return;

    const container = containerRef.current;
    const activeIndex = options.findIndex((opt) => (typeof opt === 'object' ? opt.id === value : opt === value));

    if (activeIndex === -1) {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      return;
    }

    const buttonElements = container.querySelectorAll('[data-liquid-option]');
    const activeButton = buttonElements[activeIndex];

    if (activeButton) {
      const left = activeButton.offsetLeft;
      const width = activeButton.offsetWidth;

      setIndicatorStyle({
        left,
        width,
        opacity: 1,
      });

      // Trigger luxurious fluid viscous squash & stretch during the extended glide
      if (prevValueRef.current !== value) {
        setIsStretching(true);
        const timer = setTimeout(() => setIsStretching(false), 520);
        prevValueRef.current = value;
        return () => clearTimeout(timer);
      }
    }
  }, [value, options]);

  const activeOption = options.find((opt) => (typeof opt === 'object' ? opt.id === value : opt === value));
  const activeColor = typeof activeOption === 'object' ? activeOption.color || 'cyan' : 'cyan';

  const getColorClasses = (color) => {
    const map = {
      // 1. Electric Neon Lime / Citron (100% Unique for "All" master filter)
      lime: {
        glow: 'shadow-[0_0_18px_rgba(132,204,22,0.35),inset_0_1px_1px_0_rgba(255,255,255,0.7),inset_0_-1px_1.5px_0_rgba(163,230,53,0.5)]',
        bg: 'bg-gradient-to-b from-lime-500/25 via-lime-400/15 to-emerald-500/25 dark:from-lime-400/30 dark:via-lime-400/20 dark:to-emerald-500/30',
        border: 'border-lime-500/60 dark:border-lime-400/70',
        text: 'text-lime-700 dark:text-lime-300 font-extrabold',
        rainbow: 'from-lime-400/90 via-yellow-300/90 to-emerald-400/90',
      },
      // 2. Slate Titanium (For "General")
      slate: {
        glow: 'shadow-[0_0_16px_rgba(100,116,139,0.25),inset_0_1px_1px_0_rgba(255,255,255,0.7),inset_0_-1px_1.5px_0_rgba(148,163,184,0.4)]',
        bg: 'bg-gradient-to-b from-slate-400/20 via-slate-400/10 to-slate-600/20 dark:from-slate-400/25 dark:via-slate-400/15 dark:to-slate-600/25',
        border: 'border-slate-400/50 dark:border-slate-400/60',
        text: 'text-slate-700 dark:text-slate-200',
        rainbow: 'from-slate-300 via-sky-300 to-slate-400',
      },
      // 3. Cyan / Sky Blue (For "Academics" & "AI Assistant")
      cyan: {
        glow: 'shadow-[0_0_18px_rgba(14,165,233,0.3),inset_0_1px_1px_0_rgba(255,255,255,0.7),inset_0_-1px_1.5px_0_rgba(56,189,248,0.4)]',
        bg: 'bg-gradient-to-b from-sky-500/25 via-sky-500/15 to-indigo-500/25 dark:from-sky-400/30 dark:via-sky-400/20 dark:to-indigo-500/30',
        border: 'border-sky-500/50 dark:border-sky-400/60',
        text: 'text-sky-700 dark:text-sky-200',
        rainbow: 'from-pink-500/60 via-cyan-400/80 to-emerald-400/60',
      },
      // 4. Emerald Green (For "Admissions" & "Home")
      emerald: {
        glow: 'shadow-[0_0_18px_rgba(16,185,129,0.3),inset_0_1px_1px_0_rgba(255,255,255,0.7),inset_0_-1px_1.5px_0_rgba(52,211,153,0.4)]',
        bg: 'bg-gradient-to-b from-emerald-500/25 via-emerald-500/15 to-teal-500/25 dark:from-emerald-400/30 dark:via-emerald-400/20 dark:to-teal-500/30',
        border: 'border-emerald-500/50 dark:border-emerald-400/60',
        text: 'text-emerald-700 dark:text-emerald-200',
        rainbow: 'from-emerald-400/70 via-teal-400/80 to-cyan-400/70',
      },
      // 5. Warm Amber Gold (For "Hostel" & "Documents")
      amber: {
        glow: 'shadow-[0_0_18px_rgba(245,158,11,0.3),inset_0_1px_1px_0_rgba(255,255,255,0.7),inset_0_-1px_1.5px_0_rgba(251,191,36,0.4)]',
        bg: 'bg-gradient-to-b from-amber-500/25 via-amber-500/15 to-orange-500/25 dark:from-amber-400/30 dark:via-amber-400/20 dark:to-orange-500/30',
        border: 'border-amber-500/50 dark:border-amber-400/60',
        text: 'text-amber-700 dark:text-amber-200',
        rainbow: 'from-amber-400/70 via-orange-400/80 to-rose-400/70',
      },
      // 6. Cyber Purple (For "Fees" & "Analytics")
      purple: {
        glow: 'shadow-[0_0_18px_rgba(168,85,247,0.3),inset_0_1px_1px_0_rgba(255,255,255,0.7),inset_0_-1px_1.5px_0_rgba(192,132,252,0.4)]',
        bg: 'bg-gradient-to-b from-purple-500/25 via-purple-500/15 to-indigo-500/25 dark:from-purple-400/30 dark:via-purple-400/20 dark:to-indigo-500/30',
        border: 'border-purple-500/50 dark:border-purple-400/60',
        text: 'text-purple-700 dark:text-purple-200',
        rainbow: 'from-purple-400/70 via-pink-400/80 to-indigo-400/70',
      },
      // 7. Vivid Rose Pink (For "Exams")
      rose: {
        glow: 'shadow-[0_0_18px_rgba(244,63,94,0.3),inset_0_1px_1px_0_rgba(255,255,255,0.7),inset_0_-1px_1.5px_0_rgba(251,113,133,0.4)]',
        bg: 'bg-gradient-to-b from-rose-500/25 via-rose-500/15 to-pink-500/25 dark:from-rose-400/30 dark:via-rose-400/20 dark:to-pink-500/30',
        border: 'border-rose-500/50 dark:border-rose-400/60',
        text: 'text-rose-700 dark:text-rose-200',
        rainbow: 'from-rose-400/70 via-pink-400/80 to-amber-400/70',
      },
      // 8. Crystal Diamond / Luminous Pearl
      crystal: {
        glow: 'shadow-[0_0_20px_rgba(255,255,255,0.35),inset_0_1px_1.5px_0_rgba(255,255,255,0.9),inset_0_-1px_1.5px_0_rgba(220,235,255,0.6)]',
        bg: 'bg-gradient-to-b from-white/40 via-slate-100/25 to-white/35 dark:from-white/35 dark:via-white/20 dark:to-white/25',
        border: 'border-white/90 dark:border-white/80',
        text: 'text-slate-900 dark:text-white font-extrabold',
        rainbow: 'from-rose-400 via-amber-300 via-emerald-300 via-cyan-300 to-purple-400',
      },
    };
    return map[color] || map.cyan;
  };

  const themeClasses = getColorClasses(activeColor);

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center p-1 rounded-full glass-panel-elevated border border-slate-200/90 dark:border-white/[0.12] shadow-liquid-sm select-none transition-colors duration-500 ${className}`}
    >
      {/* Viscous Liquid Morphing Droplet Indicator with Extended Smooth Sliding (700ms Fluid Deceleration) */}
      <div
        style={{
          transform: `translateX(${indicatorStyle.left}px) scaleX(${isStretching ? 1.08 : 1}) scaleY(${isStretching ? 0.92 : 1})`,
          width: `${indicatorStyle.width}px`,
          opacity: indicatorStyle.opacity,
          transformOrigin: 'center center',
        }}
        className={`absolute top-1 bottom-1 left-0 rounded-full border backdrop-blur-xl pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${themeClasses.bg} ${themeClasses.border} ${themeClasses.glow}`}
      >
        {/* Top-down Specular Reflection Sheen */}
        <div className="absolute inset-x-2 top-0.5 h-1/2 bg-gradient-to-b from-white/60 to-transparent dark:from-white/30 rounded-full pointer-events-none" />

        {/* Bottom Chromatic Dispersion Rainbow Refraction Line */}
        <div
          className={`absolute inset-x-3 bottom-0 h-[1.5px] bg-gradient-to-r ${themeClasses.rainbow || 'from-pink-500/60 via-cyan-400/80 to-emerald-400/60'} blur-[0.5px] rounded-full pointer-events-none opacity-80`}
        />
      </div>

      {/* Option Buttons / Route Links Stream */}
      {options.map((opt, idx) => {
        const id = typeof opt === 'object' ? opt.id : opt;
        const label = typeof opt === 'object' ? opt.label : opt;
        const Icon = typeof opt === 'object' ? opt.icon : null;
        const isSelected = id === value;
        const isFullWidth = className.includes('w-full') || className.includes('grid-cols');
        const isRoute = typeof id === 'string' && id.startsWith('/');

        const commonClasses = `relative z-10 flex items-center justify-center gap-1.5 md:gap-1 lg:gap-1.5 px-3.5 py-1.5 md:px-2.5 lg:px-4 md:py-1 lg:py-1.5 rounded-full text-xs md:text-[11px] lg:text-xs font-semibold tracking-wide transition-colors duration-400 active:scale-95 cursor-pointer select-none no-underline ${
          isFullWidth ? 'flex-1 h-full' : ''
        } ${
          isSelected
            ? `${themeClasses.text} font-bold`
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`;

        const content = (
          <>
            {Icon && (
              <Icon
                className={`w-3.5 h-3.5 transition-transform duration-500 ${
                  isSelected ? 'scale-105' : 'opacity-70'
                }`}
              />
            )}
            <span className="truncate">{label}</span>
          </>
        );

        if (isRoute) {
          return (
            <Link
              key={id || idx}
              to={id}
              data-liquid-option
              className={commonClasses}
            >
              {content}
            </Link>
          );
        }

        return (
          <button
            key={id || idx}
            data-liquid-option
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (onChange) onChange(id);
            }}
            className={commonClasses}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
