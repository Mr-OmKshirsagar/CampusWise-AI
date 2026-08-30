import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Trash2,
  Search,
  Filter,
  Layers,
  HardDrive,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { documentApi } from '../../services/api.js';
import GlassIcon from '../Common/GlassIcon.jsx';

export default function DocumentTable({ documents = [], onDocumentDeleted, onSelectDocument }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const categories = ['All', ...new Set(documents.map((d) => d.category).filter(Boolean))];

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        (doc.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (doc.filename || '').toLowerCase().includes(search.toLowerCase());
      const matchesCat = selectedCategory === 'All' || doc.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [documents, search, selectedCategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredDocs.length / pageSize));
  const validCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredDocs.length);
  const paginatedDocs = filteredDocs.slice(startIndex, startIndex + pageSize);

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This will cascade-delete all its vector chunks.`)) {
      return;
    }

    setDeletingId(id);
    try {
      await documentApi.delete(id);
      if (onDocumentDeleted) onDocumentDeleted(id);
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to delete document.');
    } finally {
      setDeletingId(null);
    }
  };

  const getCategoryColor = (category) => {
    const map = {
      Admissions: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      Academics: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
      Hostel: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
      Fees: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
      Exams: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
      Placements: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
      General: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
    };
    return map[category] || map.General;
  };

  const isImageFile = (doc) =>
    (doc.filename || '').match(/\.(png|jpe?g|webp)$/i) ||
    (doc.file_url || '').match(/\.(png|jpe?g|webp)$/i);

  return (
    <div className="glass-panel-elevated rounded-3xl border border-slate-200 dark:border-white/[0.12] overflow-hidden space-y-3 sm:space-y-4 shadow-sm dark:shadow-glass-lg transition-colors duration-300">
      {/* Table Top Controls & Search Bar (CSS Flexbox) */}
      <div className="p-3.5 sm:p-5 border-b border-slate-200/80 dark:border-white/[0.08] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search indexed documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input rounded-xl pl-10 pr-3.5 py-2 sm:py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 transition-all"
          />
        </div>

        {/* Category Pills (CSS Flexbox Wrapping without any scrollbars) */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs select-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all shrink-0 active:scale-95 ${
                selectedCategory === cat
                  ? 'bg-sky-500/15 dark:bg-sky-500/20 text-sky-700 dark:text-sky-200 border border-sky-500/35 dark:border-sky-500/40 shadow-sm dark:shadow-glow-cyan scale-105'
                  : 'glass-badge text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.08]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table View (>= 768px - CSS Grid / Table) */}
      <div className="hidden md:block">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-100/80 dark:bg-[#030508]/80 text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold border-b border-slate-200 dark:border-white/[0.08] text-[10px]">
            <tr>
              <th className="px-6 py-4">Document Title</th>
              <th className="px-4 py-4">Category</th>
              <th className="px-4 py-4">Vector Chunks</th>
              <th className="px-4 py-4">Size</th>
              <th className="px-4 py-4">Uploaded</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80 dark:divide-white/[0.06]">
            {paginatedDocs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                  No indexed documents found matching your criteria.
                </td>
              </tr>
            ) : (
              paginatedDocs.map((doc) => {
                const isImage = isImageFile(doc);
                return (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <GlassIcon
                          icon={isImage ? ImageIcon : FileText}
                          variant={isImage ? 'emerald' : 'cyan'}
                          size="xs"
                        />
                        <div className="min-w-0">
                          <button
                            onClick={() => onSelectDocument && onSelectDocument(doc.id)}
                            className="font-bold text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-300 transition-colors truncate block max-w-xs text-left"
                          >
                            {doc.title}
                          </button>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                            {doc.filename}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getCategoryColor(
                          doc.category
                        )}`}
                      >
                        {doc.category || 'General'}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 font-mono text-sky-600 dark:text-sky-400 font-bold">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{doc.chunk_count || 0} chunks</span>
                      </div>
                    </td>

                    <td className="px-4 py-4 font-mono text-slate-500 dark:text-slate-400">
                      {doc.file_size ? `${(doc.file_size / (1024 * 1024)).toFixed(2)} MB` : 'N/A'}
                    </td>

                    <td className="px-4 py-4 text-slate-500 dark:text-slate-400">
                      {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Recent'}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectDocument && onSelectDocument(doc.id)}
                          className="p-1.5 rounded-xl glass-badge text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-sky-500/40 transition-all"
                          title="Preview Document & Chunks"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id, doc.title)}
                          disabled={deletingId === doc.id}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                          title="Delete Document"
                        >
                          {deletingId === doc.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Responsive Cards (< 768px - CSS Grid / Flexbox) */}
      <div className="md:hidden p-3 grid grid-cols-1 gap-2.5">
        {paginatedDocs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No indexed documents found.
          </div>
        ) : (
          paginatedDocs.map((doc) => {
            const isImage = isImageFile(doc);
            return (
              <div
                key={doc.id}
                className="glass-card p-3.5 rounded-2xl flex flex-col gap-2.5 border-slate-200 dark:border-white/[0.08]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <GlassIcon
                      icon={isImage ? ImageIcon : FileText}
                      variant={isImage ? 'emerald' : 'cyan'}
                      size="xs"
                      className="shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">{doc.title}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{doc.filename}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border shrink-0 ${getCategoryColor(
                      doc.category
                    )}`}
                  >
                    {doc.category || 'General'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/80 dark:border-white/[0.06]">
                  <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">
                    {doc.chunk_count || 0} chunks
                  </span>
                  <span>{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : ''}</span>
                </div>

                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    onClick={() => onSelectDocument && onSelectDocument(doc.id)}
                    className="flex-1 py-2 rounded-xl glass-badge text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview & Chunks</span>
                  </button>

                  <button
                    onClick={() => handleDelete(doc.id, doc.title)}
                    disabled={deletingId === doc.id}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer (CSS Flexbox) */}
      <div className="p-3 sm:p-4 sm:px-6 border-t border-slate-200/80 dark:border-white/[0.08] flex flex-col xs:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-white/[0.01]">
        <div>
          Showing <span className="font-bold text-slate-900 dark:text-white">{filteredDocs.length > 0 ? startIndex + 1 : 0}</span> to{' '}
          <span className="font-bold text-slate-900 dark:text-white">{endIndex}</span> of{' '}
          <span className="font-bold text-slate-900 dark:text-white">{filteredDocs.length}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={validCurrentPage <= 1}
            className="p-1.5 rounded-xl glass-badge hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px] sm:text-xs">
            {validCurrentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={validCurrentPage >= totalPages}
            className="p-1.5 rounded-xl glass-badge hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
