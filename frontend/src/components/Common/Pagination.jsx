import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize = 10,
}) {
  const pageContainerRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const [isStretching, setIsStretching] = useState(false);
  const prevPageRef = useRef(currentPage);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        start = 1;
        end = maxVisiblePages;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - maxVisiblePages + 1;
        end = totalPages;
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Track and animate sliding liquid droplet behind active page using offsetLeft/offsetWidth
  useEffect(() => {
    if (!pageContainerRef.current) return;

    const container = pageContainerRef.current;
    const activeButton = container.querySelector(`[data-page="${currentPage}"]`);

    if (activeButton) {
      const left = activeButton.offsetLeft;
      const width = activeButton.offsetWidth;

      setIndicatorStyle({
        left,
        width,
        opacity: 1,
      });

      if (prevPageRef.current !== currentPage) {
        setIsStretching(true);
        const timer = setTimeout(() => setIsStretching(false), 450);
        prevPageRef.current = currentPage;
        return () => clearTimeout(timer);
      }
    }
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs select-none">
      {/* Items Count Summary */}
      <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px] order-2 sm:order-1">
        Showing <span className="font-bold text-slate-800 dark:text-slate-200">{startItem}</span> to{' '}
        <span className="font-bold text-slate-800 dark:text-slate-200">{endItem}</span> of{' '}
        <span className="font-bold text-slate-800 dark:text-slate-200">{totalItems}</span> documents
      </div>

      {/* Pagination Controls with Sliding Liquid Glass Indicator */}
      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-full text-xs transition-all shrink-0 active:scale-95 glass-badge text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-sky-500/10 dark:hover:bg-white/[0.08] hover:border-sky-500/30 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent shadow-liquid-sm cursor-pointer"
          title="First Page"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 active:scale-95 glass-badge text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-sky-500/10 dark:hover:bg-white/[0.08] hover:border-sky-500/30 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent flex items-center gap-1 shadow-liquid-sm cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Prev</span>
        </button>

        {/* Sliding Liquid Glass Page Numbers Container */}
        <div
          ref={pageContainerRef}
          className="relative flex items-center p-1 rounded-full glass-panel-elevated border border-slate-200/90 dark:border-white/[0.12] shadow-liquid-sm overflow-hidden"
        >
          {/* Viscous Sliding Liquid Droplet Indicator with 600ms Fluid Momentum Curve */}
          <div
            style={{
              transform: `translateX(${indicatorStyle.left}px) scaleX(${isStretching ? 1.08 : 1}) scaleY(${isStretching ? 0.92 : 1})`,
              width: `${indicatorStyle.width}px`,
              opacity: indicatorStyle.opacity,
              transformOrigin: 'center center',
            }}
            className="absolute top-1 bottom-1 left-0 rounded-full border border-sky-500/60 dark:border-sky-400/70 bg-gradient-to-b from-sky-500/25 via-sky-500/15 to-indigo-500/25 dark:from-sky-400/30 dark:via-sky-400/20 dark:to-indigo-500/30 backdrop-blur-xl pointer-events-none transition-all duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-[0_0_18px_rgba(14,165,233,0.35),inset_0_1px_1px_0_rgba(255,255,255,0.7),inset_0_-1px_1.5px_0_rgba(56,189,248,0.5)]"
          >
            {/* Top-down Specular Reflection Sheen */}
            <div className="absolute inset-x-1.5 top-0.5 h-1/2 bg-gradient-to-b from-white/60 to-transparent dark:from-white/30 rounded-full pointer-events-none" />

            {/* Bottom Chromatic Dispersion Rainbow Refraction Line */}
            <div className="absolute inset-x-2 bottom-0 h-[1.5px] bg-gradient-to-r from-pink-400/70 via-cyan-400/80 to-emerald-400/70 blur-[0.5px] rounded-full pointer-events-none opacity-80" />
          </div>

          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2.5 py-1 text-slate-400 font-mono text-xs"
                >
                  ...
                </span>
              );
            }

            const isActive = currentPage === page;
            return (
              <button
                key={`page-${page}`}
                data-page={page}
                onClick={() => onPageChange(page)}
                className={`relative z-10 min-w-[32px] h-7 px-2.5 rounded-full text-xs font-semibold transition-colors duration-300 shrink-0 active:scale-95 cursor-pointer ${
                  isActive
                    ? 'text-sky-700 dark:text-sky-200 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 active:scale-95 glass-badge text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-sky-500/10 dark:hover:bg-white/[0.08] hover:border-sky-500/30 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent flex items-center gap-1 shadow-liquid-sm cursor-pointer"
        >
          <span className="hidden xs:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-full text-xs transition-all shrink-0 active:scale-95 glass-badge text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-sky-500/10 dark:hover:bg-white/[0.08] hover:border-sky-500/30 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent shadow-liquid-sm cursor-pointer"
          title="Last Page"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
