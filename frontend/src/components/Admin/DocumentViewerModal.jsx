import React, { useState, useEffect } from 'react';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-[#030508]/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full h-[100dvh] sm:h-[92vh] max-w-6xl flex flex-col glass-panel-elevated rounded-none sm:rounded-3xl border-0 sm:border border-white/[0.12] shadow-2xl overflow-hidden bg-[#070b12]/95">
        {/* Top Header Bar */}
        <div className="p-3.5 sm:px-6 border-b border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/[0.02]">
          <div className="flex items-center justify-between gap-3 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <GlassIcon
                icon={isImage ? ImageIcon : FileText}
                variant={isImage ? 'emerald' : 'cyan'}
                size="sm"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-extrabold text-sm sm:text-base text-white truncate max-w-[200px] sm:max-w-md tracking-tight">
                    {doc.title || 'Document Preview'}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-300 border border-sky-500/30 shrink-0">
                    {doc.category || 'General'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono truncate max-w-xs sm:max-w-sm">
                  {doc.filename || 'institutional_file'} • {chunks.length} chunks indexed
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="sm:hidden p-2 rounded-xl glass-badge text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Switcher & Actions */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 rounded-2xl glass-input border-white/[0.08]">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'preview'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-glow-cyan'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Document File
              </button>
              <button
                onClick={() => setActiveTab('chunks')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'chunks'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-glow-cyan'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Vector Chunks ({chunks.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('metadata')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'metadata'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-glow-cyan'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Metadata
              </button>
            </div>

            <button
              onClick={onClose}
              className="hidden sm:flex p-2 rounded-xl glass-badge text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-hidden relative">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
              <p className="text-xs text-slate-400 font-mono">Loading document and vector chunks...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Info className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-rose-300">{error}</p>
            </div>
          ) : (
            <>
              {/* TAB 1: DOCUMENT PREVIEW */}
              {activeTab === 'preview' && (
                <div className="h-full flex flex-col bg-[#030508]/60">
                  {isImage ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-auto">
                      {/* Image Zoom Toolbar */}
                      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 p-1.5 rounded-2xl glass-panel border border-white/[0.1]">
                        <button
                          onClick={() => setImageZoom((z) => Math.min(z + 0.25, 3))}
                          className="p-1.5 rounded-xl glass-badge text-slate-300 hover:text-white"
                          title="Zoom in"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setImageZoom((z) => Math.max(z - 0.25, 0.5))}
                          className="p-1.5 rounded-xl glass-badge text-slate-300 hover:text-white"
                          title="Zoom out"
                        >
                          <ZoomOut className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setImageZoom(1)}
                          className="p-1.5 rounded-xl glass-badge text-slate-300 hover:text-white"
                          title="Reset zoom"
                        >
                          <RotateCcw className="w-4 h-4" />
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
                    <iframe
                      src={`${fileUrl}#toolbar=0`}
                      className="w-full h-full border-0 bg-white/[0.02]"
                      title={doc.title}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                      <FileText className="w-10 h-10 text-slate-500" />
                      <p className="text-xs">Document file preview is stored in PostgreSQL database.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: VECTOR CHUNKS EXPLORER */}
              {activeTab === 'chunks' && (
                <div className="h-full flex flex-col p-4 sm:p-6 space-y-4 overflow-hidden">
                  {/* Chunk Search Bar */}
                  <div className="relative max-w-md">
                    <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search text within chunks..."
                      value={chunkSearch}
                      onChange={(e) => setChunkSearch(e.target.value)}
                      className="w-full glass-input rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500"
                    />
                  </div>

                  {/* Chunk Cards Stream */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
                    {filteredChunks.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-xs">
                        No vector chunks match your search query.
                      </div>
                    ) : (
                      filteredChunks.map((chunk, idx) => (
                        <div
                          key={chunk.id || idx}
                          className="glass-card p-4 rounded-2xl space-y-2.5 border-white/[0.08]"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sky-400">
                                Chunk #{chunk.chunk_index !== undefined ? chunk.chunk_index + 1 : idx + 1}
                              </span>
                              {chunk.page_number && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-500/10 text-sky-300 border border-sky-500/20">
                                  Page {chunk.page_number}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-mono">
                                {(chunk.content || '').length} chars
                              </span>
                            </div>

                            <button
                              onClick={() => handleCopyChunk(chunk.id || idx, chunk.content)}
                              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-sky-300 transition-colors p-1 rounded hover:bg-white/[0.08]"
                            >
                              {copiedChunkId === (chunk.id || idx) ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-400 font-medium">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>

                          <p className="text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap bg-black/40 p-3.5 rounded-xl border border-white/[0.04]">
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
                <div className="h-full overflow-y-auto p-5 sm:p-8 space-y-6 max-w-3xl no-scrollbar">
                  <div className="glass-card p-6 rounded-3xl space-y-4 border-white/[0.1]">
                    <h4 className="font-display font-extrabold text-base text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-sky-400" />
                      <span>Document & Vector Metadata</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1 p-3 rounded-2xl glass-input">
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Document ID</span>
                        <p className="font-mono text-white break-all">{doc.id}</p>
                      </div>

                      <div className="space-y-1 p-3 rounded-2xl glass-input">
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Category</span>
                        <p className="font-bold text-sky-400">{doc.category}</p>
                      </div>

                      <div className="space-y-1 p-3 rounded-2xl glass-input">
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Vector Chunk Count</span>
                        <p className="font-mono text-white font-bold">{chunks.length} chunks</p>
                      </div>

                      <div className="space-y-1 p-3 rounded-2xl glass-input">
                        <span className="text-slate-400 text-[10px] uppercase font-bold">File Size</span>
                        <p className="font-mono text-white">
                          {doc.file_size ? `${(doc.file_size / (1024 * 1024)).toFixed(2)} MB` : 'N/A'}
                        </p>
                      </div>

                      <div className="space-y-1 p-3 rounded-2xl glass-input">
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Embedding Model</span>
                        <p className="font-mono text-emerald-400">text-embedding-004 (768-dim)</p>
                      </div>

                      <div className="space-y-1 p-3 rounded-2xl glass-input">
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Indexing Timestamp</span>
                        <p className="font-mono text-white">
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
}
