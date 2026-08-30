import React, { useState, useEffect } from 'react';
import { FileText, Trash2, Search, Filter, Layers, HardDrive, Calendar, User, Eye, ChevronLeft, ChevronRight, Sparkles, Image as ImageIcon } from 'lucide-react';
import { documentApi } from '../../services/api.js';

export default function DocumentTable({ documents = [], onDocumentDeleted, onSelectDocument }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const categories = ['All', ...new Set(documents.map((d) => d.category).filter(Boolean))];

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = (doc.title || '').toLowerCase().includes(search.toLowerCase()) ||
                          (doc.filename || '').toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || doc.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Reset to first page when search query or category filter changes
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
      Admissions: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      Academics: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      Hostel: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      Fees: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      Exams: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      Placements: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      General: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    };
    return map[category] || map.General;
  };

  return (
    <div className="glass-panel-elevated rounded-3xl border border-white/[0.12] overflow-hidden space-y-4 shadow-glass-lg">
      {/* Table Controls */}
      <div className="p-4 sm:p-5 border-b border-white/[0.08] flex flex-col sm:flex-row gap-3 items-center justify-between bg-white/[0.02]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search indexed knowledge documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 active:scale-95 ${
                selectedCategory === cat
                  ? 'bg-sky-500/20 text-sky-200 border border-sky-500/40 shadow-glow-blue scale-105'
                  : 'glass-badge text-slate-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#05070a]/70 text-slate-400 uppercase tracking-widest font-bold border-b border-white/[0.08] text-[10px]">
            <tr>
              <th className="px-6 py-4">Document Title</th>
              <th className="px-4 py-4">Category</th>
              <th className="px-4 py-4">Vector Chunks</th>
              <th className="px-4 py-4">File Size</th>
              <th className="px-4 py-4">Ingestion Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {paginatedDocs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">
                  <FileText className="w-9 h-9 mx-auto text-slate-500 mb-2 opacity-60" />
                  <p className="font-semibold text-sm">No documents match your query.</p>
                </td>
              </tr>
            ) : (
              paginatedDocs.map((doc) => {
                const isImage = doc.filename?.match(/\.(png|jpe?g|webp|gif|bmp)$/i);
                return (
                  <tr key={doc.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl glass-icon-box flex items-center justify-center ${isImage ? 'text-emerald-400' : 'text-sky-400'}`}>
                          {isImage ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <div
                          className="cursor-pointer"
                          onClick={() => onSelectDocument && onSelectDocument(doc.id)}
                        >
                          <p className="font-bold text-white group-hover:text-sky-300 transition-colors truncate max-w-[200px] sm:max-w-xs flex items-center gap-1.5 text-xs sm:text-sm">
                            <span>{doc.title}</span>
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">{doc.filename}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getCategoryColor(doc.category)}`}>
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="flex items-center gap-1.5 font-mono text-sky-400 font-bold">
                        <Layers className="w-3.5 h-3.5" />
                        {doc.chunk_count} chunks
                      </span>
                    </td>
                    <td className="px-4 py-4 font-mono text-slate-400">
                      {(doc.file_size / 1024).toFixed(1)} KB
                    </td>
                    <td className="px-4 py-4 text-slate-400 font-mono text-[11px]">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectDocument && onSelectDocument(doc.id)}
                          title="View Document (Preview Mode)"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-300 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 rounded-xl transition-all active:scale-95 shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id, doc.title)}
                          disabled={deletingId === doc.id}
                          title="Delete Document and Chunks"
                          className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Mobile Card List View */}
      <div className="md:hidden divide-y divide-white/[0.08]">
        {paginatedDocs.length === 0 ? (
          <div className="text-center py-10 px-4 text-slate-400">
            <FileText className="w-8 h-8 mx-auto text-slate-500 mb-2 opacity-60" />
            <p className="text-xs">No documents match your query.</p>
          </div>
        ) : (
          paginatedDocs.map((doc) => {
            const isImage = doc.filename?.match(/\.(png|jpe?g|webp|gif|bmp)$/i);
            return (
              <div key={doc.id} className="p-4 space-y-3 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-xl glass-icon-box flex items-center justify-center shrink-0 mt-0.5 ${isImage ? 'text-emerald-400' : 'text-sky-400'}`}>
                      {isImage ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <h4
                        onClick={() => onSelectDocument && onSelectDocument(doc.id)}
                        className="font-bold text-white text-xs truncate cursor-pointer hover:text-sky-300"
                      >
                        {doc.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono truncate">{doc.filename}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${getCategoryColor(doc.category)}`}>
                    {doc.category}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/[0.06]">
                  <span className="flex items-center gap-1 font-mono text-sky-400 font-bold">
                    <Layers className="w-3 h-3" />
                    {doc.chunk_count} chunks
                  </span>
                  <span className="font-mono">{(doc.file_size / 1024).toFixed(1)} KB</span>
                  <span className="font-mono">{new Date(doc.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => onSelectDocument && onSelectDocument(doc.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Document</span>
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id, doc.title)}
                    disabled={deletingId === doc.id}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info & Pagination Controls */}
      <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-white/[0.02] text-[11px] sm:text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-400">
          {filteredDocs.length > 0 ? (
            <span>
              Showing <strong className="text-white font-mono">{startIndex + 1}</strong> to <strong className="text-white font-mono">{endIndex}</strong> of <strong className="text-white font-mono">{filteredDocs.length}</strong> records
            </span>
          ) : (
            <span>0 documents found</span>
          )}
        </div>

        {/* Pagination Navigation */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5 self-center sm:self-auto">
            {/* Previous Page Button */}
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={validCurrentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl glass-badge text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                if (
                  totalPages > 7 &&
                  pageNum !== 1 &&
                  pageNum !== totalPages &&
                  Math.abs(pageNum - validCurrentPage) > 1
                ) {
                  if (pageNum === 2 || pageNum === totalPages - 1) {
                    return (
                      <span key={pageNum} className="px-1 text-slate-500 font-mono">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                const isActive = pageNum === validCurrentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`min-w-[32px] h-[32px] flex items-center justify-center rounded-xl text-xs font-mono font-bold transition-all active:scale-95 ${
                      isActive
                        ? 'bg-sky-500/20 text-sky-200 border border-sky-500/40 shadow-glow-blue scale-105'
                        : 'glass-badge text-slate-400 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Page Button */}
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={validCurrentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl glass-badge text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

