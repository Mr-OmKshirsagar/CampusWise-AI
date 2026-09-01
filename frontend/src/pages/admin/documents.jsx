import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Layers,
  HardDrive,
  RefreshCw,
  Sparkles,
  Shield,
  UploadCloud,
  Database,
  Cpu,
  Plus,
  FolderOpen,
  Check,
  Flame,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { documentApi } from '../../services/api.js';
import FileDropzone from '../../components/Admin/FileDropzone.jsx';
import DocumentTable from '../../components/Admin/DocumentTable.jsx';
import DocumentViewerModal from '../../components/Admin/DocumentViewerModal.jsx';
import GlassIcon from '../../components/Common/GlassIcon.jsx';
import AnimatedCounter from '../../components/Common/AnimatedCounter.jsx';
import { toast } from '../../store/toastStore.js';
import { useServerHealthStore } from '../../store/serverHealthStore.js';

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshStatus, setRefreshStatus] = useState('idle'); // 'idle' | 'refreshing' | 'warming_up' | 'refreshed' | 'failed'
  const [retryCountdown, setRetryCountdown] = useState(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [newlyAddedId, setNewlyAddedId] = useState(null);

  const warmupTimerRef = useRef(null);
  const retryIntervalRef = useRef(null);
  const isRetryingRef = useRef(false);

  const clearAllTimers = () => {
    if (warmupTimerRef.current) {
      clearTimeout(warmupTimerRef.current);
      warmupTimerRef.current = null;
    }
    if (retryIntervalRef.current) {
      clearInterval(retryIntervalRef.current);
      retryIntervalRef.current = null;
    }
  };

  const startAutoRetryCountdown = (seconds = 6) => {
    clearAllTimers();
    setRetryCountdown(seconds);
    let currentSec = seconds;

    retryIntervalRef.current = setInterval(() => {
      currentSec -= 1;
      if (currentSec > 0) {
        setRetryCountdown(currentSec);
      } else {
        clearInterval(retryIntervalRef.current);
        retryIntervalRef.current = null;
        setRetryCountdown(null);
        isRetryingRef.current = true;
        loadData(true);
      }
    }, 1000);
  };

  const loadData = async (isManual = false) => {
    clearAllTimers();
    setRetryCountdown(null);
    setRefreshStatus('refreshing');
    if (!isManual) setIsLoading(true);

    const isRetryAttempt = isRetryingRef.current;
    let wasWarmedUp = false;

    // Condition A: Detect Render Free Tier Cold Start (Request pending > 2.5s)
    warmupTimerRef.current = setTimeout(() => {
      wasWarmedUp = true;
      setRefreshStatus('warming_up');
      useServerHealthStore.getState().setWarmingUp();
    }, 2500);

    try {
      const [docsRes, statsRes] = await Promise.all([
        documentApi.listAll(isRetryAttempt ? { silent: true } : {}),
        documentApi.getStats(isRetryAttempt ? { silent: true } : {}),
      ]);

      clearAllTimers();
      isRetryingRef.current = false;

      setDocuments(docsRes.documents || docsRes.data?.documents || []);
      setStats(statsRes.stats || statsRes.data?.stats || null);

      // Successfully loaded / refreshed
      setRefreshStatus('refreshed');
      useServerHealthStore.getState().setServerOnline();

      // Toast notification for manual refresh
      if (isManual) {
        toast.success('Knowledge Base synchronized successfully!', 'Documents Refreshed');
      }

      setTimeout(() => {
        setRefreshStatus('idle');
      }, 2400);
    } catch (err) {
      clearAllTimers();
      console.error('Failed to load documents:', err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        setRefreshStatus('failed');
        return;
      }

      // Condition B: Failed to connect / backend down
      setRefreshStatus('failed');
      useServerHealthStore.getState().setServerOffline(null, isRetryAttempt);

      if (isNetworkOrDown) {
        setRefreshStatus('failed');
        useServerHealthStore.getState().setServerOffline(null, isRetryAttempt);
        startAutoRetryCountdown(6);
      } else {
        // The server is online and responding (e.g. 401 Unauthorized or other app error)
        setRefreshStatus('idle');
        useServerHealthStore.getState().setServerOnline();
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial page load or browser refresh
    loadData(false);

    const handleServerOnline = () => {
      loadData(false);
    };

    window.addEventListener('campuswise:server-online', handleServerOnline);

    return () => {
      clearAllTimers();
      window.removeEventListener('campuswise:server-online', handleServerOnline);
    };
  }, []);

  const handleManualButtonClick = () => {
    if (refreshStatus === 'warming_up') return; // Do not interrupt Render cold start spin-up
    clearAllTimers();
    setRetryCountdown(null);
    isRetryingRef.current = refreshStatus === 'failed';
    loadData(true);
  };

  const handleUploadSuccess = (newDoc) => {
    if (newDoc?.id) {
      setNewlyAddedId(newDoc.id);
      setTimeout(() => setNewlyAddedId(null), 4000);
    }
    loadData(false);
  };

  const handleDeleteDocument = async (id, docName = 'document') => {
    if (!id) return;
    try {
      await documentApi.delete(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      toast.success(`Successfully deleted "${docName}" and indexed vector chunks.`, 'Document Deleted');
      loadData(false);
    } catch (err) {
      console.error('Failed to delete document:', err);
      toast.error(err.response?.data?.error || err.message || `Failed to delete "${docName}".`, 'Deletion Failed');
      throw err;
    }
  };

  const handleViewDocument = (id) => {
    setSelectedDocumentId(id);
  };

  return (
    <div className="min-h-[calc(100dvh-4rem)] w-full overflow-x-hidden p-2.5 xs:p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 bg-ambient-mesh selection:bg-sky-500 selection:text-white">
      {/* ══════════════════════════════════════════════════════════════
          1. HEADER & DYNAMIC SITUATIONAL REFRESH BUTTON
         ══════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-1 sm:pb-2">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/35 shadow-liquid-sm">
              Admin Ingestion Engine
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-mono">• pgvector Knowledge Base</span>
          </div>
          <h1 className="font-display text-2xl xs:text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Institutional Document Ingestion
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Upload institutional PDFs, parse structural text, compute 768-dim embeddings, and manage vector indices.
          </p>
        </div>

        {/* Dynamic State-Adaptive Refresh Button (Idle / Refreshing / Render Warming Up / Refreshed / Auto-Retrying) */}
        <button
          onClick={handleManualButtonClick}
          disabled={refreshStatus === 'refreshing' || refreshStatus === 'warming_up'}
          className={`flex items-center justify-center gap-2 px-4 xs:px-5 py-2.5 rounded-2xl transition-all w-full sm:w-auto self-stretch sm:self-auto active:scale-95 shadow-liquid-sm border text-xs font-bold cursor-pointer duration-300 ${
            refreshStatus === 'refreshed'
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.35)] scale-100 sm:scale-105'
              : refreshStatus === 'warming_up'
              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.35)] cursor-wait animate-pulse'
              : refreshStatus === 'failed'
              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.35)] hover:bg-rose-500/20'
              : refreshStatus === 'refreshing'
              ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/50 shadow-glow-blue cursor-wait'
              : 'glass-panel-elevated text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200/90 dark:border-white/[0.12] hover:scale-[1.02] sm:hover:scale-105'
          }`}
          title={
            refreshStatus === 'warming_up'
              ? 'Backend is spinning up from Render free-tier sleep. Please wait while it initializes...'
              : refreshStatus === 'failed'
              ? retryCountdown
                ? `Backend inactive. Auto-retrying in ${retryCountdown}s... Click to retry now.`
                : 'Failed to connect. Click to retry.'
              : 'Refresh institutional knowledge base'
          }
        >
          {refreshStatus === 'refreshed' ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500 animate-scale-up stroke-[2.5]" />
              <span>Knowledge Base Refreshed!</span>
            </>
          ) : refreshStatus === 'warming_up' ? (
            <>
              <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse stroke-[2.2]" />
              <span>Backend Warming Up (Render Sleep)...</span>
            </>
          ) : refreshStatus === 'failed' ? (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 animate-bounce stroke-[2.2]" />
              <span>
                {retryCountdown
                  ? `Failed (Retrying in ${retryCountdown}s...)`
                  : 'Failed to Refresh (Retry)'}
              </span>
            </>
          ) : refreshStatus === 'refreshing' ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-500" />
              <span>Refreshing Knowledge Base...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-sky-500" />
              <span>Refresh Knowledge Base</span>
            </>
          )}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          2. APPLE CONTROL CENTER METRIC WIDGETS WITH INCREASING NUMBER ANIMATION
         ══════════════════════════════════════════════════════════════ */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-5">
          {/* Tile 1: Total Documents */}
          <div className="relative group glass-panel-elevated p-4 xs:p-5 sm:p-6 rounded-3xl sm:rounded-4xl border border-sky-500/30 shadow-liquid-md dark:shadow-glass-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-liquid-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/15 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
            <div className="relative z-10 space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] xs:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Indexed Files
                </span>
                <GlassIcon icon={FileText} variant="cyan" size="xs" />
              </div>

              <div>
                <div className="font-display text-2xl xs:text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  <AnimatedCounter value={stats.totalDocuments || 0} duration={1200} />
                </div>
                <p className="text-[10px] xs:text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                  <span className="text-sky-600 dark:text-sky-400 font-bold">Institutional Circulars</span>
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between text-[10px] xs:text-[11px] font-mono">
                <span className="text-slate-500 dark:text-slate-400">Status:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Synchronized</span>
              </div>
            </div>
          </div>

          {/* Tile 2: Indexed Chunks */}
          <div className="relative group glass-panel-elevated p-4 xs:p-5 sm:p-6 rounded-3xl sm:rounded-4xl border border-purple-500/30 shadow-liquid-md dark:shadow-glass-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-liquid-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/15 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
            <div className="relative z-10 space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] xs:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Vector Chunks
                </span>
                <GlassIcon icon={Layers} variant="purple" size="xs" />
              </div>

              <div>
                <div className="font-display text-2xl xs:text-3xl sm:text-4xl font-extrabold text-purple-600 dark:text-purple-400 tracking-tight">
                  <AnimatedCounter value={stats.totalChunks || 0} duration={1300} />
                </div>
                <p className="text-[10px] xs:text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                  <span className="text-purple-600 dark:text-purple-400 font-bold">768-Dim Text Embeddings</span>
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between text-[10px] xs:text-[11px] font-mono">
                <span className="text-slate-500 dark:text-slate-400">Embedding:</span>
                <span className="text-purple-600 dark:text-purple-400 font-bold truncate">text-embedding-004</span>
              </div>
            </div>
          </div>

          {/* Tile 3: Storage Size */}
          <div className="relative group glass-panel-elevated p-4 xs:p-5 sm:p-6 rounded-3xl sm:rounded-4xl border border-emerald-500/30 shadow-liquid-md dark:shadow-glass-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-liquid-lg sm:col-span-2 lg:col-span-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
            <div className="relative z-10 space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] xs:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Storage Footprint
                </span>
                <GlassIcon icon={HardDrive} variant="emerald" size="xs" />
              </div>

              <div>
                <div className="font-display text-2xl xs:text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                  <AnimatedCounter
                    value={stats.totalStorageBytes ? stats.totalStorageBytes / (1024 * 1024) : 0}
                    decimals={2}
                    suffix=" MB"
                    duration={1400}
                  />
                </div>
                <p className="text-[10px] xs:text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">PostgreSQL Binary Store</span>
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between text-[10px] xs:text-[11px] font-mono">
                <span className="text-slate-500 dark:text-slate-400">Engine:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">pgvector Extension</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          3. UPLOAD DROPZONE
         ══════════════════════════════════════════════════════════════ */}
      <FileDropzone onUploadSuccess={handleUploadSuccess} documents={documents} />

      {/* ══════════════════════════════════════════════════════════════
          4. DOCUMENTS DATA TABLE
         ══════════════════════════════════════════════════════════════ */}
      <div className="space-y-3">
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
          <h2 className="font-display text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Database className="w-4 h-4 text-sky-500 dark:text-sky-400 shrink-0" />
            <span>Indexed Institutional Records</span>
          </h2>
          <span className="glass-badge px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-bold text-sky-600 dark:text-sky-400 shadow-liquid-sm self-start xs:self-auto">
            <AnimatedCounter value={documents.length} duration={800} /> Total Records
          </span>
        </div>
        <DocumentTable
          documents={documents}
          onDelete={handleDeleteDocument}
          onView={handleViewDocument}
          onDocumentDeleted={handleDeleteDocument}
          onSelectDocument={handleViewDocument}
          newlyAddedId={newlyAddedId}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          5. DOCUMENT VIEWER MODAL
         ══════════════════════════════════════════════════════════════ */}
      {selectedDocumentId && (
        <DocumentViewerModal
          documentId={selectedDocumentId}
          onClose={() => setSelectedDocumentId(null)}
        />
      )}
    </div>
  );
}
