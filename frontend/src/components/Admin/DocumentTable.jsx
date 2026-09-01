import React, { useState } from 'react';
import {
  FileText,
  Search,
  Eye,
  Trash2,
  Download,
  ExternalLink,
  Layers,
  Calendar,
  Image as ImageIcon,
  CheckCircle,
  FileCode,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import Pagination from '../Common/Pagination.jsx';
import GlassIcon from '../Common/GlassIcon.jsx';
import LiquidSegmentedControl from '../Common/LiquidSegmentedControl.jsx';
import ConfirmModal from '../Common/ConfirmModal.jsx';
import { toast } from '../../store/toastStore.js';

export default function DocumentTable({
  documents = [],
  onDelete,
  onView,
  onDocumentDeleted,
  onSelectDocument,
  newlyAddedId = null,
  isLoading = false,
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const pageSize = 8;

  const handleViewAction = (id) => {
    if (onView) onView(id);
    else if (onSelectDocument) onSelectDocument(id);
  };

  const handleDeleteAction = (id, docName) => {
    if (onDelete) onDelete(id, docName);
    else if (onDocumentDeleted) onDocumentDeleted(id, docName);
  };

  const handleCancelDelete = () => {
    if (documentToDelete) {
      const docName = documentToDelete.title || (documentToDelete.filename || '').replace(/^\d+-\d+-/, '');
      toast.cancel(`Deletion cancelled for "${docName}"`, 'Action Cancelled');
      setDocumentToDelete(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (documentToDelete) {
      const doc = documentToDelete;
      const docName = doc.title || (doc.filename || '').replace(/^\d+-\d+-/, '');
      setDocumentToDelete(null);
      try {
        await handleDeleteAction(doc.id, docName);
      } catch (err) {
        toast.error(`Failed to delete "${docName}": ${err.message || 'Error occurred'}`, 'Deletion Failed');
      }
    }
  };

  // 100% Unique colors for every single option without any duplicate shades
  const categoryOptions = [
    { id: 'All', label: 'All', color: 'lime' },         // 🍋 Electric Neon Lime (Distinct from all other categories)
    { id: 'Academics', label: 'Academics', color: 'cyan' }, // 💧 Sky Blue
    { id: 'General', label: 'General', color: 'slate' },    // ⚙️ Titanium Slate
    { id: 'Hostel', label: 'Hostel', color: 'amber' },      // 🍯 Warm Gold
    { id: 'Admissions', label: 'Admissions', color: 'emerald' }, // 🌿 Mint Emerald
    { id: 'Exams', label: 'Exams', color: 'rose' },         // 🌸 Rose Pink
    { id: 'Fees', label: 'Fees', color: 'purple' },         // 🔮 Cyber Violet
  ];

  // Filter documents by search term and selected category
  const filteredDocs = documents.filter((doc) => {
    const cleanName = (doc.filename || '').replace(/^\d+-\d+-/, '');
    const matchesSearch =
      (doc.title || '').toLowerCase().includes(search.toLowerCase()) ||
      cleanName.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredDocs.length / pageSize) || 1;
  const paginatedDocs = filteredDocs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getCategoryBadgeClass = (category) => {
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
    <div className="glass-panel-elevated rounded-4xl border border-slate-200/90 dark:border-white/[0.12] overflow-hidden space-y-3 sm:space-y-4 shadow-liquid-md dark:shadow-glass-lg transition-colors duration-300">
      {/* Table Top Controls & Search Bar with Sliding Liquid Category Filter */}
      <div className="p-4 sm:p-6 border-b border-slate-200/80 dark:border-white/[0.08] flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
        <div className="relative w-full xl:w-80 shrink-0">
          <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search indexed documents..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full glass-input rounded-3xl pl-11 pr-4 py-2.5 sm:py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 transition-all"
          />
        </div>

        {/* Apple WWDC25 Sliding Liquid Glass Category Switcher with Unique Theme Palette */}
        <div className="w-full max-w-full overflow-x-auto no-scrollbar py-1">
          <LiquidSegmentedControl
            options={categoryOptions}
            value={selectedCategory}
            onChange={(cat) => {
              setSelectedCategory(cat);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Desktop Table View (>= 768px) with Liquid Row Stagger & Downward Slide Animations */}
      <div className="hidden md:block px-3">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-100/70 dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold text-[10px] rounded-3xl">
            <tr>
              <th className="px-6 py-4 rounded-l-2xl">Document Title</th>
              <th className="px-4 py-4">Category</th>
              <th className="px-4 py-4">Vector Chunks</th>
              <th className="px-4 py-4">Size</th>
              <th className="px-4 py-4">Uploaded</th>
              <th className="px-6 py-4 text-right rounded-r-2xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 dark:divide-white/[0.04]">
            {paginatedDocs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                  No indexed documents found matching your criteria.
                </td>
              </tr>
            ) : (
              paginatedDocs.map((doc, index) => {
                const isImage = isImageFile(doc);
                const cleanName = (doc.filename || '').replace(/^\d+-\d+-/, '');
                const isNew = doc.id === newlyAddedId;

                return (
                  <tr
                    key={`${currentPage}-${doc.id}`}
                    style={{ animationDelay: isNew ? '0ms' : `${(index + 1) * 40}ms` }}
                    className={`${
                      isNew
                        ? 'animate-liquid-new-row bg-emerald-500/[0.09] dark:bg-emerald-500/[0.14] ring-1 ring-emerald-500/50 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]'
                        : newlyAddedId
                        ? 'animate-liquid-slide-down hover:bg-sky-500/[0.05] dark:hover:bg-white/[0.05]'
                        : 'animate-liquid-row hover:bg-sky-500/[0.05] dark:hover:bg-white/[0.05]'
                    } transition-all duration-300 group will-change-[transform,opacity]`}
                  >
                    {/* Document Title & File Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <GlassIcon
                            icon={isImage ? ImageIcon : FileText}
                            variant={isNew ? 'emerald' : isImage ? 'emerald' : 'cyan'}
                            size="xs"
                          />
                          {isNew && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          )}
                        </div>
                        <div className="min-w-0 max-w-[200px] lg:max-w-xs">
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-slate-900 dark:text-white truncate">
                              {doc.title || cleanName || 'Untitled Document'}
                            </p>
                            {isNew && (
                              <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-[9px] font-extrabold uppercase tracking-wider font-mono shrink-0">
                                NEW
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 truncate font-mono">
                            {cleanName}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${getCategoryBadgeClass(
                          doc.category
                        )}`}
                      >
                        {doc.category || 'General'}
                      </span>
                    </td>

                    {/* Vector Chunks */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 font-mono text-xs text-sky-600 dark:text-sky-400 font-bold">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{doc.chunk_count ?? 0} chunks</span>
                      </div>
                    </td>

                    {/* File Size */}
                    <td className="px-4 py-4 font-mono text-slate-500 dark:text-slate-400">
                      {doc.file_size
                        ? `${(doc.file_size / (1024 * 1024)).toFixed(2)} MB`
                        : 'N/A'}
                    </td>

                    {/* Upload Date */}
                    <td className="px-4 py-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {doc.created_at
                        ? new Date(doc.created_at).toLocaleDateString()
                        : 'N/A'}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleViewAction(doc.id)}
                          className="p-2 rounded-full glass-badge text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-500/10 active:scale-95 transition-all shadow-liquid-sm cursor-pointer"
                          title="Inspect Document & Vector Chunks"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDocumentToDelete(doc)}
                          className="p-2 rounded-full glass-badge text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 active:scale-95 transition-all shadow-liquid-sm cursor-pointer"
                          title="Delete from Vector Store"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Mobile Card View (< 768px) with Liquid Row Downward Slide Animations */}
      <div className="md:hidden px-4 space-y-3">
        {paginatedDocs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No indexed documents found.
          </div>
        ) : (
          paginatedDocs.map((doc, index) => {
            const isImage = isImageFile(doc);
            const cleanName = (doc.filename || '').replace(/^\d+-\d+-/, '');
            const isNew = doc.id === newlyAddedId;

            return (
              <div
                key={`${currentPage}-${doc.id}`}
                style={{ animationDelay: isNew ? '0ms' : `${(index + 1) * 40}ms` }}
                className={`${
                  isNew
                    ? 'animate-liquid-new-row ring-1 ring-emerald-500/50 bg-emerald-500/[0.09] dark:bg-emerald-500/[0.14] shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]'
                    : newlyAddedId
                    ? 'animate-liquid-slide-down'
                    : 'animate-liquid-row'
                } glass-card p-4 rounded-3xl space-y-3 border-slate-200/80 dark:border-white/[0.08] shadow-liquid-sm will-change-[transform,opacity]`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <GlassIcon
                      icon={isImage ? ImageIcon : FileText}
                      variant={isNew ? 'emerald' : isImage ? 'emerald' : 'cyan'}
                      size="xs"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {doc.title || cleanName || 'Untitled Document'}
                        </p>
                        {isNew && (
                          <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-[9px] font-extrabold uppercase tracking-wider font-mono shrink-0">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate font-mono">
                        {cleanName}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border shrink-0 ${getCategoryBadgeClass(
                      doc.category
                    )}`}
                  >
                    {doc.category || 'General'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-white/[0.06]">
                  <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-bold">
                    <Layers className="w-3 h-3" />
                    {doc.chunk_count ?? 0} chunks
                  </span>
                  <span>
                    {doc.file_size
                      ? `${(doc.file_size / (1024 * 1024)).toFixed(2)} MB`
                      : 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleViewAction(doc.id)}
                    className="flex-1 py-1.5 px-3 rounded-full glass-badge text-xs font-semibold text-sky-600 dark:text-sky-400 flex items-center justify-center gap-1.5 shadow-liquid-sm cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDocumentToDelete(doc)}
                    className="p-1.5 rounded-full glass-badge text-rose-500 hover:bg-rose-500/10 shadow-liquid-sm cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer with Sliding Liquid Control */}
      <div className="p-4 sm:px-6 border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-50/30 dark:bg-white/[0.01]">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredDocs.length}
          pageSize={pageSize}
        />
      </div>

      {/* Liquid Glass Confirmation Popup for Document Deletion */}
      <ConfirmModal
        isOpen={!!documentToDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Institutional Document"
        itemName={documentToDelete?.title || (documentToDelete?.filename || '').replace(/^\d+-\d+-/, '')}
        itemType="document"
        description="Are you sure you want to permanently delete this document? This action will remove the raw file, extracted passages, and 768-dim vector embeddings from pgvector storage."
        confirmText="Delete Document"
      />
    </div>
  );
}
