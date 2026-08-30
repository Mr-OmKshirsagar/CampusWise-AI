import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2, Sparkles, ScanText } from 'lucide-react';
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
    setUploadStage('Uploading PDF binary to server...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim() || file.name);
      formData.append('category', category);

      setUploadProgress(50);
      setUploadStage('Extracting pages & recursive semantic chunking...');

      const response = await documentApi.upload(formData, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 40) / progressEvent.total) + 10;
          setUploadProgress(percent);
        }
      });

      setUploadProgress(85);
      setUploadStage('Generating 768-dim embeddings & indexing in vector store...');

      setTimeout(() => {
        setUploadProgress(100);
        setUploadStage('Document indexed successfully!');
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
    <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-display font-bold text-base sm:text-lg text-white">Ingest College Documents & Photos</h3>
          <p className="text-xs text-slate-400">Upload official PDFs, circulars, or scanned document photos to chunk, embed, and index with OCR</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ScanText className="w-3.5 h-3.5" />
            OCR Active
          </span>
          <span className="px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            PDF, PNG, JPG, WEBP (Max 15MB)
          </span>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-5 sm:p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-sky-400 bg-sky-500/10 scale-[1.01]'
            : file
            ? 'border-emerald-500/50 bg-emerald-500/5'
            : 'border-slate-800 hover:border-sky-500/40 hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
        />

        <div className="flex flex-col items-center gap-3">
          <div className={`p-3 sm:p-3.5 rounded-2xl ${file ? 'bg-emerald-500/20 text-emerald-400' : 'bg-sky-500/10 text-sky-400'}`}>
            {file ? (
              file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(file.name) ? (
                <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8" />
              ) : (
                <FileText className="w-6 h-6 sm:w-8 sm:h-8" />
              )
            ) : (
              <UploadCloud className="w-6 h-6 sm:w-8 sm:h-8" />
            )}
          </div>

          {file ? (
            <div>
              <p className="text-xs sm:text-sm font-semibold text-white truncate max-w-xs">{file.name}</p>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB • Tap or drop to replace</p>
            </div>
          ) : (
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-200">
                Tap to choose file or drop official PDF / photo here
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Supports PDF documents and scanned images (PNG, JPG, WEBP)</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Metadata Form */}
      {file && (
        <form onSubmit={handleUpload} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Document Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Academic Calendar 2026-2027"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Institutional Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-2 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-sky-300 font-medium flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                  {uploadStage}
                </span>
                <span className="font-mono text-slate-400 font-bold">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-sky-500 to-campus-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setFile(null)}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !title.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-campus-600 hover:from-sky-500 hover:to-campus-500 text-white font-medium text-xs shadow-lg shadow-sky-600/25 transition-all disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing & Indexing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Index Document</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Banner */}
      {successResult && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-white">Document successfully indexed!</p>
            <p className="mt-1 text-slate-300">
              Processed <strong>{successResult.totalPages} pages</strong> into <strong>{successResult.totalChunks} semantic vector chunks</strong>. Students can now immediately query this knowledge in chat.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
