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
} from 'lucide-react';
import { documentApi, getFileUrl } from '../../services/api.js';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-[#05070a]/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full h-[100dvh] sm:h-[92vh] max-w-6xl flex flex-col glass-panel-elevated rounded-none sm:rounded-3xl border-0 sm:border border-white/[0.12] shadow-2xl overflow-hidden bg-[#090d16]/95">
        {/* Top Header Bar */}
        <div className="p-3.5 sm:px-6 border-b border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/[0.02]">
          <div className="flex items-center justify-between gap-3 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-2xl glass-icon-box flex items-center justify-center shrink-0 ${isImage ? 'text-emerald-400 shadow-glow-emerald' : 'text-sky-400 shadow-glow-blue'}`}>
                {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-extrabold text-sm sm:text-base text-white truncate max-w-[200px] sm:max-w-md tracking-tight">
                    {doc.title || 'Document Preview'}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-300 border border-sky-500/30 shrink-0">
                    {doc.category || 'General'}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400 truncate max-w-xs sm:max-w-lg mt-0.5 font-mono">
                  {doc.filename} • {doc.chunk_count || chunks.length} Vector Chunks
                </p>
              </div>
            </div>

            {/* Mobile Close Button in Header */}
            <button
              onClick={onClose}
              title="Close modal"
              className="sm:hidden p-2 rounded-xl glass-badge text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons & Tabs */}
          <div className="flex items-center justify-between sm:justify-end gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {/* View Mode Tabs */}
            <div className="flex items-center glass-panel p-1 rounded-2xl border border-white/[0.08] shrink-0">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'preview'
                    ? 'bg-sky-500/20 text-sky-200 border border-sky-500/40 shadow-glow-blue'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Original Document
              </button>
              <button
                onClick={() => setActiveTab('chunks')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'chunks'
                    ? 'bg-sky-500/20 text-sky-200 border border-sky-500/40 shadow-glow-blue'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Chunks ({chunks.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('metadata')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'metadata'
                    ? 'bg-sky-500/20 text-sky-200 border border-sky-500/40 shadow-glow-blue'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>Details</span>
              </button>
            </div>

            {/* External Open & Download & Desktop Close */}
            <div className="flex items-center gap-1.5 shrink-0">
              {fileUrl && (
                <>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open file in new tab"
                    className="p-2 rounded-xl glass-badge text-slate-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <a
                    href={fileUrl}
                    download={doc.filename || 'document'}
                    title="Download original file"
                    className="p-2 rounded-xl glass-badge text-slate-400 hover:text-white transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </>
              )}

              <button
                onClick={onClose}
                title="Close modal (Esc)"
                className="hidden sm:flex p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-all active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-hidden relative bg-[#05070a]/80">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-10 h-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin shadow-glow-blue" />
              <p className="text-xs font-medium">Loading document preview and vector chunks...</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-rose-400">
              <p className="text-sm font-semibold">{error}</p>
              <button
                onClick={onClose}
                className="mt-4 px-5 py-2.5 rounded-xl glass-card text-xs font-semibold text-white hover:bg-white/[0.08]"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* TAB 1: ORIGINAL DOCUMENT VIEW */}
              {activeTab === 'preview' && (
                <div className="w-full h-full flex flex-col">
                  {isImage ? (
                    // Image Viewer with Zoom Controls
                    <div className="w-full h-full flex flex-col relative bg-[#05070a]">
                      {/* Image Zoom Toolbar */}
                      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 glass-panel-elevated p-1.5 rounded-2xl border border-white/[0.12] shadow-glass-md">
                        <button
                          onClick={() => setImageZoom((prev) => Math.max(0.5, prev - 0.25))}
                          title="Zoom Out"
                          className="p-1.5 rounded-xl text-slate-400 hover:text-white glass-badge"
                        >
                          <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-[11px] font-mono text-slate-300 px-2 font-bold">
                          {Math.round(imageZoom * 100)}%
                        </span>
                        <button
                          onClick={() => setImageZoom((prev) => Math.min(3, prev + 0.25))}
                          title="Zoom In"
                          className="p-1.5 rounded-xl text-slate-400 hover:text-white glass-badge"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setImageZoom(1)}
                          title="Reset Zoom"
                          className="p-1.5 rounded-xl text-slate-400 hover:text-white glass-badge"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Image Canvas */}
                      <div className="flex-1 overflow-auto flex items-center justify-center p-6">
                        <img
                          src={fileUrl}
                          alt={doc.title}
                          style={{ transform: `scale(${imageZoom})`, transformOrigin: 'center center' }}
                          className="max-w-full max-h-full object-contain rounded-2xl shadow-glass-lg border border-white/[0.12] transition-transform duration-200"
                        />
                      </div>
                    </div>
                  ) : (
                    // PDF Document Viewer
                    <div className="w-full h-full relative">
                      <iframe
                        src={`${fileUrl}#toolbar=1&navpanes=1`}
                        title={doc.title}
                        className="w-full h-full border-0 bg-[#090d16]"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SEMANTIC CHUNKS & OCR TRANSCRIPTS */}
              {activeTab === 'chunks' && (
                <div className="w-full h-full flex flex-col p-4 sm:p-6 overflow-hidden space-y-4">
                  {/* Search Bar */}
                  <div className="relative w-full">
                    <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search within extracted semantic chunks and OCR text..."
                      value={chunkSearch}
                      onChange={(e) => setChunkSearch(e.target.value)}
                      className="w-full glass-input rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 transition-all"
                    />
                  </div>

                  {/* Chunks List */}
                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 no-scrollbar">
                    {filteredChunks.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 text-xs">
                        No vector chunks found matching "{chunkSearch}".
                      </div>
                    ) : (
                      filteredChunks.map((chunk, idx) => (
                        <div
                          key={chunk.id || idx}
                          className="glass-card p-4 sm:p-5 rounded-2xl border border-white/[0.08] hover:border-sky-500/40 transition-all space-y-3"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                                Chunk #{chunk.chunk_index !== undefined ? chunk.chunk_index + 1 : idx + 1}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] glass-badge text-slate-300">
                                Page {chunk.page_number || 1}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                                {chunk.content.length} chars • ~{Math.round(chunk.content.length / 4)} tokens
                              </span>
                            </div>

                            <button
                              onClick={() => handleCopyChunk(chunk.id || idx, chunk.content)}
                              className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-semibold text-slate-300 hover:text-white glass-badge transition-all active:scale-95"
                            >
                              {copiedChunkId === (chunk.id || idx) ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-400 font-bold">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="p-3.5 rounded-xl glass-input font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-sky-500/30 selection:text-sky-200 border-white/[0.06]">
                            {chunk.content}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: METADATA & VECTOR DETAILS */}
              {activeTab === 'metadata' && (
                <div className="w-full h-full overflow-y-auto p-6 space-y-6 no-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Document Stats */}
                    <div className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-4 shadow-glass-sm">
                      <h4 className="font-display font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-sky-400" />
                        Document Overview
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-2 border-b border-white/[0.06]">
                          <span className="text-slate-400 font-semibold">Document ID:</span>
                          <span className="font-mono text-slate-200 truncate max-w-xs">{doc.id}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/[0.06]">
                          <span className="text-slate-400 font-semibold">Title:</span>
                          <span className="font-bold text-white truncate max-w-xs">{doc.title}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/[0.06]">
                          <span className="text-slate-400 font-semibold">Original Filename:</span>
                          <span className="font-mono text-slate-300 truncate max-w-xs">{doc.filename}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/[0.06]">
                          <span className="text-slate-400 font-semibold">Category:</span>
                          <span className="font-bold text-sky-400">{doc.category}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/[0.06]">
                          <span className="text-slate-400 font-semibold">File Size:</span>
                          <span className="font-mono text-slate-300">{(doc.file_size / 1024).toFixed(2)} KB ({doc.file_size} bytes)</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-slate-400 font-semibold">Uploaded At:</span>
                          <span className="text-slate-300 font-mono">{new Date(doc.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Vector Store Info */}
                    <div className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-4 shadow-glass-sm glass-card-purple">
                      <h4 className="font-display font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        Vector Store & RAG Pipeline
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-2 border-b border-white/[0.06]">
                          <span className="text-slate-400 font-semibold">Embedding Engine:</span>
                          <span className="font-mono text-purple-400 font-bold">gemini-embedding-001</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/[0.06]">
                          <span className="text-slate-400 font-semibold">Vector Dimensions:</span>
                          <span className="font-mono text-slate-200">768-dimensional float32</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/[0.06]">
                          <span className="text-slate-400 font-semibold">Vector Database:</span>
                          <span className="text-emerald-400 font-bold">PostgreSQL pgvector</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/[0.06]">
                          <span className="text-slate-400 font-semibold">Indexed Chunks:</span>
                          <span className="font-mono text-sky-400 font-bold">{chunks.length} chunks</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-slate-400 font-semibold">Distance Metric:</span>
                          <span className="font-mono text-slate-300">Cosine Distance (1 - &lt;=&gt;)</span>
                        </div>
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

