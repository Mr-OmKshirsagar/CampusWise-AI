import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, AlertTriangle, X, ShieldAlert } from 'lucide-react';
import GlassIcon from './GlassIcon.jsx';

/**
 * Apple Liquid Glass Confirmation Modal
 * Features:
 * - Fluid glass elevation with squircle curvature
 * - Top specular highlight sheen & bottom chromatic dispersion refraction line
 * - Danger rose liquid glow theme for destructive actions
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  itemName = '',
  itemType = 'item', // 'document' | 'chat' | 'conversation'
  description,
  confirmText = 'Delete',
  confirmVariant = 'rose',
  isLoading = false,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const defaultDescription =
    itemType === 'document'
      ? 'This will permanently remove the file, structural passages, and vector embeddings from pgvector storage.'
      : 'This will permanently delete this conversation and its entire verified citation history.';

  const modalContent = (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/45 dark:bg-black/60 backdrop-blur-md animate-fade-in">
      {/* Ambient background glow bubble */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-500/10 via-transparent to-purple-500/10 pointer-events-none" />

      {/* Backdrop Click Dismiss */}
      <div className="absolute inset-0 -z-10 cursor-pointer" onClick={() => !isLoading && onClose()} />

      {/* Liquid Glass Confirmation Card */}
      <div
        className="relative w-full max-w-md glass-panel-elevated bg-white/95 dark:bg-[#070b12]/95 backdrop-blur-3xl rounded-4xl border border-white/80 dark:border-white/20 p-6 sm:p-8 space-y-5 shadow-[0_25px_80px_-10px_rgba(0,0,0,0.5),0_0_50px_-10px_rgba(244,63,94,0.25)] ring-1 ring-black/10 dark:ring-white/10 animate-scale-up overflow-hidden"
      >
        {/* Top-edge specular reflection sheen */}
        <div className="absolute inset-x-8 top-0 h-1 bg-gradient-to-b from-white/80 to-transparent dark:from-white/40 rounded-full pointer-events-none" />

        {/* Bottom chromatic dispersion line */}
        <div className="absolute inset-x-10 bottom-0 h-[1.5px] bg-gradient-to-r from-rose-500/60 via-pink-400/80 to-purple-500/60 blur-[0.5px] rounded-full pointer-events-none opacity-80" />

        {/* Header with Danger Icon */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <GlassIcon icon={Trash2} variant="rose" size="md" />
            <div>
              <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                {title}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Please confirm this irreversible deletion.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="p-1.5 rounded-full glass-badge text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all shadow-liquid-sm active:scale-95 disabled:opacity-50"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Item Name Highlighted Pill */}
        <div className="p-3.5 rounded-3xl glass-input border border-slate-200/90 dark:border-white/[0.1] space-y-1 bg-slate-50/70 dark:bg-white/[0.02] shadow-inner">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400 block font-mono">
            Target {itemType.toUpperCase()}
          </span>
          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white break-words">
            "{itemName || 'Untitled'}"
          </p>
        </div>

        {/* Informative Warning Text */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {description || defaultDescription}
        </p>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-full glass-badge text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 font-semibold text-xs transition-all active:scale-95 shadow-liquid-sm cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold text-xs shadow-liquid-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
