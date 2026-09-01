import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  FileText,
  Image as ImageIcon,
  Download,
  ExternalLink,
  Layers,
  Search,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  Calendar,
  HardDrive,
  Shield,
  FileCode,
  Sparkles,
  Loader2,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { documentApi, getFileUrl } from '../../services/api.js';
import GlassIcon from '../Common/GlassIcon.jsx';
import LiquidSegmentedControl from '../Common/LiquidSegmentedControl.jsx';
import PdfCanvasViewer from './PdfCanvasViewer.jsx';

export default function DocumentViewerModal({ documentId, onClose }) {
  const [documentData, setDocumentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'chunks' | 'metadata'
  const [chunkSearch, setChunkSearch] = useState('');
  const [copiedChunkId, setCopiedChunkId] = useState(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMorphing, setIsMorphing] = useState(false);

  useEffect(() => {
    if (!documentId) return;

    const fetchDocument = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await documentApi.getById(documentId);
        setDocumentData(res.data ? res.data : res);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load document details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  // Handle keyboard ESC to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const toggleFullscreen = () => {
    setIsMorphing(true);
    setIsFullscreen((prev) => !prev);
    setTimeout(() => setIsMorphing(false), 520);
  };

  if (!documentId) return null;

  const doc = documentData?.document || {};
  const chunks = documentData?.chunks || [];

  const isImage =
    doc.filename?.match(/\.(png|jpe?g|webp|gif|bmp)$/i) ||
    doc.file_url?.match(/\.(png|jpe?g|webp|gif|bmp)$/i);

  const fileUrl = doc.file_url ? getFileUrl(doc.file_url) : '';
  const cleanFilename = (doc.filename || '').replace(/^\d+-\d+-/, '');

  const handleCopyChunk = (chunkId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedChunkId(chunkId);
    setTimeout(() => setCopiedChunkId(null), 2000);
  };

  const filteredChunks = chunks.filter((c) =>
    (c.content || '').toLowerCase().includes(chunkSearch.toLowerCase())
  );

  const tabOptions = [
    { id: 'preview', label: 'File Preview', icon: FileText, color: 'cyan' },
    { id: 'chunks', label: `Chunks (${chunks.length})`, icon: Layers, color: 'purple' },
    { id: 'metadata', label: 'Metadata', icon: Sparkles, color: 'emerald' },
  ];

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-slate-950/40 dark:bg-black/55 backdrop-blur-md bg-ambient-mesh animate-fade-in">
      {/* Full-bleed ambient lighting overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-500/15 via-transparent to-purple-500/15 pointer-events-none" />

      {/* Transparent click-outside backdrop */}
      <div className="absolute inset-0 -z-10 cursor-pointer" onClick={onClose} />

      {/* ══════════════════════════════════════════════════════════════
          LIQUID GLASS MODAL CARD WITH ELASTIC SPRING MORPHING
         ══════════════════════════════════════════════════════════════ */}
      <div
        style={{
          transform: `scale(${isMorphing ? (isFullscreen ? 1.018 : 0.982) : 1})`,
          transformOrigin: 'center',
        }}
        className={`relative w-full flex flex-col glass-panel-elevated bg-white/95 dark:bg-[#070b12]/95 backdrop-blur-3xl border border-white/80 dark:border-white/20 shadow-[0_25px_80px_-10px_rgba(0,0,0,0.5),0_0_60px_-15px_rgba(56,189,248,0.35)] ring-1 ring-black/10 dark:ring-white/10 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] will-change-[max-width,height,transform,border-radius] ${
          isFullscreen
            ? 'h-[96dvh] max-w-[98vw] rounded-3xl sm:rounded-4xl'
            : 'h-[85vh] sm:h-[86vh] max-w-3xl lg:max-w-4xl rounded-4xl'
        }`}
      >
        {/* Top-edge specular reflection sheen */}
        <div className="absolute inset-x-8 top-0 h-1 bg-gradient-to-b from-white/80 to-transparent dark:from-white/40 rounded-full pointer-events-none z-30" />

        {/* Bottom chromatic dispersion line */}
        <div className="absolute inset-x-12 bottom-0 h-[1.5px] bg-gradient-to-r from-pink-500/50 via-cyan-400/70 to-emerald-400/50 blur-[0.5px] rounded-full pointer-events-none z-30 opacity-75" />

        {/* Top Header Bar with WWDC25 Liquid Glass Segmented Control */}
        <div className="p-3.5 sm:px-6 border-b border-slate-200/80 dark:border-white/[0.1] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/80 dark:bg-white/[0.03] backdrop-blur-md shrink-0 z-20">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <GlassIcon
                icon={isImage ? ImageIcon : FileText}
                variant={isImage ? 'emerald' : 'cyan'}
                size="xs"
                className="shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h3 className="font-display font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate max-w-[160px] xs:max-w-[220px] sm:max-w-xs tracking-tight">
                    {doc.title || cleanFilename || 'Document Preview'}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30 shrink-0">
                    {doc.category || 'General'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[180px] xs:max-w-xs">
                  {cleanFilename || 'document'} • {chunks.length} chunks
                </p>
              </div>
            </div>

            {/* Mobile Header Actions */}
            <div className="flex items-center gap-1 sm:hidden">
              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-1.5 rounded-full glass-badge text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-liquid-sm active:scale-90 transition-transform"
                title={isFullscreen ? 'Minimize' : 'Maximize'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full glass-badge text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-liquid-sm active:scale-90 transition-transform"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Liquid Morphing Tab Switcher & Desktop Actions */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5">
            <LiquidSegmentedControl
              options={tabOptions}
              value={activeTab}
              onChange={(tab) => setActiveTab(tab)}
            />

            <div className="hidden sm:flex items-center gap-1.5">
              {/* Maximize / Minimize Button with Fluid Spring Elastic Animation */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-2 rounded-full glass-badge text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-500/10 transition-all shadow-liquid-sm active:scale-90 hover:scale-105 cursor-pointer"
                title={isFullscreen ? 'Minimize View' : 'Maximize to Full View'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full glass-badge text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-all shadow-liquid-sm active:scale-90 hover:scale-105 cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-hidden relative w-full h-full min-w-0 min-h-0 bg-white dark:bg-[#070b12]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-sky-500 dark:text-sky-400" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Loading document and vector chunks...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 dark:text-rose-400">
                <Info className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-300">{error}</p>
            </div>
          ) : (
            <>
              {/* TAB 1: DOCUMENT PREVIEW */}
              {activeTab === 'preview' && (
                <div className="h-full w-full flex-1 flex flex-col bg-white dark:bg-[#070b12] relative overflow-hidden min-w-0 min-h-0">
                  {isImage ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-auto relative min-h-0">
                      {/* Image Zoom Toolbar */}
                      <div className="absolute top-4 right-4 z-10 flex items-center gap-1 glass-panel-elevated p-1.5 rounded-full border border-slate-200/90 dark:border-white/[0.1] shadow-liquid-sm">
                        <button
                          onClick={() => setImageZoom((z) => Math.max(0.5, z - 0.25))}
                          className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300"
                          title="Zoom out"
                        >
                          <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-[10px] font-mono font-bold px-1 text-slate-700 dark:text-slate-300">
                          {Math.round(imageZoom * 100)}%
                        </span>
                        <button
                          onClick={() => setImageZoom((z) => Math.min(3, z + 0.25))}
                          className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300"
                          title="Zoom in"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setImageZoom(1)}
                          className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300"
                          title="Reset zoom"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {fileUrl ? (
                        <div className="overflow-auto max-w-full max-h-full flex items-center justify-center p-4">
                          <img
                            src={fileUrl}
                            alt={doc.title || 'Document preview'}
                            style={{ transform: `scale(${imageZoom})`, transformOrigin: 'center' }}
                            className="max-h-[65vh] object-contain rounded-2xl shadow-liquid-md transition-transform duration-200"
                          />
                        </div>
                      ) : (
                        <div className="text-center text-slate-400 space-y-2">
                          <ImageIcon className="w-12 h-12 mx-auto opacity-40 text-sky-500" />
                          <p className="text-xs">No image preview URL available for this record.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Native Multi-Page HTML5 Canvas PDF Viewer with Fluid Touch Scrolling */
                    <PdfCanvasViewer
                      fileUrl={fileUrl}
                      documentTitle={doc.title || cleanFilename || 'PDF Document'}
                      filename={cleanFilename || 'document.pdf'}
                    />
                  )}
                </div>
              )}

              {/* TAB 2: VECTOR CHUNKS INSPECTOR */}
              {activeTab === 'chunks' && (
                <div className="h-full flex flex-col p-4 sm:p-6 space-y-4 overflow-hidden">
                  <div className="flex items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search vectorized chunks..."
                        value={chunkSearch}
                        onChange={(e) => setChunkSearch(e.target.value)}
                        className="w-full glass-input rounded-3xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400"
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 glass-badge px-3 py-1.5 rounded-full shadow-liquid-sm">
                      {filteredChunks.length} of {chunks.length} chunks
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar pr-1">
                    {filteredChunks.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-xs">
                        No vector chunks matching your search term.
                      </div>
                    ) : (
                      filteredChunks.map((chunk, index) => (
                        <div
                          key={chunk.id || index}
                          className="glass-card p-4 sm:p-5 rounded-3xl space-y-2.5 border-slate-200/90 dark:border-white/[0.08] shadow-liquid-sm group hover:border-sky-500/40 transition-all"
                        >
                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            <span className="font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5" />
                              Chunk #{chunk.chunk_index !== undefined ? chunk.chunk_index + 1 : index + 1}
                            </span>
                            <div className="flex items-center gap-2">
                              {chunk.metadata?.page && (
                                <span className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10">
                                  Page {chunk.metadata.page}
                                </span>
                              )}
                              <button
                                onClick={() => handleCopyChunk(chunk.id || index, chunk.content)}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                                title="Copy chunk content"
                              >
                                {copiedChunkId === (chunk.id || index) ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50/80 dark:bg-white/[0.02] p-3 rounded-2xl border border-slate-200/60 dark:border-white/[0.04]">
                            {chunk.content}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: METADATA & VECTOR TOPOLOGY */}
              {activeTab === 'metadata' && (
                <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-5 no-scrollbar">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="glass-card p-4 rounded-3xl space-y-1 border-slate-200/80 dark:border-white/[0.08]">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Document ID</span>
                      <p className="font-mono text-xs font-bold text-slate-900 dark:text-white truncate">{doc.id}</p>
                    </div>

                    <div className="glass-card p-4 rounded-3xl space-y-1 border-slate-200/80 dark:border-white/[0.08]">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Category Tag</span>
                      <p className="text-xs font-bold text-sky-600 dark:text-sky-400">{doc.category || 'General'}</p>
                    </div>

                    <div className="glass-card p-4 rounded-3xl space-y-1 border-slate-200/80 dark:border-white/[0.08]">
                      <span className="text-[10px] uppercase font-bold text-slate-400">File Size</span>
                      <p className="font-mono text-xs text-slate-900 dark:text-white">
                        {doc.file_size ? `${(doc.file_size / (1024 * 1024)).toFixed(2)} MB` : 'N/A'}
                      </p>
                    </div>

                    <div className="glass-card p-4 rounded-3xl space-y-1 border-slate-200/80 dark:border-white/[0.08]">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Ingested At</span>
                      <p className="font-mono text-xs text-slate-900 dark:text-white">
                        {doc.created_at ? new Date(doc.created_at).toLocaleString() : 'N/A'}
                      </p>
                    </div>

                    <div className="glass-card p-4 rounded-3xl space-y-1 border-slate-200/80 dark:border-white/[0.08]">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Total Chunks</span>
                      <p className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">{chunks.length}</p>
                    </div>

                    <div className="glass-card p-4 rounded-3xl space-y-1 border-slate-200/80 dark:border-white/[0.08]">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Embedding Engine</span>
                      <p className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        768-Dim (text-embedding-004)
                      </p>
                    </div>
                  </div>

                  {/* Raw Metadata JSON Preview */}
                  <div className="glass-card p-4 sm:p-5 rounded-3xl space-y-2 border-slate-200/80 dark:border-white/[0.08]">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-sky-500" />
                      <span>Raw Ingestion Metadata</span>
                    </span>
                    <pre className="p-3.5 rounded-2xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed border border-white/10">
                      {JSON.stringify(doc.metadata || { category: doc.category, filename: cleanFilename }, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
