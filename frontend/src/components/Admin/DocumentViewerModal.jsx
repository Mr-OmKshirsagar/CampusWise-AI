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
import { documentApi } from '../../services/api.js';

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

  const fileUrl = doc.file_url
    ? doc.file_url.startsWith('http')
      ? doc.file_url
      : doc.file_url
    : '';

  const handleCopyChunk = (chunkId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedChunkId(chunkId);
    setTimeout(() => setCopiedChunkId(null), 2000);
  };

  const filteredChunks = chunks.filter((c) =>
    (c.content || '').toLowerCase().includes(chunkSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-6xl h-[92vh] flex flex-col glass-panel rounded-2xl border border-slate-800 shadow-2xl overflow-hidden bg-slate-950/95">
        {/* Top Header Bar */}
        <div className="p-4 sm:px-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2.5 rounded-xl ${isImage ? 'bg-emerald-500/10 text-emerald-400' : 'bg-sky-500/10 text-sky-400'}`}>
              {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base sm:text-lg text-white truncate max-w-md">
                  {doc.title || 'Document Preview'}
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  {doc.category || 'General'}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-400 bg-slate-800/60 border border-slate-700/60">
                  {isImage ? 'IMAGE DOCUMENT' : 'PDF DOCUMENT'}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-lg mt-0.5 font-mono">
                {doc.filename} • {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : ''} • {doc.chunk_count || chunks.length} Indexed Chunks
              </p>
            </div>
          </div>

          {/* Action Buttons & Tabs */}
          <div className="flex items-center gap-2">
            {/* View Mode Tabs */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'preview'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Original View
              </button>
              <button
                onClick={() => setActiveTab('chunks')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'chunks'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Chunks & OCR ({chunks.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('metadata')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'metadata'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>Details</span>
              </button>
            </div>

            {/* External Open & Download */}
            {fileUrl && (
              <>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open file in new tab"
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href={fileUrl}
                  download={doc.filename || 'document'}
                  title="Download original file"
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </a>
              </>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              title="Close modal (Esc)"
              className="p-2 rounded-xl bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/30 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-hidden relative bg-slate-950">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">Loading document preview and semantic chunks...</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-red-400">
              <p className="text-sm font-semibold">{error}</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-xs text-white border border-slate-800 hover:bg-slate-800"
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
                    <div className="w-full h-full flex flex-col relative bg-slate-950">
                      {/* Image Zoom Toolbar */}
                      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-lg">
                        <button
                          onClick={() => setImageZoom((prev) => Math.max(0.5, prev - 0.25))}
                          title="Zoom Out"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                          <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-[11px] font-mono text-slate-300 px-2 font-bold">
                          {Math.round(imageZoom * 100)}%
                        </span>
                        <button
                          onClick={() => setImageZoom((prev) => Math.min(3, prev + 0.25))}
                          title="Zoom In"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setImageZoom(1)}
                          title="Reset Zoom"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Image Canvas */}
                      <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-slate-950/60">
                        <img
                          src={fileUrl}
                          alt={doc.title}
                          style={{ transform: `scale(${imageZoom})`, transformOrigin: 'center center' }}
                          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-slate-800 transition-transform duration-200"
                        />
                      </div>
                    </div>
                  ) : (
                    // PDF Document Viewer
                    <div className="w-full h-full relative">
                      <iframe
                        src={`${fileUrl}#toolbar=1&navpanes=1`}
                        title={doc.title}
                        className="w-full h-full border-0 bg-slate-900"
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
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search within extracted semantic chunks and OCR text..."
                      value={chunkSearch}
                      onChange={(e) => setChunkSearch(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {/* Chunks List */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {filteredChunks.length === 0 ? (
                      <div className="py-12 text-center text-slate-500 text-xs">
                        No vector chunks found matching "{chunkSearch}".
                      </div>
                    ) : (
                      filteredChunks.map((chunk, idx) => (
                        <div
                          key={chunk.id || idx}
                          className="glass-card p-4 rounded-xl border border-slate-800/80 bg-slate-900/50 hover:border-slate-700 transition-all space-y-2.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                Chunk #{chunk.chunk_index !== undefined ? chunk.chunk_index + 1 : idx + 1}
                              </span>
                              <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                                Page {chunk.page_number || 1}
                              </span>
                              <span className="text-[11px] text-slate-500 font-mono">
                                {chunk.content.length} characters • ~{Math.round(chunk.content.length / 4)} tokens
                              </span>
                            </div>

                            <button
                              onClick={() => handleCopyChunk(chunk.id || idx, chunk.content)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
                            >
                              {copiedChunkId === (chunk.id || idx) ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-900 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap selection:bg-sky-500/30 selection:text-sky-200">
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
                <div className="w-full h-full overflow-y-auto p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Document Stats */}
                    <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
                      <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-sky-400" />
                        Document Overview
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                          <span className="text-slate-400">Document ID:</span>
                          <span className="font-mono text-slate-200 truncate max-w-xs">{doc.id}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                          <span className="text-slate-400">Title:</span>
                          <span className="font-semibold text-white truncate max-w-xs">{doc.title}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                          <span className="text-slate-400">Original Filename:</span>
                          <span className="font-mono text-slate-300 truncate max-w-xs">{doc.filename}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                          <span className="text-slate-400">Category:</span>
                          <span className="font-medium text-sky-400">{doc.category}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                          <span className="text-slate-400">File Size:</span>
                          <span className="font-mono text-slate-300">{(doc.file_size / 1024).toFixed(2)} KB ({doc.file_size} bytes)</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-slate-400">Uploaded At:</span>
                          <span className="text-slate-300">{new Date(doc.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Vector Store Info */}
                    <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
                      <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        Vector Store & RAG Pipeline
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                          <span className="text-slate-400">Embedding Engine:</span>
                          <span className="font-mono text-purple-400">gemini-embedding-001</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                          <span className="text-slate-400">Vector Dimensions:</span>
                          <span className="font-mono text-slate-200">768-dimensional float32</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                          <span className="text-slate-400">Vector Database:</span>
                          <span className="text-emerald-400 font-semibold">PostgreSQL pgvector</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                          <span className="text-slate-400">Indexed Chunks:</span>
                          <span className="font-mono text-sky-400 font-bold">{chunks.length} chunks</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-slate-400">Distance Metric:</span>
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
