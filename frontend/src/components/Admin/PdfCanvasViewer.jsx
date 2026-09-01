import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Download,
  Loader2,
  AlertCircle,
  FileText,
  Sparkles,
} from 'lucide-react';
import GlassIcon from '../Common/GlassIcon.jsx';

// Configure PDF.js worker
if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
}

export default function PdfCanvasViewer({
  fileUrl,
  documentTitle = 'PDF Document',
  filename = 'document.pdf',
}) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [renderedPages, setRenderedPages] = useState({});

  const containerRef = useRef(null);
  const pageRefs = useRef({});

  // Load PDF Document
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setError(null);
    setPdfDoc(null);
    setNumPages(0);
    setCurrentPage(1);

    if (!fileUrl) {
      setError('No document URL provided.');
      setIsLoading(false);
      return;
    }

    const loadingTask = pdfjsLib.getDocument({
      url: fileUrl,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
      cMapPacked: true,
    });

    loadingTask.promise
      .then((loadedDoc) => {
        if (isCancelled) return;
        setPdfDoc(loadedDoc);
        setNumPages(loadedDoc.numPages);
        setIsLoading(false);
      })
      .catch((err) => {
        if (isCancelled) return;
        console.error('[PdfCanvasViewer] PDF.js load error:', err);
        setError('Failed to render PDF canvas. You can still open or download the document.');
        setIsLoading(false);
      });

    return () => {
      isCancelled = true;
      try {
        loadingTask.destroy();
      } catch (e) {}
    };
  }, [fileUrl]);

  // Render individual page to canvas
  const renderPage = useCallback(
    async (pageNum) => {
      if (!pdfDoc || !pageRefs.current[pageNum]) return;

      try {
        const page = await pdfDoc.getPage(pageNum);
        const canvas = pageRefs.current[pageNum];
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: scale * 1.5 }); // High-DPI scaling

        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.style.maxWidth = `${viewport.width / 1.5}px`;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        setRenderedPages((prev) => ({ ...prev, [pageNum]: true }));
      } catch (err) {
        console.warn(`[PdfCanvasViewer] Page ${pageNum} render issue:`, err);
      }
    },
    [pdfDoc, scale]
  );

  // Render all pages when pdfDoc or scale changes
  useEffect(() => {
    if (!pdfDoc || numPages === 0) return;

    for (let p = 1; p <= numPages; p++) {
      renderPage(p);
    }
  }, [pdfDoc, numPages, scale, renderPage]);

  // Track active page during scroll
  const handleScroll = () => {
    if (!containerRef.current || numPages === 0) return;
    const containerTop = containerRef.current.getBoundingClientRect().top;

    for (let p = 1; p <= numPages; p++) {
      const el = pageRefs.current[p];
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top - containerTop <= 150 && rect.bottom - containerTop >= 50) {
          setCurrentPage(p);
          break;
        }
      }
    }
  };

  const scrollToPage = (pageNum) => {
    const target = Math.max(1, Math.min(numPages, pageNum));
    const el = pageRefs.current[target];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setCurrentPage(target);
    }
  };

  return (
    <div className="relative h-full w-full bg-[#070b12] text-white overflow-hidden select-none">
      {/* SCROLLABLE CANVAS DOCUMENT BODY WITH STICKY LIQUID GLASS TOOLBAR */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-auto overscroll-contain touch-scroll-momentum relative"
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y pinch-zoom',
        }}
      >
        {/* 1. TOP LIQUID GLASS FLOATING TOOLBAR */}
        <div
          className="sticky top-0 left-0 right-0 z-30 w-full flex items-center justify-between px-3 sm:px-5 py-2.5 bg-white/45 dark:bg-[#070b12]/50 backdrop-blur-3xl backdrop-saturate-200 border-b border-white/70 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.08)] transition-all duration-300"
          style={{
            WebkitBackdropFilter: 'blur(28px) saturate(200%)',
          }}
        >
          {/* Animated Liquid Glass Light Sheen Sweep */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/[0.07] to-transparent -translate-x-full animate-liquid-shimmer pointer-events-none" />

          {/* Top Specular Liquid Glass Highlight Sheen */}
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/90 dark:via-white/50 to-transparent pointer-events-none" />

          {/* Bottom Chromatic Dispersion Refraction Line */}
          <div className="absolute inset-x-0 bottom-0 h-[1.5px] bg-gradient-to-r from-pink-500/40 via-cyan-400/60 to-emerald-400/50 blur-[0.5px] pointer-events-none opacity-80" />

          {/* Left: Document details & page indicator */}
          <div className="flex items-center gap-2 min-w-0 relative z-10">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] shrink-0 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px] xs:max-w-[200px] sm:max-w-xs">
              {filename}
            </span>
            {numPages > 0 && (
              <span className="hidden xs:inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-full glass-badge text-sky-700 dark:text-sky-300 shadow-liquid-sm">
                {numPages} {numPages === 1 ? 'page' : 'pages'}
              </span>
            )}
          </div>

          {/* Center: Pagination controls */}
          {numPages > 1 && (
            <div className="flex items-center gap-1 glass-badge rounded-full px-2 py-1 shadow-liquid-sm relative z-10">
              <button
                onClick={() => scrollToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
              </button>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold px-1 text-slate-700 dark:text-slate-200">
                {currentPage} / {numPages}
              </span>
              <button
                onClick={() => scrollToPage(currentPage + 1)}
                disabled={currentPage >= numPages}
                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
              </button>
            </div>
          )}

          {/* Right: Zoom controls & Native viewer actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 relative z-10">
            {/* Zoom Engine */}
            <div className="hidden sm:flex items-center gap-1 glass-badge rounded-full px-1.5 py-0.5 shadow-liquid-sm">
              <button
                onClick={() => setScale((s) => Math.max(0.6, s - 0.2))}
                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 cursor-pointer"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono font-bold px-1 text-slate-700 dark:text-slate-300">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 cursor-pointer"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setScale(1.0)}
                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* Open in Tab */}
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/35 transition-all shadow-liquid-sm active:scale-95 cursor-pointer"
              title="Open in browser native PDF viewer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Open in Tab</span>
            </a>

            {/* Download */}
            <a
              href={fileUrl}
              download={filename}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white glass-badge hover:bg-black/5 dark:hover:bg-white/10 transition-all shadow-liquid-sm active:scale-95 cursor-pointer flex items-center gap-1"
              title="Download PDF to device"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save</span>
            </a>
          </div>
        </div>

        {/* 2. DOCUMENT CONTENT CONTAINER */}
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 flex flex-col items-center min-h-[calc(100%-3rem)]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full my-auto space-y-3 py-12">
              <div className="relative">
                <Loader2 className="w-9 h-9 animate-spin text-sky-400" />
                <Sparkles className="w-4 h-4 text-emerald-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <p className="text-xs text-slate-400 font-mono">Rendering high-resolution PDF canvas...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full my-auto p-6 text-center space-y-4 max-w-md py-12">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-200">Interactive Canvas View Unavailable</p>
                <p className="text-xs text-slate-400">{error}</p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 shadow-glow-blue flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Native Viewer</span>
                </a>
                <a
                  href={fileUrl}
                  download={filename}
                  className="px-4 py-2 rounded-full text-xs font-semibold glass-badge hover:bg-white/10 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          ) : (
            /* Multi-Page Canvas Stack */
            Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
              <div
                key={pageNum}
                className="relative flex flex-col items-center w-full max-w-3xl transition-transform duration-200"
              >
                {/* Page Number Glass Pill */}
                <div className="self-start mb-1 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold text-slate-400 bg-white/[0.05] border border-white/[0.08] shadow-xs">
                  Page {pageNum} of {numPages}
                </div>

                {/* Canvas Sheet */}
                <div className="w-full flex justify-center bg-white rounded-xl sm:rounded-2xl shadow-[0_10px_35px_-5px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden">
                  <canvas
                    ref={(el) => (pageRefs.current[pageNum] = el)}
                    className="w-full h-auto block"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
