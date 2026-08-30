import React, { useState } from 'react';
import { FileText, Trash2, Search, Filter, Layers, HardDrive, Calendar, User, Eye } from 'lucide-react';
import { documentApi } from '../../services/api.js';

export default function DocumentTable({ documents = [], onDocumentDeleted, onSelectDocument }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [deletingId, setDeletingId] = useState(null);

  const categories = ['All', ...new Set(documents.map((d) => d.category).filter(Boolean))];

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = (doc.title || '').toLowerCase().includes(search.toLowerCase()) ||
                          (doc.filename || '').toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || doc.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

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
      Admissions: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      Academics: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      Hostel: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      Fees: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      Exams: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      Placements: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      General: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    };
    return map[category] || map.General;
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden space-y-4">
      {/* Table Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search indexed documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[10px]">
            <tr>
              <th className="px-5 py-3.5">Document</th>
              <th className="px-4 py-3.5">Category</th>
              <th className="px-4 py-3.5">Vector Chunks</th>
              <th className="px-4 py-3.5">File Size</th>
              <th className="px-4 py-3.5">Uploaded</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-500">
                  <FileText className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-60" />
                  <p>No documents found matching your criteria.</p>
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc) => {
                const isImage = doc.filename?.match(/\.(png|jpe?g|webp|gif|bmp)$/i);
                return (
                  <tr key={doc.id} className="hover:bg-slate-900/40 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isImage ? 'bg-emerald-500/10 text-emerald-400' : 'bg-sky-500/10 text-sky-400'}`}>
                          {isImage ? <Eye className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <div
                          className="cursor-pointer"
                          onClick={() => onSelectDocument && onSelectDocument(doc.id)}
                        >
                          <p className="font-semibold text-white group-hover:text-sky-300 transition-colors truncate max-w-[200px] sm:max-w-xs flex items-center gap-1.5">
                            <span>{doc.title}</span>
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">{doc.filename}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${getCategoryColor(doc.category)}`}>
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="flex items-center gap-1.5 font-mono text-sky-400 font-medium">
                        <Layers className="w-3.5 h-3.5" />
                        {doc.chunk_count} chunks
                      </span>
                    </td>
                    <td className="px-4 py-4 font-mono text-slate-400">
                      {(doc.file_size / 1024).toFixed(1)} KB
                    </td>
                    <td className="px-4 py-4 text-slate-400">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectDocument && onSelectDocument(doc.id)}
                          title="View Document (Preview Mode)"
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id, doc.title)}
                          disabled={deletingId === doc.id}
                          title="Delete Document and Chunks"
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg transition-colors disabled:opacity-50"
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

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-xs text-slate-500 flex items-center justify-between">
        <span>Showing {filteredDocs.length} of {documents.length} documents</span>
        <span>All chunks indexed with 768-dim embeddings</span>
      </div>
    </div>
  );
}
