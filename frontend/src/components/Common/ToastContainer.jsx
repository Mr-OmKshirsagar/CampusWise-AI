import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  XCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { useToastStore } from '../../store/toastStore.js';
import GlassIcon from './GlassIcon.jsx';

function ToastItem({ toast, onDismiss }) {
  const [isLeaving, setIsLeaving] = useState(false);
  const [progress, setProgress] = useState(100);

  const duration = toast.duration || 4000;

  useEffect(() => {
    if (duration <= 0) return;

    setIsLeaving(false);
    setProgress(100);
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingPct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remainingPct);

      if (elapsed >= duration - 350 && !isLeaving) {
        setIsLeaving(true);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [duration, toast.message, toast.updatedAt, toast.id]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 320);
  };

  const getToastConfig = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle2,
          variant: 'emerald',
          border: 'border-emerald-500/50 dark:border-emerald-400/30',
          bg: 'bg-white/95 dark:bg-[#071811]/95',
          shadow: 'shadow-[0_20px_50px_-10px_rgba(16,185,129,0.35),0_0_20px_0_rgba(16,185,129,0.15)]',
          badgeClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40',
          gradientBar: 'from-emerald-400 via-teal-400 to-cyan-400',
          sheenColor: 'from-emerald-400/20 via-white/40 to-transparent',
        };
      case 'error':
        return {
          icon: AlertCircle,
          variant: 'rose',
          border: 'border-rose-500/50 dark:border-rose-400/30',
          bg: 'bg-white/95 dark:bg-[#1a070c]/95',
          shadow: 'shadow-[0_20px_50px_-10px_rgba(244,63,94,0.35),0_0_20px_0_rgba(244,63,94,0.15)]',
          badgeClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40',
          gradientBar: 'from-rose-500 via-pink-500 to-amber-500',
          sheenColor: 'from-rose-400/20 via-white/40 to-transparent',
        };
      case 'cancel':
        return {
          icon: XCircle,
          variant: 'amber',
          border: 'border-amber-500/50 dark:border-amber-400/30',
          bg: 'bg-white/95 dark:bg-[#140e04]/95',
          shadow: 'shadow-[0_20px_50px_-10px_rgba(245,158,11,0.3),0_0_20px_0_rgba(245,158,11,0.15)]',
          badgeClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40',
          gradientBar: 'from-amber-400 via-orange-400 to-yellow-400',
          sheenColor: 'from-amber-400/20 via-white/40 to-transparent',
        };
      default:
        return {
          icon: Info,
          variant: 'cyan',
          border: 'border-sky-500/50 dark:border-sky-400/30',
          bg: 'bg-white/95 dark:bg-[#070e1a]/95',
          shadow: 'shadow-[0_20px_50px_-10px_rgba(56,189,248,0.3),0_0_20px_0_rgba(56,189,248,0.15)]',
          badgeClass: 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/40',
          gradientBar: 'from-sky-400 via-cyan-400 to-indigo-400',
          sheenColor: 'from-sky-400/20 via-white/40 to-transparent',
        };
    }
  };

  const config = getToastConfig(toast.type);
  const IconComponent = config.icon;

  return (
    <div
      className={`pointer-events-auto relative w-full glass-panel-elevated ${config.bg} backdrop-blur-3xl p-4 rounded-3xl border ${config.border} ${config.shadow} flex items-start gap-3 transition-all overflow-hidden ring-1 ring-black/5 dark:ring-white/15 will-change-transform ${
        isLeaving ? 'animate-liquid-toast-out' : 'animate-liquid-toast-in'
      }`}
    >
      {/* Dynamic diagonal liquid specular sheen beam sweeping across the surface */}
      <div
        className={`absolute inset-0 w-1/2 bg-gradient-to-r ${config.sheenColor} pointer-events-none animate-liquid-sheen`}
      />

      {/* Top Specular Edge Line */}
      <div className="absolute inset-x-6 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-white/40 pointer-events-none" />

      <GlassIcon
        icon={IconComponent}
        variant={config.variant}
        size="xs"
        className="shrink-0 mt-0.5"
      />

      <div className="flex-1 min-w-0 space-y-1 relative z-10">
        {toast.title && (
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${config.badgeClass} shadow-liquid-sm`}
            >
              {toast.title}
            </span>
          </div>
        )}
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 break-words leading-relaxed">
          {toast.message}
        </p>
      </div>

      <button
        type="button"
        onClick={handleClose}
        className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer shrink-0 relative z-10 active:scale-90"
        title="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Fluid Liquid Countdown Drainage Line */}
      {duration > 0 && (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-black/5 dark:bg-white/5 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${config.gradientBar} transition-all duration-75 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  const content = (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:top-6 sm:right-6 z-[200] flex flex-col items-center sm:items-end gap-2.5 w-[calc(100vw-1.5rem)] max-w-sm sm:max-w-md pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={removeToast} />
      ))}
    </div>
  );

  return createPortal(content, document.body);
}
