import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Helper to generate page numbers with ellipsis (...)
 * e.g., [1, 2, 3, 4, 5, '...', 10] or [1, '...', 4, 5, 6, '...', 10]
 */
export function generatePagination(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      '...',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
}

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems = 0,
  pageSize = 10,
  showSummary = true,
  className = '',
}) {
  const validCurrentPage = Math.min(Math.max(currentPage, 1), Math.max(totalPages, 1));
  const pages = generatePagination(validCurrentPage, totalPages);

  const startIndex = totalItems === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1;
  const endIndex = Math.min(validCurrentPage * pageSize, totalItems);

  const handlePageClick = (page) => {
    if (page === '...' || page === validCurrentPage || page < 1 || page > totalPages) {
      return;
    }
    onPageChange(page);
  };

  return (
    <div
      className={`p-3.5 sm:p-5 border-t border-slate-200/80 dark:border-white/[0.08] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-slate-50/50 dark:bg-white/[0.02] ${className}`}
    >
      {/* Showing X to Y of Z records summary */}
      {showSummary && (
        <div className="text-xs text-slate-500 dark:text-slate-400 select-none order-2 md:order-1">
          Showing <span className="font-bold text-slate-900 dark:text-white">{startIndex}</span> to{' '}
          <span className="font-bold text-slate-900 dark:text-white">{endIndex}</span> of{' '}
          <span className="font-bold text-slate-900 dark:text-white">{totalItems}</span> documents
        </div>
      )}

      {/* Pagination Controls - Filter Pill Match */}
      <nav
        aria-label="Pagination Navigation"
        className="flex flex-wrap items-center gap-1.5 text-xs select-none order-1 md:order-2 justify-center md:justify-end"
      >
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => handlePageClick(validCurrentPage - 1)}
          disabled={validCurrentPage <= 1}
          aria-label="Previous Page"
          className="px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all shrink-0 active:scale-95 glass-badge text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:scale-100 flex items-center gap-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        {/* Page Number Pills */}
        <div className="flex items-center gap-1.5">
          {pages.map((page, idx) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-slate-400 dark:text-slate-500 font-mono select-none tracking-widest text-[11px] sm:text-xs"
                >
                  ...
                </span>
              );
            }

            const isActive = page === validCurrentPage;

            return (
              <button
                key={`page-${page}`}
                type="button"
                onClick={() => handlePageClick(page)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Page ${page}`}
                className={`px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all shrink-0 active:scale-95 ${
                  isActive
                    ? 'bg-sky-500/15 dark:bg-sky-500/20 text-sky-700 dark:text-sky-200 border border-sky-500/35 dark:border-sky-500/40 shadow-sm dark:shadow-glow-cyan scale-105'
                    : 'glass-badge text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.08]'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => handlePageClick(validCurrentPage + 1)}
          disabled={validCurrentPage >= totalPages}
          aria-label="Next Page"
          className="px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all shrink-0 active:scale-95 glass-badge text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:scale-100 flex items-center gap-1"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </nav>
    </div>
  );
}
