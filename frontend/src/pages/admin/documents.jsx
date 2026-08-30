import React, { useState, useEffect } from 'react';
import { FileText, Layers, HardDrive, RefreshCw, Sparkles, Shield, UploadCloud } from 'lucide-react';
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
    <div className="min-h-[calc(100vh-4rem)] p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Admin Portal
            </span>
            <span className="text-slate-500 text-[11px] sm:text-xs">• Vector Index Management</span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight mt-1">
            Institutional Document Ingestion
          </h1>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Documents</p>
              <p className="font-display text-2xl font-bold text-white">{stats.totalDocuments}</p>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Indexed Vector Chunks</p>
              <p className="font-display text-2xl font-bold text-white">{stats.totalChunks}</p>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Vector Storage Size</p>
              <p className="font-display text-2xl font-bold text-white">
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
        <h2 className="font-display text-lg font-bold text-white">Indexed College Records</h2>
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
