import React, { useState, useEffect } from 'react';
import { FileText, Layers, HardDrive, RefreshCw, Sparkles, Shield, UploadCloud, Database, Cpu } from 'lucide-react';
import { documentApi } from '../../services/api.js';
import FileDropzone from '../../components/Admin/FileDropzone.jsx';
import DocumentTable from '../../components/Admin/DocumentTable.jsx';
import DocumentViewerModal from '../../components/Admin/DocumentViewerModal.jsx';

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [docsRes, statsRes] = await Promise.all([
        documentApi.listAll(),
        documentApi.getStats(),
      ]);
      setDocuments(docsRes.data.documents || []);
      setStats(statsRes.data.stats || null);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUploadSuccess = () => {
    loadData();
  };

  const handleDocumentDeleted = (deletedId) => {
    setDocuments((prev) => prev.filter((d) => d.id !== deletedId));
    loadData();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 bg-ambient-mesh selection:bg-sky-500 selection:text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Admin Portal
            </span>
            <span className="text-slate-400 text-xs font-mono">• Vector Index Knowledge Base</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Institutional Document Ingestion
          </h1>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card text-xs font-semibold text-slate-300 hover:text-white transition-all self-start sm:self-auto active:scale-95 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-sky-400' : 'text-sky-400'}`} />
          <span>Refresh Index</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          <div className="glass-card p-5 rounded-2xl flex items-center gap-4 border-white/[0.08] shadow-glass-sm">
            <div className="w-12 h-12 rounded-2xl glass-icon-box flex items-center justify-center text-sky-400 shadow-glow-blue">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Total Documents</p>
              <p className="font-display text-2xl sm:text-3xl font-extrabold text-white">{stats.totalDocuments}</p>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center gap-4 border-white/[0.08] shadow-glass-sm glass-card-purple">
            <div className="w-12 h-12 rounded-2xl glass-icon-box flex items-center justify-center text-purple-400 shadow-glow-purple">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Indexed Vector Chunks</p>
              <p className="font-display text-2xl sm:text-3xl font-extrabold text-white">{stats.totalChunks}</p>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center gap-4 border-white/[0.08] shadow-glass-sm glass-card-emerald">
            <div className="w-12 h-12 rounded-2xl glass-icon-box flex items-center justify-center text-emerald-400 shadow-glow-emerald">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Vector Storage Size</p>
              <p className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                {(stats.totalStorageBytes / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Dropzone */}
      <FileDropzone onUploadSuccess={handleUploadSuccess} />

      {/* Documents Data Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Database className="w-4 h-4 text-sky-400" />
            <span>Indexed Institutional Records</span>
          </h2>
          <span className="glass-badge px-2.5 py-1 rounded-full text-[10px] font-mono text-slate-400">
            {documents.length} Files
          </span>
        </div>
        <DocumentTable
          documents={documents}
          onDocumentDeleted={handleDocumentDeleted}
          onSelectDocument={setSelectedDocumentId}
        />
      </div>

      {/* Document View Mode Modal */}
      {selectedDocumentId && (
        <DocumentViewerModal
          documentId={selectedDocumentId}
          onClose={() => setSelectedDocumentId(null)}
        />
      )}
    </div>
  );
}

