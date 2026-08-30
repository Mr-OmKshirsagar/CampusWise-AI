import React, { useState, useEffect } from 'react';
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

export default function DocumentViewerModal({ documentId, onClose }) {
  const [documentData, setDocumentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'chunks' | 'metadata'
  const [chunkSearch, setChunkSearch] = useState('');
  const [copiedChunkId, setCopiedChunkId] = useState(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!documentId) return;

    const fetchDocument = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await documentApi.getById(documentId);
        setDocumentData(res.data);
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

  if (!documentId) return null;

  const doc = documentData?.document || {};
  const chunks = documentData?.chunks || [];

  const isImage =
    doc.filename?.match(/\.(png|jpe?g|webp|gif|bmp)$/i) ||
    doc.file_url?.match(/\.(png|jpe?g|webp|gif|bmp)$/i);

  const fileUrl = doc.file_url ? getFileUrl(doc.file_url) : '';

  const handleCopyChunk = (chunkId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedChunkId(chunkId);
    setTimeout(() => setCopiedChunkId(null), 2000);
  };

  const filteredChunks = chunks.filter((c) =>
    (c.content || '').toLowerCase().includes(chunkSearch.toLowerCase())
  );

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 lg:p-6 bg-slate-950/20 dark:bg-black/35 backdrop-blur-md bg-ambient-mesh animate-fade-in">
      {/* Full-bleed ambient lighting overlay extending across top navbar and entire viewport */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-500/15 via-transparent to-purple-500/15 pointer-events-none" />

      {/* Transparent click-outside backdrop */}
      <div className="absolute inset-0 -z-10 cursor-pointer" onClick={onClose} />

      {/* Popped Document Modal Card */}
      <div
        className={`relative w-full flex flex-col glass-panel-elevated bg-white/95 dark:bg-[#070b12]/95 backdrop-blur-2xl border border-white/70 dark:border-white/20 shadow-[0_25px_80px_-10px_rgba(0,0,0,0.45),0_0_60px_-15px_rgba(56,189,248,0.35)] ring-1 ring-black/10 dark:ring-white/10 overflow-hidden transition-[max-width,height,border-radius] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[max-width,height] animate-slide-up ${
          isFullscreen
            ? 'h-[98dvh] max-w-[98vw] rounded-2xl sm:rounded-3xl'
            : 'h-[85vh] sm:h-[86vh] max-w-3xl lg:max-w-4xl rounded-3xl'
        }`}
      >
        {/* Top Header Bar */}
        <div className="p-3 sm:px-5 border-b border-slate-200/80 dark:border-white/[0.1] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white/80 dark:bg-white/[0.03] backdrop-blur-md shrink-0">
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
                    {doc.title || 'Document Preview'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30 shrink-0">
                    {doc.category || 'General'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[180px] xs:max-w-xs">
                  {doc.filename || 'file'} • {chunks.length} chunks
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:hidden">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded-xl glass-badge text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                title={isFullscreen ? 'Minimize' : 'Maximize'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl glass-badge text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab Switcher & Action Controls */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
            <div className="flex flex-wrap items-center p-1 rounded-2xl glass-input border-slate-200 dark:border-white/[0.08] gap-1">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                  activeTab === 'preview'
                    ? 'bg-sky-500/15 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/35 dark:border-sky-500/40 shadow-sm dark:shadow-glow-cyan'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                File
              </button>
              <button
                onClick={() => setActiveTab('chunks')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all flex items-center gap-1 ${
                  activeTab === 'chunks'
                    ? 'bg-sky-500/15 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/35 dark:border-sky-500/40 shadow-sm dark:shadow-glow-cyan'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Chunks ({chunks.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('metadata')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                  activeTab === 'metadata'
                    ? 'bg-sky-500/15 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/35 dark:border-sky-500/40 shadow-sm dark:shadow-glow-cyan'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Metadata
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 sm:p-2 rounded-xl glass-badge text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.08] transition-all"
                title={isFullscreen ? 'Minimize to Standard Pop-out' : 'Maximize to Large View'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-xl glass-badge text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.08] transition-all"
                title="Close"
              >
                <X className="w-5 h-5" />
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
                    <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 relative overflow-hidden w-full h-full">
                      {/* Image Zoom Toolbar */}
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex items-center gap-1 p-1 sm:p-1.5 rounded-2xl glass-panel border border-slate-200 dark:border-white/[0.1]">
                        <button
                          onClick={() => setImageZoom((z) => Math.min(z + 0.25, 3))}
                          className="p-1 sm:p-1.5 rounded-xl glass-badge text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                          title="Zoom in"
                        >
                          <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => setImageZoom((z) => Math.max(z - 0.25, 0.5))}
                          className="p-1 sm:p-1.5 rounded-xl glass-badge text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                          title="Zoom out"
                        >
                          <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => setImageZoom(1)}
                          className="p-1 sm:p-1.5 rounded-xl glass-badge text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                          title="Reset zoom"
                        >
                          <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>

                      <img
                        src={fileUrl}
                        alt={doc.title}
                        style={{ transform: `scale(${imageZoom})` }}
                        className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl transition-transform duration-200"
                      />
                    </div>
                  ) : fileUrl ? (
                    <div className="relative w-full h-full flex-1 overflow-hidden bg-white dark:bg-[#070b12] min-w-0 min-h-0">
                      <iframe
                        src={`${fileUrl}#toolbar=0`}
                        className="w-full h-full border-0 bg-white dark:bg-[#070b12] block"
                        title={doc.title}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 space-y-2 p-4 text-center">
                      <FileText className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                      <p className="text-xs">Document file preview is stored in PostgreSQL database.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: VECTOR CHUNKS EXPLORER */}
              {activeTab === 'chunks' && (
                <div className="h-full flex flex-col p-3 sm:p-5 space-y-3 sm:space-y-4 overflow-hidden">
                  {/* Chunk Search Bar */}
                  <div className="relative max-w-md w-full">
                    <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search text within chunks..."
                      value={chunkSearch}
                      onChange={(e) => setChunkSearch(e.target.value)}
                      className="w-full glass-input rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400"
                    />
                  </div>

                  {/* Chunk Cards Stream */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 sm:space-y-3 pr-1 no-scrollbar">
                    {filteredChunks.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-xs">
                        No vector chunks match your search query.
                      </div>
                    ) : (
                      filteredChunks.map((chunk, idx) => (
                        <div
                          key={chunk.id || idx}
                          className="glass-card p-3.5 sm:p-4 rounded-2xl flex flex-col gap-2 border-slate-200 dark:border-white/[0.08]"
                        >
                          <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                              <span className="font-mono font-bold text-sky-600 dark:text-sky-400 text-xs">
                                #{chunk.chunk_index !== undefined ? chunk.chunk_index + 1 : idx + 1}
                              </span>
                              {chunk.page_number && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
                                  Page {chunk.page_number}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                {(chunk.content || '').length} chars
                              </span>
                            </div>

                            <button
                              onClick={() => handleCopyChunk(chunk.id || idx, chunk.content)}
                              className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-300 transition-colors p-1 rounded hover:bg-black/5 dark:hover:bg-white/[0.08] shrink-0"
                            >
                              {copiedChunkId === (chunk.id || idx) ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>

                          <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-mono whitespace-pre-wrap bg-slate-50 dark:bg-black/40 p-3 rounded-xl border border-slate-200 dark:border-white/[0.04] break-words">
                            {chunk.content}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: METADATA */}
              {activeTab === 'metadata' && (
                <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-4 max-w-3xl no-scrollbar">
                  <div className="glass-card p-4 sm:p-6 rounded-3xl space-y-4 border-slate-200 dark:border-white/[0.1]">
                    <h4 className="font-display font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                      <span>Document & Vector Metadata</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                      <div className="space-y-1 p-3 rounded-2xl glass-input">
                        <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">Document ID</span>
                        <p className="font-mono text-slate-900 dark:text-white break-all text-[11px] sm:text-xs">{doc.id}</p>
                      </div>

                      <div className="space-y-1 p-3 rounded-2xl glass-input">
                        <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">Category</span>
                        <p className="font-bold text-sky-600 dark:text-sky-400">{doc.category}</p>
                      </div>

                      <div className="space-y-1 p-3 rounded-2xl glass-input">
                        <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">Vector Chunk Count</span>
                        <p className="font-mono text-slate-900 dark:text-white font-bold">{chunks.length} chunks</p>
                      </div>

                      <div className="space-y-1 p-3 rounded-2xl glass-input">
                        <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">File Size</span>
                        <p className="font-mono text-slate-900 dark:text-white">
                          {doc.file_size ? `${(doc.file_size / (1024 * 1024)).toFixed(2)} MB` : 'N/A'}
                        </p>
                      </div>

                      <div className="space-y-1 p-3 rounded-2xl glass-input">
                        <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">Embedding Model</span>
                        <p className="font-mono text-emerald-600 dark:text-emerald-400">text-embedding-004 (768-dim)</p>
                      </div>

                      <div className="space-y-1 p-3 rounded-2xl glass-input">
                        <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">Indexing Timestamp</span>
                        <p className="font-mono text-slate-900 dark:text-white">
                          {doc.created_at ? new Date(doc.created_at).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
