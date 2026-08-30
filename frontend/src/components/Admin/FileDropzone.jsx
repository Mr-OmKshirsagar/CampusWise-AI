import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2, Sparkles, ScanText, FileUp, Cpu } from 'lucide-react';
import { documentApi } from '../../services/api.js';

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
        setUploadStage('Document indexed into 768-dim vector space!');
        setSuccessResult(response.data);
        setIsUploading(false);
        setFile(null);
        setTitle('');
        if (onUploadSuccess) onUploadSuccess();
      }, 600);
    } catch (err) {
      setIsUploading(false);
      setUploadProgress(0);
      setError(err.response?.data?.error || err.message || 'Failed to process document.');
    }
  };

  return (
    <div className="glass-panel-elevated p-5 sm:p-7 rounded-3xl border border-white/[0.12] space-y-5 sm:space-y-6 shadow-glass-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-display font-bold text-base sm:text-xl text-white tracking-tight">
            Ingest College Circulars & Documents
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload institutional PDFs or scanned notice images to auto-chunk, embed, and index with Dual OCR
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <ScanText className="w-3.5 h-3.5" />
            Gemini Vision OCR
          </span>
          <span className="px-3 py-1 rounded-full text-[11px] font-mono text-sky-300 glass-badge">
            PDF, PNG, JPG, WEBP (&le; 15MB)
          </span>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-sky-400 bg-sky-500/15 scale-[1.01] shadow-glow-blue'
            : file
            ? 'border-emerald-500/50 bg-emerald-500/10'
            : 'border-white/[0.12] hover:border-sky-500/50 hover:bg-white/[0.04]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
        />

        <div className="flex flex-col items-center gap-3.5">
          <div className={`w-14 h-14 rounded-2xl glass-icon-box flex items-center justify-center ${file ? 'text-emerald-400 shadow-glow-emerald' : 'text-sky-400 shadow-glow-blue'}`}>
            {file ? (
              file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(file.name) ? (
                <ImageIcon className="w-7 h-7" />
              ) : (
                <FileText className="w-7 h-7" />
              )
            ) : (
              <FileUp className="w-7 h-7 animate-bounce" />
            )}
          </div>

          {file ? (
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md mx-auto">{file.name}</p>
              <p className="text-[11px] text-slate-400 font-mono">{(file.size / (1024 * 1024)).toFixed(2)} MB • Tap or drop another file to replace</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-bold text-slate-200">
                Click to browse file or drag official PDF / circular here
              </p>
              <p className="text-[11px] text-slate-400">Preserves original pages, tables, and OCR visual text</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Metadata Form */}
      {file && (
        <form onSubmit={handleUpload} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 tracking-wide">Document Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Academic Regulations & Exam Handbook 2026"
                required
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 tracking-wide">Institutional Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-white transition-all bg-[#090d16]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#090d16] text-slate-200">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-2 p-4 rounded-2xl glass-card border-sky-500/30 shadow-glow-blue">
              <div className="flex items-center justify-between text-xs">
                <span className="text-sky-300 font-bold flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                  {uploadStage}
                </span>
                <span className="font-mono text-white font-bold">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/[0.05]">
                <div
                  className="bg-gradient-to-r from-sky-500 via-electric-500 to-indigo-500 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_#38bdf8]"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => setFile(null)}
              disabled={isUploading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white glass-badge transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !title.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 via-electric-500 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-glow-blue transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing & Ingesting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Index Document into Vector Store</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 flex items-center gap-2.5 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Banner */}
      {successResult && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 flex items-start gap-3 shadow-glass-sm animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-white text-sm">Document successfully indexed!</p>
            <p className="text-slate-300 leading-relaxed">
              Processed <strong>{successResult.totalPages} pages</strong> into <strong>{successResult.totalChunks} semantic vector chunks</strong>. Students can now immediately query this knowledge in chat.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

