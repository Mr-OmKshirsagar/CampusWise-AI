import React from 'react';

export default function CampusWiseLogo({ size = 'md', showText = true, badgeText = 'RAG v2.0' }) {
  const sizeMap = {
    sm: { box: 'w-8 h-8 rounded-xl', icon: 'w-4 h-4', text: 'text-base', sub: 'text-[9px]' },
    md: { box: 'w-10 h-10 rounded-2xl', icon: 'w-5 h-5', text: 'text-lg', sub: 'text-[10px]' },
    lg: { box: 'w-14 h-14 rounded-3xl', icon: 'w-7 h-7', text: 'text-2xl', sub: 'text-xs' },
    xl: { box: 'w-20 h-20 rounded-[2rem]', icon: 'w-10 h-10', text: 'text-3xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className="flex items-center gap-3 group shrink-0 select-none">
      {/* 3D Glass Emblem Container */}
      <div className="relative">
        <div
          className={`${currentSize.box} glass-icon-cyan flex items-center justify-center group-hover:scale-105 group-hover:shadow-glow-cyan transition-all duration-300 relative overflow-hidden`}
        >
          {/* Internal Specular Bevel Reflection */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 dark:from-white/30 to-transparent pointer-events-none" />

          {/* Futuristic Academic + Neural Node Vector Icon */}
          <svg
            className={`${currentSize.icon} text-sky-600 dark:text-sky-400 group-hover:rotate-3 transition-transform duration-300`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Academic Cap / Shield Base */}
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="url(#logo-grad-1)" stroke="#0284c7" />
            <path d="M2 17l10 5 10-5" stroke="#2563eb" />
            <path d="M2 12l10 5 10-5" stroke="#3b82f6" />
            {/* Neural Node Core */}
            <circle cx="12" cy="12" r="2" fill="#0284c7" className="animate-pulse" />
            {/* Neural RAG rays */}
            <line x1="12" y1="2" x2="12" y2="7" stroke="#ffffff" strokeWidth="1.5" />
            
            <defs>
              <linearGradient id="logo-grad-1" x1="2" y1="2" x2="22" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38bdf8" stopOpacity="0.7" />
                <stop offset="1" stopColor="#818cf8" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Live Operational Status Orb */}
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#030508] shadow-[0_0_8px_#10b981] animate-pulse" />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`font-display font-extrabold ${currentSize.text} text-slate-900 dark:text-white tracking-tight flex items-center`}>
              CampusWise{' '}
              <span className="bg-gradient-to-r from-sky-500 via-electric-500 to-indigo-600 dark:from-sky-400 dark:via-electric-400 dark:to-cyber-400 bg-clip-text text-transparent ml-1 font-black">
                AI
              </span>
            </span>
            {badgeText && (
              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/25 rounded-full glass-badge hidden xs:inline-block">
                {badgeText}
              </span>
            )}
          </div>
          <p className={`${currentSize.sub} text-slate-500 dark:text-slate-400 hidden sm:block tracking-wide font-medium`}>
            Official Institutional Knowledge Assistant
          </p>
        </div>
      )}
    </div>
  );
}
