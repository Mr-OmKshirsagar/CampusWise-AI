import React, { useState, useRef } from 'react';
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
  Cpu,
  Layers,
  Check,
} from 'lucide-react';
import { documentApi } from '../../services/api.js';
import GlassIcon from '../Common/GlassIcon.jsx';

const CATEGORIES = [
  'General',
  'Admissions',
  'Academics',
  'Hostel',
  'Fees',
  'Exams',
  'Placements',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.webp'];
const ALLOWED_MIMES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];

export default function FileDropzone({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [error, setError] = useState(null);
  const [successResult, setSuccessResult] = useState(null);

  const fileInputRef = useRef(null);

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

  const handleUpload = async (e) => {
    e?.preventDefault();
    if (!file || isUploading) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(20);
    setUploadStage('Uploading document payload to secure server...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim() || file.name);
      formData.append('category', category);

      setUploadProgress(50);
      setUploadStage('Vision OCR / PDF text extraction & recursive semantic chunking...');

      const response = await documentApi.upload(formData, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 40) / progressEvent.total) + 10;
          setUploadProgress(percent);
        }
      });

      setUploadProgress(85);
      setUploadStage('Generating 768-dim embeddings & indexing in pgvector store...');

      setTimeout(() => {
        setUploadProgress(100);
        setUploadStage('Completed! Document successfully indexed into RAG memory.');
        setIsUploading(false);
        setSuccessResult(response.document);
        setFile(null);
        setTitle('');
        if (onUploadSuccess) onUploadSuccess(response.document);
      }, 600);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Document ingestion failed.');
      setIsUploading(false);
    }
  };

  const isImage = file && (file.type.startsWith('image/') || file.name.match(/\.(png|jpe?g|webp)$/i));

  return (
    <div className="glass-panel-elevated p-5 sm:p-7 rounded-3xl border border-white/[0.12] space-y-6 shadow-glass-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-white/[0.08]">
        <div>
          <h2 className="font-display text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-sky-400" />
            <span>Document Ingestion Dropzone</span>
          </h2>
          <p className="text-xs text-slate-400">
            Upload institutional PDFs or notices to extract, chunk, embed, and index into vector space.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-300 border border-sky-500/30">
          <ScanText className="w-3.5 h-3.5" />
          <span>Dual OCR Enabled</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 flex items-center gap-3 animate-slide-up">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {successResult && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 flex items-center justify-between gap-3 animate-slide-up">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">Document Successfully Indexed!</span>
              <span>
                "{successResult.title}" — {successResult.chunk_count || 0} vector chunks ready for retrieval.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Drag & Drop Visual Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-6 sm:p-10 text-center cursor-pointer transition-all duration-300 relative overflow-hidden group ${
          isDragging
            ? 'border-sky-400 bg-sky-500/10 scale-[1.01]'
            : file
            ? 'border-emerald-500/40 bg-emerald-950/20'
            : 'border-white/[0.15] hover:border-sky-500/50 hover:bg-white/[0.02]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          onChange={(e) => e.target.files && handleFileSelected(e.target.files[0])}
          className="hidden"
        />

        {file ? (
          <div className="flex flex-col items-center space-y-3">
            <GlassIcon
              icon={isImage ? ImageIcon : FileText}
              variant={isImage ? 'emerald' : 'cyan'}
              size="lg"
            />
            <div>
              <p className="font-bold text-white text-sm sm:text-base">{file.name}</p>
              <p className="text-xs text-slate-400">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'Document'}
              </p>
            </div>
            <span className="text-[11px] text-sky-400 font-semibold underline">
              Click or drag to replace file
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <GlassIcon icon={FileUp} variant="cyan" size="lg" />
            <div>
              <p className="font-bold text-white text-sm sm:text-base">
                Click to browse or drag and drop college circulars
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Official PDF documents or scanned notices up to 15MB
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
              {['PDF Handbook', 'Scanned Circular (PNG/JPG)', 'Hostel Rules', 'Fee Schedules'].map(
                (badge) => (
                  <span
                    key={badge}
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold glass-badge text-slate-300"
                  >
                    {badge}
                  </span>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Metadata Configuration Inputs (shown when file is selected) */}
      {file && (
        <form onSubmit={handleUpload} className="space-y-4 animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Document Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Academic Regulations Handbook 2025"
                required
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Campus Domain Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-white bg-[#070b12]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#070b12] text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-2 p-4 rounded-2xl glass-input border-white/[0.1]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                  {uploadStage}
                </span>
                <span className="font-mono font-bold text-sky-400">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/[0.05]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 shadow-glow-blue transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 via-electric-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-blue flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing & Vectorizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Process Document & Upsert Vectors</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
