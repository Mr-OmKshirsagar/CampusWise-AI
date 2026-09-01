import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ScanText,
  FileUp,
  RotateCcw,
  Plus,
  ArrowRight,
  Layers,
  Database,
  ChevronDown,
  Check,
  BookOpen,
  Building2,
  CreditCard,
  CalendarCheck,
  Award,
  GraduationCap,
  RefreshCw,
  Search,
  CheckCircle,
} from 'lucide-react';
import { documentApi } from '../../services/api.js';
import GlassIcon from '../Common/GlassIcon.jsx';
import LiquidSegmentedControl from '../Common/LiquidSegmentedControl.jsx';
import { toast } from '../../store/toastStore.js';
import { useServerHealthStore } from '../../store/serverHealthStore.js';

const DOMAIN_CATEGORIES_CONFIG = [
  { id: 'General', label: 'General', icon: FileText, color: 'slate', badge: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30' },
  { id: 'Admissions', label: 'Admissions', icon: GraduationCap, color: 'emerald', badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
  { id: 'Academics', label: 'Academics', icon: BookOpen, color: 'cyan', badge: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30' },
  { id: 'Hostel', label: 'Hostel', icon: Building2, color: 'amber', badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' },
  { id: 'Fees', label: 'Fees', icon: CreditCard, color: 'purple', badge: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30' },
  { id: 'Exams', label: 'Exams', icon: CalendarCheck, color: 'rose', badge: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30' },
  { id: 'Placements', label: 'Placements', icon: Award, color: 'indigo', badge: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30' },
];

const INGESTION_MODE_OPTIONS = [
  { id: 'new', label: 'New File', icon: Plus, color: 'cyan' },
  { id: 'update', label: 'Update File', icon: RotateCcw, color: 'purple' },
];

const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.webp'];
const ALLOWED_MIMES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];

const getCleanFilename = (filename) => {
  if (!filename) return '';
  return filename.replace(/^\d+-\d+-/, '');
};

export default function FileDropzone({ onUploadSuccess, documents = [] }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [ingestionMode, setIngestionMode] = useState('new'); // 'new' | 'update'
  const [selectedReplaceDocId, setSelectedReplaceDocId] = useState(null);
  const [isReplaceDropdownOpen, setIsReplaceDropdownOpen] = useState(false);
  const [replaceSearch, setReplaceSearch] = useState('');
  const [listDropletStyle, setListDropletStyle] = useState({ top: 0, height: 0, opacity: 0 });

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [error, setError] = useState(null);
  const [successResult, setSuccessResult] = useState(null);
  const [isModeMorphing, setIsModeMorphing] = useState(false);
  const [pendingOfflineRetry, setPendingOfflineRetry] = useState(false);

  const isServerOnline = useServerHealthStore((state) => state.isServerOnline);

  const fileInputRef = useRef(null);
  const progressTimerRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const replaceDropdownRef = useRef(null);
  const listContainerRef = useRef(null);
  const prevIngestionModeRef = useRef(ingestionMode);

  // Trigger liquid morphing pulse when mode changes
  useEffect(() => {
    if (prevIngestionModeRef.current !== ingestionMode) {
      setIsModeMorphing(true);
      const timer = setTimeout(() => setIsModeMorphing(false), 550);
      prevIngestionModeRef.current = ingestionMode;
      return () => clearTimeout(timer);
    }
  }, [ingestionMode]);

  // Automatic Re-upload when backend comes back online while user is on this document page
  useEffect(() => {
    if (pendingOfflineRetry && isServerOnline && file && !isUploading && !successResult) {
      setPendingOfflineRetry(false);
      setError(null);
      toast.info(
        `Backend server reconnected! Resuming upload for "${title.trim() || file.name}"...`,
        'Auto-Resuming Upload',
        3500,
        'auto-upload-resuming'
      );
      performUpload({ isAutoRetry: true });
    }
  }, [isServerOnline, pendingOfflineRetry, file, isUploading, successResult]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
        setIsCategoryDropdownOpen(false);
      }
      if (replaceDropdownRef.current && !replaceDropdownRef.current.contains(e.target)) {
        setIsReplaceDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  const filteredReplaceDocs = useMemo(() => {
    return (documents || []).filter((d) => {
      const cleanName = (d.filename || '').replace(/^\d+-\d+-/, '');
      return (
        (d.title || '').toLowerCase().includes(replaceSearch.toLowerCase()) ||
        cleanName.toLowerCase().includes(replaceSearch.toLowerCase())
      );
    });
  }, [documents, replaceSearch]);

  // Track position of the selected document in the list for fluid liquid glass vertical sliding
  useEffect(() => {
    if (!listContainerRef.current || !selectedReplaceDocId || !isReplaceDropdownOpen) {
      setListDropletStyle((prev) => (prev.opacity === 0 ? prev : { ...prev, opacity: 0 }));
      return;
    }
    const container = listContainerRef.current;
    const activeBtn = container.querySelector(`[data-doc-id="${selectedReplaceDocId}"]`);
    if (activeBtn) {
      const newTop = activeBtn.offsetTop;
      const newHeight = activeBtn.offsetHeight;
      setListDropletStyle((prev) => {
        if (prev.top === newTop && prev.height === newHeight && prev.opacity === 1) return prev;
        return {
          top: newTop,
          height: newHeight,
          opacity: 1,
        };
      });
    } else {
      setListDropletStyle((prev) => (prev.opacity === 0 ? prev : { ...prev, opacity: 0 }));
    }
  }, [selectedReplaceDocId, isReplaceDropdownOpen, replaceSearch, documents]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (selectedFile) => {
    setError(null);
    setSuccessResult(null);
    setPendingOfflineRetry(false);

    const ext = '.' + selectedFile.name.split('.').pop().toLowerCase();
    const isMimeValid = ALLOWED_MIMES.includes(selectedFile.type);
    const isExtValid = ALLOWED_EXTENSIONS.includes(ext);

    if (!isMimeValid && !isExtValid) {
      setError('Invalid file format. Please upload official PDFs or document images (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (selectedFile.size > 15 * 1024 * 1024) {
      setError('File exceeds the 15MB limit. Please upload a smaller document.');
      return;
    }

    setFile(selectedFile);
    if (!title) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }
  };

  const performUpload = async ({ isAutoRetry = false } = {}) => {
    if (!file || isUploading) return;

    if (ingestionMode === 'update' && !selectedReplaceDocId) {
      setError('Please select an existing document to replace.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessResult(null);
    setUploadProgress(10);
    setUploadStage(
      isAutoRetry
        ? 'Reconnected! Re-submitting document payload...'
        : ingestionMode === 'update'
        ? 'Uploading replacement document payload to secure server...'
        : 'Uploading document payload to secure server...'
    );

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title.trim() || file.name);
    formData.append('category', category);
    if (ingestionMode === 'update' && selectedReplaceDocId) {
      formData.append('replaceDocumentId', selectedReplaceDocId);
    }

    try {
      // Connect to Real-time Backend Ingestion Event Stream
      const response = await documentApi.upload(
        formData,
        (stageEvent) => {
          if (stageEvent.progress !== undefined) {
            setUploadProgress(stageEvent.progress);
          }
          if (stageEvent.message) {
            setUploadStage(stageEvent.message);
          }
        },
        { silent: true }
      );

      setUploadProgress(100);
      setUploadStage(
        ingestionMode === 'update'
          ? 'Vector embeddings successfully re-indexed and document updated in pgvector!'
          : 'Vector embeddings successfully indexed into pgvector database!'
      );

      const createdDoc = response.document || response.data?.document || response.data || response || {};
      const chunkCount = response.chunk_count ?? response.chunks?.length ?? createdDoc.chunk_count ?? 0;
      const isUpdateOp = Boolean(response.isUpdate || response.data?.isUpdate || ingestionMode === 'update');

      setPendingOfflineRetry(false);

      setTimeout(() => {
        setSuccessResult({
          title: createdDoc.title || title || file.name,
          filename: createdDoc.filename || file.name,
          chunk_count: chunkCount,
          id: createdDoc.id,
          isUpdate: isUpdateOp,
        });

        if (onUploadSuccess) {
          onUploadSuccess(createdDoc);
        }
        setIsUploading(false);

        // Toast notify user about the successful upload / update
        if (isAutoRetry) {
          toast.success(
            `Document "${createdDoc.title || title || file.name}" was automatically uploaded & vectorized after reconnecting!`,
            'Auto-Upload Complete',
            5000,
            'auto-upload-success'
          );
        } else {
          toast.success(
            `Document "${createdDoc.title || title || file.name}" successfully ${isUpdateOp ? 'updated' : 'indexed'} into knowledge base!`,
            `${isUpdateOp ? 'Document Updated' : 'Document Ingested'}`,
            4500,
            'upload-success'
          );
        }
      }, 700);
    } catch (err) {
      console.error('Document upload failure:', err);

      const isOffline =
        !err.response ||
        err.code === 'ERR_NETWORK' ||
        err.code === 'ECONNABORTED' ||
        err.name === 'TypeError' ||
        [500, 502, 503, 504].includes(err.response?.status);

      const isUpdate = ingestionMode === 'update';
      const actionName = isUpdate ? 'update & re-index' : 'upload & index';

      const errorMsg = isOffline
        ? `Backend server is currently offline or unreachable. Failed to ${actionName} document "${title.trim() || file.name}". Will auto-upload as soon as the server reconnects.`
        : err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          `Failed to ${actionName} document.`;

      setError(errorMsg);
      setIsUploading(false);

      if (isOffline) {
        setPendingOfflineRetry(true);
        // Single unified toast notification with server offline synchronization
        useServerHealthStore.getState().setServerOffline(errorMsg, false);
      } else {
        setPendingOfflineRetry(false);
        toast.error(
          errorMsg,
          `${isUpdate ? 'Update' : 'Upload'} Failed`,
          5000,
          'upload-error'
        );
      }
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    performUpload({ isAutoRetry: false });
  };

  const handleResetForNextFile = () => {
    setFile(null);
    setTitle('');
    setCategory('General');
    setIngestionMode('new');
    setSelectedReplaceDocId(null);
    setIsReplaceDropdownOpen(false);
    setError(null);
    setPendingOfflineRetry(false);
    setSuccessResult(null);
    setUploadProgress(0);
    setUploadStage('');
  };

  const isImage = (filename) => filename?.match(/\.(png|jpe?g|webp)$/i);

  const selectedCategoryConfig =
    DOMAIN_CATEGORIES_CONFIG.find((c) => c.id === category) || DOMAIN_CATEGORIES_CONFIG[0];
  const SelectedCategoryIcon = selectedCategoryConfig.icon;

  const targetReplaceDoc = (documents || []).find((d) => d.id === selectedReplaceDocId);

  return (
    <div className="space-y-4">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelected(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {/* Main Drag-and-Drop Area with Elevated Liquid Glass Border and Organic Glow */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (!file && !isUploading) fileInputRef.current?.click();
        }}
        className={`relative glass-card p-6 sm:p-10 rounded-4xl text-center transition-all duration-500 cursor-pointer overflow-hidden border-2 select-none ${
          isDragging
            ? 'border-sky-500 bg-sky-500/[0.12] dark:bg-sky-500/[0.18] shadow-[0_0_40px_rgba(56,189,248,0.4)] scale-[1.01]'
            : successResult
            ? 'border-emerald-500/60 bg-emerald-500/[0.06] dark:bg-emerald-500/[0.1] shadow-liquid-md'
            : error
            ? 'border-rose-500/60 bg-rose-500/[0.06] dark:bg-rose-500/[0.1] shadow-liquid-md'
            : file
            ? 'border-sky-500/50 bg-sky-500/[0.04] dark:bg-white/[0.02] shadow-liquid-md'
            : 'border-dashed border-slate-300 dark:border-white/[0.16] hover:border-sky-500/60 dark:hover:border-sky-400/60 hover:bg-sky-500/[0.03] dark:hover:bg-white/[0.04]'
        }`}
      >
        {/* Top-down Specular Reflection Sheen */}
        <div className="absolute inset-x-8 top-0 h-1/3 bg-gradient-to-b from-white/40 to-transparent dark:from-white/15 rounded-full pointer-events-none" />

        {/* Dynamic Ambient Mesh Glow in Center of Dropzone */}
        <div
          className={`absolute inset-0 bg-gradient-to-tr transition-all duration-700 pointer-events-none ${
            isDragging
              ? 'from-sky-500/25 via-sky-400/10 to-transparent'
              : successResult
              ? 'from-emerald-500/20 via-teal-500/10 to-transparent'
              : error
              ? 'from-rose-500/20 via-pink-500/10 to-transparent'
              : 'from-sky-500/10 via-transparent to-purple-500/10'
          }`}
        />

        {/* ── STATE A: INGESTION SUCCESS VIEW ── */}
        {successResult ? (
          <div className="space-y-4 relative z-10 animate-scale-up">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-glow-emerald animate-badge-pulse">
                <CheckCircle2 className="w-9 h-9" />
              </div>
            </div>

            <div className="space-y-1.5 max-w-lg mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                <Sparkles className="w-3 h-3" />
                <span>
                  {successResult.isUpdate
                    ? 'Document Updated & Vector Re-Indexing Completed'
                    : 'Ingestion & Vector Indexing Completed'}
                </span>
              </div>
              <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {successResult.title || 'Document Processed'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center justify-center gap-2">
                <span>{getCleanFilename(successResult.filename)}</span>
                {successResult.chunk_count !== undefined && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Layers className="w-3 h-3" /> {successResult.chunk_count} Vector Chunks
                    </span>
                  </>
                )}
              </p>
            </div>

            {/* Action Buttons: Upload Next File */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetForNextFile}
                className="group relative px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-liquid-md dark:shadow-glow-emerald flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer overflow-hidden select-none"
              >
                <div className="absolute inset-x-2 top-0.5 h-1/2 bg-gradient-to-b from-white/60 to-transparent rounded-full pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity" />
                <Plus className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Upload Next File</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSuccessResult(null);
                  setFile(null);
                  setTitle('');
                }}
                className="group relative px-4 py-2.5 rounded-full glass-panel-elevated bg-white/80 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold shadow-liquid-sm border border-slate-200/90 dark:border-white/[0.12] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer overflow-hidden select-none"
              >
                <div className="absolute inset-x-2 top-0.5 h-1/2 bg-gradient-to-b from-white/60 to-transparent dark:from-white/30 rounded-full pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10">Dismiss Notice</span>
              </button>
            </div>
          </div>
        ) : (!file && error) ? (
          /* ── STATE B: INGESTION FAILURE / RETRY NOTIFIER VIEW (NO FILE) ── */
          <div className="space-y-4 relative z-10 animate-scale-up">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-3xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/40 shadow-liquid-md">
                <AlertCircle className="w-7 h-7" />
              </div>
            </div>

            <div className="space-y-1.5 max-w-lg mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                <span>Ingestion Failure</span>
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-rose-600 dark:text-rose-400">
                {error}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You can retry processing the current document or select a different institutional PDF/image.
              </p>
            </div>

            {/* Action Buttons: Retry Ingestion or Pick Another File */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpload(e);
                }}
                className="group relative px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold text-xs shadow-liquid-md flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer overflow-hidden select-none"
              >
                <div className="absolute inset-x-2 top-0.5 h-1/2 bg-gradient-to-b from-white/60 to-transparent rounded-full pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity" />
                <RotateCcw className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">Retry Ingestion</span>
              </button>

              <button
                type="button"
                onClick={handleResetForNextFile}
                className="group relative px-4 py-2.5 rounded-full glass-panel-elevated bg-white/80 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold shadow-liquid-sm border border-slate-200/90 dark:border-white/[0.12] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer overflow-hidden select-none"
              >
                <div className="absolute inset-x-2 top-0.5 h-1/2 bg-gradient-to-b from-white/60 to-transparent dark:from-white/30 rounded-full pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10">Select Another File</span>
              </button>
            </div>
          </div>
        ) : file ? (
          /* ── STATE C: FILE SELECTED PRE-UPLOAD STATE ── */
          <div className="space-y-3 relative z-10 animate-fade-in">
            <div className="flex justify-center">
              <GlassIcon
                icon={isImage(file.name) ? ImageIcon : FileText}
                variant={error ? 'rose' : isImage(file.name) ? 'emerald' : 'cyan'}
                size="md"
              />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm sm:text-base font-mono">
                {file.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'application/pdf'}
              </p>
            </div>
            {!isUploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold cursor-pointer inline-block pt-1"
              >
                Click or tap to choose a different file
              </button>
            )}
          </div>
        ) : (
          /* ── STATE D: EMPTY DEFAULT PROMPT ── */
          <div className="space-y-3 relative z-10">
            <div className="flex justify-center">
              <GlassIcon icon={UploadCloud} variant="cyan" size="md" />
            </div>

            <div>
              <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-base">
                Tap or drag and drop college circulars here
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">
                Official PDF documents or scanned notices up to 15MB
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {['PDF Handbook', 'Scanned (PNG/JPG)', 'Hostel Rules', 'Fee Schedule'].map(
                (badge) => (
                  <span
                    key={badge}
                    className="px-3 py-1 rounded-full text-[10px] font-semibold glass-badge text-slate-600 dark:text-slate-300 shadow-liquid-sm"
                  >
                    {badge}
                  </span>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Metadata Configuration Form & Liquid Progress Bar (Shown when a file is selected and not yet completed) */}
      {file && !successResult && (
        <form onSubmit={handleUpload} className="space-y-4 animate-slide-up">
          {/* ══════════════════════════════════════════════════════════════
              3-COLUMN METADATA GRID (RED SPACES 1, 2, 3)
             ══════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* 1. DOCUMENT TITLE INPUT (SPACE 1) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Document Title</label>
              <div className="relative group">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Academic Regulations Handbook 2025"
                  required
                  disabled={isUploading}
                  className="w-full h-[46px] rounded-3xl glass-panel-elevated bg-white/90 dark:bg-white/[0.04] border border-slate-300/80 dark:border-white/[0.14] hover:border-sky-500/50 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 px-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 backdrop-blur-2xl transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.12)] disabled:opacity-50"
                />
              </div>
            </div>

            {/* 2. CAMPUS DOMAIN CATEGORY CUSTOM LIQUID GLASS DROPDOWN (SPACE 2) */}
            <div className="space-y-1.5 relative" ref={categoryDropdownRef}>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Campus Domain Category</label>
              
              {/* Dropdown Trigger Button */}
              <button
                type="button"
                disabled={isUploading}
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="group relative w-full h-[46px] px-4 rounded-3xl glass-panel-elevated bg-white/90 dark:bg-white/[0.04] border border-slate-300/80 dark:border-white/[0.14] hover:border-sky-500/50 backdrop-blur-2xl transition-all duration-300 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.12)] active:scale-[0.98] cursor-pointer disabled:opacity-50 select-none overflow-hidden"
              >
                {/* Top-down Specular Reflection Sheen */}
                <div className="absolute inset-x-2 top-0.5 h-1/2 bg-gradient-to-b from-white/60 to-transparent dark:from-white/30 rounded-full pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-center gap-2.5 min-w-0 relative z-10">
                  <div className={`w-6 h-6 rounded-xl flex items-center justify-center border shadow-xs ${selectedCategoryConfig.badge}`}>
                    <SelectedCategoryIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {category}
                  </span>
                </div>

                <div className="flex items-center gap-1 relative z-10 text-slate-400 group-hover:text-sky-500 transition-colors">
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isCategoryDropdownOpen ? 'rotate-180 text-sky-500 dark:text-sky-400' : ''}`} />
                </div>
              </button>

              {/* Floating Liquid Glass Dropdown Menu with Spring Elastic Pop Effect */}
              {isCategoryDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-transparent cursor-pointer"
                    onClick={() => setIsCategoryDropdownOpen(false)}
                  />
                  <div
                    className="absolute top-full left-0 right-0 mt-2 z-50 p-2 rounded-3xl glass-panel-elevated bg-white/95 dark:bg-[#070b12]/95 backdrop-blur-3xl border border-slate-200/90 dark:border-white/[0.16] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5),0_0_35px_rgba(56,189,248,0.25)] animate-liquid-pop space-y-1 overflow-hidden"
                  >
                    {/* Top-edge specular reflection */}
                    <div className="absolute inset-x-4 top-0 h-1 bg-gradient-to-b from-white/80 to-transparent dark:from-white/40 rounded-full pointer-events-none" />

                    {/* Bottom Chromatic dispersion */}
                    <div className="absolute inset-x-6 bottom-0 h-[1.5px] bg-gradient-to-r from-pink-400/80 via-cyan-300/90 to-emerald-400/80 blur-[0.5px] rounded-full pointer-events-none opacity-80" />

                    {DOMAIN_CATEGORIES_CONFIG.map((item) => {
                      const isSelected = category === item.id;
                      const ItemIcon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setCategory(item.id);
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={`group/item relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-all duration-200 cursor-pointer select-none ${
                            isSelected
                              ? 'bg-sky-500/20 text-sky-700 dark:text-sky-200 font-bold border border-sky-500/40 shadow-liquid-sm'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/[0.08] hover:translate-x-1'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-6 h-6 rounded-xl flex items-center justify-center border shadow-xs ${item.badge}`}>
                              <ItemIcon className="w-3.5 h-3.5" />
                            </div>
                            <span className="truncate">{item.label}</span>
                          </div>

                          {isSelected && (
                            <Check className="w-4 h-4 text-sky-500 dark:text-sky-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* 3. INGESTION MODE WITH LIQUID GLASS SLIDING CONTROL (SPACE 3) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">File Ingestion Action</label>
              <LiquidSegmentedControl
                options={INGESTION_MODE_OPTIONS}
                value={ingestionMode}
                onChange={(newMode) => {
                  setIngestionMode(newMode);
                  if (newMode === 'update') {
                    if (!selectedReplaceDocId && documents.length > 0) {
                      const firstDoc = documents[0];
                      setSelectedReplaceDocId(firstDoc.id);
                      if (firstDoc.title) setTitle(firstDoc.title);
                      if (firstDoc.category) setCategory(firstDoc.category);
                    }
                  } else {
                    setSelectedReplaceDocId(null);
                  }
                }}
                className="w-full h-[46px] rounded-3xl"
              />
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              VOLUMETRIC LIQUID GLASS MAXIMIZING & MINIMIZING EXPANSION BOX
              (Fluid 700ms Momentum Curve + Bloom Inflation/Deflation)
             ══════════════════════════════════════════════════════════════ */}
          <div
            className={`grid transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              ingestionMode === 'update'
                ? 'grid-rows-[1fr] opacity-100 scale-100 translate-y-0 my-3'
                : 'grid-rows-[0fr] opacity-0 scale-[0.97] -translate-y-2 my-0 pointer-events-none'
            }`}
          >
            <div className="overflow-hidden min-h-0">
              <div
                ref={replaceDropdownRef}
                className={`rounded-3xl glass-panel-elevated border transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden shadow-liquid-sm ${
                  isReplaceDropdownOpen
                    ? 'p-4 sm:p-5 border-purple-400/60 dark:border-purple-500/50 bg-gradient-to-b from-purple-50/90 via-white/95 to-indigo-50/90 dark:from-purple-950/[0.25] dark:via-slate-900/[0.6] dark:to-indigo-950/[0.25] shadow-[0_12px_36px_-8px_rgba(147,51,234,0.2)]'
                    : 'p-4 border-purple-300/70 dark:border-purple-500/30 bg-purple-50/50 dark:bg-purple-950/[0.15]'
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2.5">
                  <span className="text-xs font-bold text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    Select Existing Document to Update & Replace:
                  </span>
                  {targetReplaceDoc && (
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-200 border border-purple-300/80 dark:border-purple-500/40 flex items-center gap-1.5 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                      Target: {targetReplaceDoc.chunk_count ?? 0} existing chunks will be re-vectorized
                    </span>
                  )}
                </div>

                {/* Target Document Interactive Trigger Bar */}
                <button
                  type="button"
                  onClick={() => setIsReplaceDropdownOpen(!isReplaceDropdownOpen)}
                  className={`group relative w-full h-[50px] px-4 rounded-2xl glass-panel-elevated bg-white/95 dark:bg-[#070b12]/95 border transition-all duration-300 flex items-center justify-between shadow-liquid-sm cursor-pointer select-none overflow-hidden ${
                    isReplaceDropdownOpen
                      ? 'border-purple-500/70 dark:border-purple-400/70 shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                      : 'border-purple-300/80 dark:border-purple-500/40 hover:border-purple-500/60'
                  }`}
                >
                  {/* Specular sheen */}
                  <div className="absolute inset-x-2 top-0.5 h-1/2 bg-gradient-to-b from-white/70 to-transparent dark:from-white/20 rounded-full pointer-events-none" />

                  <div className="flex items-center gap-3 min-w-0 relative z-10">
                    <GlassIcon icon={FileText} variant="purple" size="xs" />
                    <div className="min-w-0 text-left">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {targetReplaceDoc ? targetReplaceDoc.title || getCleanFilename(targetReplaceDoc.filename) : 'Select a document to replace...'}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                        {targetReplaceDoc ? `${getCleanFilename(targetReplaceDoc.filename)} • ${targetReplaceDoc.category || 'General'}` : 'Click to choose replacement file'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 relative z-10 text-purple-700 dark:text-purple-300 font-bold text-xs">
                    <span className="hidden sm:inline">
                      {isReplaceDropdownOpen ? 'Close List' : 'Change File'}
                    </span>
                    <div className={`w-6 h-6 rounded-full bg-purple-500/15 dark:bg-purple-500/20 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isReplaceDropdownOpen ? 'rotate-180 bg-purple-500/30' : ''}`}>
                      <ChevronDown className="w-3.5 h-3.5 text-purple-700 dark:text-purple-300" />
                    </div>
                  </div>
                </button>

                {/* Expanded Inline Liquid Glass Document Picker Drawer */}
                <div
                  className={`transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${
                    isReplaceDropdownOpen
                      ? 'max-h-[380px] opacity-100 mt-3 pt-3 border-t border-purple-300/60 dark:border-purple-500/30'
                      : 'max-h-0 opacity-0 mt-0 pt-0 pointer-events-none'
                  }`}
                >
                  {/* Search Input Bar */}
                  <div className="relative mb-2.5">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by document title or filename..."
                      value={replaceSearch}
                      onChange={(e) => setReplaceSearch(e.target.value)}
                      className="w-full h-10 glass-input rounded-2xl pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 border border-slate-300/80 dark:border-white/[0.1] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Scrollable Document List with Liquid Glass Sliding Droplet Indicator */}
                  <div
                    ref={listContainerRef}
                    className="relative overflow-y-auto max-h-56 space-y-1.5 pr-1 custom-scrollbar"
                  >
                    {/* Liquid Glass Vertical Sliding Droplet Indicator (600ms Momentum Spring) */}
                    <div
                      style={{
                        transform: `translateY(${listDropletStyle.top}px)`,
                        height: `${listDropletStyle.height}px`,
                        opacity: listDropletStyle.opacity,
                      }}
                      className="absolute left-0 right-1 rounded-2xl bg-gradient-to-r from-purple-100/95 via-indigo-50/95 to-purple-100/95 dark:from-purple-500/30 dark:via-cyber-500/20 dark:to-indigo-500/30 border border-purple-400/80 dark:border-purple-500/60 shadow-[0_4px_16px_rgba(147,51,234,0.18)] dark:shadow-[0_4px_20px_rgba(147,51,234,0.35)] backdrop-blur-xl pointer-events-none transition-all duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] z-0"
                    >
                      {/* Top Specular Sheen */}
                      <div className="absolute inset-x-3 top-0.5 h-1/2 bg-gradient-to-b from-white/60 to-transparent dark:from-white/25 rounded-full pointer-events-none" />
                      {/* Bottom Chromatic Caustic Rim */}
                      <div className="absolute inset-x-4 bottom-0 h-[1.5px] bg-gradient-to-r from-pink-400/80 via-purple-300/90 to-cyan-400/80 blur-[0.5px] rounded-full pointer-events-none opacity-80" />
                    </div>

                    {filteredReplaceDocs.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400 font-medium">
                        No matching indexed documents found.
                      </div>
                    ) : (
                      filteredReplaceDocs.map((doc) => {
                        const isTarget = selectedReplaceDocId === doc.id;
                        return (
                          <button
                            key={doc.id}
                            data-doc-id={doc.id}
                            type="button"
                            onClick={() => {
                              setSelectedReplaceDocId(doc.id);
                              if (doc.title) setTitle(doc.title);
                              if (doc.category) setCategory(doc.category);
                              setIsReplaceDropdownOpen(false);
                            }}
                            className={`group/item relative z-10 w-full flex items-center justify-between p-3 rounded-2xl text-xs transition-all duration-300 cursor-pointer select-none text-left overflow-hidden ${
                              isTarget
                                ? 'text-purple-950 dark:text-purple-100 font-bold'
                                : 'glass-panel-elevated bg-white/80 dark:bg-white/[0.03] text-slate-700 dark:text-slate-300 hover:bg-purple-50/50 dark:hover:bg-white/[0.08] hover:translate-x-1 border border-slate-200/70 dark:border-white/[0.06] hover:border-purple-300 dark:hover:border-purple-400/30'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 relative z-10">
                              <div className={`w-7 h-7 rounded-xl flex items-center justify-center border shadow-xs transition-colors ${
                                isTarget ? 'bg-purple-500/25 text-purple-700 dark:text-purple-300 border-purple-500/50' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                              }`}>
                                <FileText className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold truncate text-slate-900 dark:text-white text-xs">
                                  {doc.title || getCleanFilename(doc.filename)}
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate mt-0.5">
                                  {getCleanFilename(doc.filename)} • <span className="text-purple-600 dark:text-purple-400 font-semibold">{doc.category || 'General'}</span> • {doc.chunk_count ?? 0} vector chunks
                                </p>
                              </div>
                            </div>

                            <div className="relative z-10 shrink-0 ml-2">
                              {isTarget ? (
                                <div className="px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-sm animate-scale-up">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>Target</span>
                                </div>
                              ) : (
                                <span className="text-[10px] font-semibold text-slate-400 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                  Select
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              INLINE LIQUID GLASS OFFLINE / UPLOAD ERROR BANNER
             ══════════════════════════════════════════════════════════════ */}
          {error && (
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-rose-500/15 via-red-500/10 to-rose-500/15 dark:from-rose-950/40 dark:via-red-950/30 dark:to-rose-950/40 border border-rose-500/40 dark:border-rose-500/30 text-rose-800 dark:text-rose-200 shadow-liquid-sm backdrop-blur-2xl animate-slide-up space-y-2 relative overflow-hidden">
              {/* Specular sheen */}
              <div className="absolute inset-x-6 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent dark:from-white/10 rounded-full pointer-events-none" />

              <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30 shadow-xs">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-extrabold text-rose-900 dark:text-rose-100">
                        {error.includes('offline') || error.includes('unreachable')
                          ? 'Backend Server Offline / Inactive'
                          : 'Document Ingestion Failed'}
                      </span>
                      {pendingOfflineRetry ? (
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1.5 animate-pulse shadow-xs">
                          <RefreshCw className="w-3 h-3 animate-spin text-amber-600 dark:text-amber-400" />
                          Auto-Upload Armed
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                          Upload Failed
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-rose-700 dark:text-rose-300/90 leading-relaxed font-medium">
                      {error}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setPendingOfflineRetry(false);
                  }}
                  className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-200 text-xs font-bold px-2.5 py-1 rounded-full hover:bg-rose-500/15 transition-colors shrink-0 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              SMOOTH INCREASING LIQUID GLASS PROGRESS BAR (0 → 100%)
             ══════════════════════════════════════════════════════════════ */}
          {isUploading && (
            <div className="space-y-2.5 p-4 sm:p-5 rounded-3xl glass-panel-elevated border-sky-500/30 shadow-liquid-md dark:shadow-glow-blue animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 truncate">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-500 dark:text-sky-400 shrink-0" />
                  <span className="truncate">{uploadStage}</span>
                </span>
                <span className="font-mono font-extrabold text-sky-600 dark:text-sky-400 shrink-0 ml-2 text-sm">
                  {uploadProgress}%
                </span>
              </div>

              {/* Liquid Acrylic Track with Diagonal Sheen Beam Sweep */}
              <div className="w-full bg-slate-200/80 dark:bg-slate-900/80 rounded-full h-3 overflow-hidden border border-slate-300/60 dark:border-white/[0.08] p-0.5 relative shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 shadow-liquid-sm dark:shadow-glow-blue transition-all duration-300 ease-out relative overflow-hidden"
                  style={{ width: `${uploadProgress}%` }}
                >
                  {/* Diagonal liquid sheen sweep */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-liquid-sheen" />
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              SUBMIT BUTTON: INGEST NEW VS UPDATE EXISTING WITH LIQUID GLASS MORPHING ANIMATION
             ══════════════════════════════════════════════════════════════ */}
          <button
            type="submit"
            disabled={isUploading || (ingestionMode === 'update' && !selectedReplaceDocId)}
            className={`group relative w-full h-[52px] sm:h-[56px] rounded-3xl text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:opacity-50 hover:scale-[1.01] active:scale-[0.98] cursor-pointer overflow-hidden select-none ${
              isModeMorphing ? 'scale-[1.015]' : 'scale-100'
            } ${
              ingestionMode === 'update'
                ? 'shadow-[0_6px_28px_-4px_rgba(147,51,234,0.4)] hover:shadow-[0_8px_36px_-4px_rgba(147,51,234,0.55)]'
                : 'shadow-[0_6px_28px_-4px_rgba(14,165,233,0.35)] hover:shadow-[0_8px_36px_-4px_rgba(14,165,233,0.5)] dark:shadow-glow-blue'
            }`}
          >
            {/* 1. Ingest New Document Cyan/Sky Gradient Layer (Smooth 600ms Crossfade) */}
            <div
              className={`absolute inset-0 bg-gradient-to-r from-sky-500 via-electric-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 transition-opacity duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                ingestionMode === 'new' ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* 2. Update Document Royal Violet/Purple Gradient Layer (Smooth 600ms Crossfade) */}
            <div
              className={`absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-opacity duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                ingestionMode === 'update' ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* 3. Liquid Wave Ripple Sweep (Fires on mode switch) */}
            <div
              key={ingestionMode}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-liquid-sheen pointer-events-none"
            />

            {/* 4. Top-down Specular Reflection Sheen */}
            <div className="absolute inset-x-6 top-0.5 h-1/2 bg-gradient-to-b from-white/75 to-transparent rounded-full pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-300 z-10" />

            {/* 5. Bottom Chromatic Dispersion Rainbow Refraction Line */}
            <div
              className={`absolute inset-x-8 bottom-0 h-[1.5px] bg-gradient-to-r ${
                ingestionMode === 'update'
                  ? 'from-pink-400/90 via-purple-300/90 to-cyan-400/90'
                  : 'from-pink-400/90 via-cyan-300/90 to-emerald-400/90'
              } blur-[0.5px] rounded-full pointer-events-none opacity-0 group-hover:opacity-95 transition-all duration-600 z-10`}
            />

            {/* 6. Dynamic Icon & Label Content with Spring Pop Morphing */}
            {isUploading ? (
              <div className="relative z-20 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {ingestionMode === 'update'
                    ? 'Updating Document & Re-Vectorizing Passages...'
                    : 'Processing & Vectorizing Document...'}
                </span>
              </div>
            ) : (
              <div
                key={ingestionMode}
                className="relative z-20 flex items-center justify-center gap-2 animate-scale-up"
              >
                {ingestionMode === 'update' ? (
                  <>
                    <RotateCcw className="w-4 h-4 transition-transform duration-500 group-hover:rotate-180 animate-icon-pop" />
                    <span>Update & Re-Index Document into RAG Knowledge Base</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                ) : (
                  <>
                    <ScanText className="w-4 h-4 transition-transform duration-300 group-hover:scale-110 animate-icon-pop" />
                    <span>Ingest & Index Document into RAG Knowledge Base</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </div>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
