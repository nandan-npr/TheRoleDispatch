import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useJobs } from '../../context/JobContext';
import { FeedbackRecord, FeedbackStats, FeedbackType, FeedbackStatus } from '../../types';
import { feedbackService } from '../../services/feedbackService';
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Eye,
  Trash2,
  Mail,
  RefreshCw,
  X,
  AlertTriangle,
  ArrowUpDown,
  Calendar,
  CheckSquare,
  Square,
  Tag,
  Clock,
  ArrowLeft
} from 'lucide-react';

const FEEDBACK_TYPE_OPTIONS: ('ALL' | FeedbackType)[] = [
  'ALL',
  'General Feedback',
  'Job Listing Issue',
  'Website Issue',
  'Job Suggestion',
  'Feature Request',
  'Other'
];

interface AdminFeedbackViewProps {
  onBackToJobs?: () => void;
}

export const AdminFeedbackView: React.FC<AdminFeedbackViewProps> = ({ onBackToJobs }) => {
  const { setUnreadFeedbackCount, navigateToView } = useJobs();

  const [feedbackList, setFeedbackList] = useState<FeedbackRecord[]>([]);
  const [stats, setStats] = useState<FeedbackStats>({ total: 0, unread: 0, read: 0, thisWeek: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | FeedbackStatus>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | FeedbackType>('ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [viewingItem, setViewingItem] = useState<FeedbackRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'single' | 'bulk';
    item?: FeedbackRecord;
    ids?: string[];
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load feedback from API
  const loadFeedback = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await feedbackService.getAdminFeedback();
      if (res.success) {
        setFeedbackList(res.feedback);
        setStats(res.stats);
        setUnreadFeedbackCount(res.stats.unread);
      } else {
        setError(res.error || 'Failed to load feedback records.');
      }
    } catch {
      setError('Network communication failure while loading feedback.');
    } finally {
      setIsLoading(false);
    }
  }, [setUnreadFeedbackCount]);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  // Filtered & Sorted items
  const filteredFeedback = useMemo(() => {
    return feedbackList.filter(item => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesEmail = item.email.toLowerCase().includes(q);
        const matchesSubject = item.subject.toLowerCase().includes(q);
        const matchesMessage = item.message.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesSubject && !matchesMessage) {
          return false;
        }
      }

      // Status
      if (statusFilter !== 'ALL' && item.status !== statusFilter) {
        return false;
      }

      // Type
      if (typeFilter !== 'ALL' && item.type !== typeFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });
  }, [feedbackList, searchQuery, statusFilter, typeFilter, sortOrder]);

  // Handle opening feedback detail
  const handleOpenDetail = async (item: FeedbackRecord) => {
    setViewingItem(item);

    // Auto mark as read if unread
    if (item.status === 'unread') {
      try {
        const res = await feedbackService.updateStatus(item.id, 'read');
        if (res.success && res.item) {
          setFeedbackList(prev =>
            prev.map(f => (f.id === item.id ? { ...f, status: 'read' } : f))
          );
          if (res.stats) {
            setStats(res.stats);
            setUnreadFeedbackCount(res.stats.unread);
          }
          setViewingItem(res.item);
        }
      } catch (err) {
        console.error('Failed to auto-mark read:', err);
      }
    }
  };

  // Toggle read/unread status
  const handleToggleStatus = async (item: FeedbackRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newStatus: FeedbackStatus = item.status === 'unread' ? 'read' : 'unread';

    try {
      const res = await feedbackService.updateStatus(item.id, newStatus);
      if (res.success && res.item) {
        setFeedbackList(prev =>
          prev.map(f => (f.id === item.id ? res.item! : f))
        );
        if (res.stats) {
          setStats(res.stats);
          setUnreadFeedbackCount(res.stats.unread);
        }
        if (viewingItem && viewingItem.id === item.id) {
          setViewingItem(res.item);
        }
      }
    } catch {
      // silent
    }
  };

  // Confirm delete single
  const handleDeleteSingle = (item: FeedbackRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteTarget({ type: 'single', item });
  };

  // Confirm delete bulk
  const handleDeleteBulk = () => {
    if (selectedIds.length === 0) return;
    setDeleteTarget({ type: 'bulk', ids: selectedIds });
  };

  // Execute deletion
  const executeDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      if (deleteTarget.type === 'single' && deleteTarget.item) {
        const targetId = deleteTarget.item.id;
        const res = await feedbackService.deleteFeedback(targetId);
        if (res.success) {
          setFeedbackList(prev => prev.filter(f => f.id !== targetId));
          setSelectedIds(prev => prev.filter(id => id !== targetId));
          if (res.stats) {
            setStats(res.stats);
            setUnreadFeedbackCount(res.stats.unread);
          }
          if (viewingItem && viewingItem.id === targetId) {
            setViewingItem(null);
          }
        }
      } else if (deleteTarget.type === 'bulk' && deleteTarget.ids) {
        const targetIds = deleteTarget.ids;
        const res = await feedbackService.deleteMultiple(targetIds);
        if (res.success) {
          const idSet = new Set(targetIds);
          setFeedbackList(prev => prev.filter(f => !idSet.has(f.id)));
          setSelectedIds([]);
          if (res.stats) {
            setStats(res.stats);
            setUnreadFeedbackCount(res.stats.unread);
          }
          if (viewingItem && idSet.has(viewingItem.id)) {
            setViewingItem(null);
          }
        }
      }
    } catch {
      // error handled
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Checkbox helpers
  const isAllSelected =
    filteredFeedback.length > 0 &&
    filteredFeedback.every(item => selectedIds.includes(item.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredFeedback.map(item => item.id));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E7E2D9] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-[#7A1C28]/10 text-[#7A1C28] border border-[#7A1C28]/20 font-semibold">
              Editorial Communications
            </span>
            <span className="text-xs text-[#71717A] font-mono">Persistent Database</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#141416]">
            Feedback & Inquiries
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#52525B]">
            Manage messages and feedback submitted by visitors across the public publication.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onBackToJobs && (
            <button
              onClick={onBackToJobs}
              className="px-3.5 py-2 border border-[#E7E2D9] bg-[#FFFFFF] hover:bg-[#FAF8F5] text-xs font-semibold tracking-wider uppercase text-[#141416] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Job Postings</span>
            </button>
          )}

          <button
            onClick={loadFeedback}
            disabled={isLoading}
            className="px-3.5 py-2 border border-[#E7E2D9] bg-[#FFFFFF] hover:bg-[#FAF8F5] text-xs font-semibold tracking-wider uppercase text-[#141416] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-2xs"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary Cards: Total, Unread, Read, This Week */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 bg-[#FFFFFF] border border-[#E7E2D9] shadow-2xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">
            Total Messages
          </div>
          <div className="mt-2 text-3xl font-serif font-bold text-[#141416]">
            {stats.total}
          </div>
          <div className="mt-1 text-[11px] text-[#52525B]">Recorded submissions</div>
        </div>

        <div className="p-4 sm:p-5 bg-[#FFFFFF] border border-[#7A1C28]/30 shadow-2xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#7A1C28]">
            Unread
          </div>
          <div className="mt-2 text-3xl font-serif font-bold text-[#7A1C28]">
            {stats.unread}
          </div>
          <div className="mt-1 text-[11px] text-[#7A1C28]/80 font-medium">Awaiting editorial review</div>
        </div>

        <div className="p-4 sm:p-5 bg-[#FFFFFF] border border-emerald-200/80 shadow-2xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
            Read
          </div>
          <div className="mt-2 text-3xl font-serif font-bold text-emerald-700">
            {stats.read}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600/90">Reviewed correspondence</div>
        </div>

        <div className="p-4 sm:p-5 bg-[#FFFFFF] border border-amber-200/80 shadow-2xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
            This Week
          </div>
          <div className="mt-2 text-3xl font-serif font-bold text-amber-700">
            {stats.thisWeek}
          </div>
          <div className="mt-1 text-[11px] text-amber-600/90">Recent 7-day volume</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FFFFFF] border border-[#E7E2D9] p-4 space-y-3 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, subject, or message..."
              className="w-full pl-9 pr-3.5 py-2 bg-[#FAF8F5] border border-[#E7E2D9] text-xs text-[#141416] focus:outline-hidden focus:border-[#7A1C28] focus:bg-[#FFFFFF] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#141416]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as 'ALL' | FeedbackStatus)}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E2D9] text-xs text-[#141416] focus:outline-hidden focus:border-[#7A1C28] focus:bg-[#FFFFFF] transition-colors cursor-pointer"
            >
              <option value="ALL">All Statuses ({stats.total})</option>
              <option value="unread">Unread ({stats.unread})</option>
              <option value="read">Read ({stats.read})</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="md:col-span-3">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as 'ALL' | FeedbackType)}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E2D9] text-xs text-[#141416] focus:outline-hidden focus:border-[#7A1C28] focus:bg-[#FFFFFF] transition-colors cursor-pointer"
            >
              {FEEDBACK_TYPE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>
                  {opt === 'ALL' ? 'All Feedback Types' : opt}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div className="md:col-span-2">
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E2D9] text-xs text-[#141416] focus:outline-hidden focus:border-[#7A1C28] focus:bg-[#FFFFFF] transition-colors cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between pt-3 border-t border-[#E7E2D9] text-xs">
            <span className="font-semibold text-[#7A1C28]">
              {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={handleDeleteBulk}
              className="px-3 py-1.5 bg-rose-50 border border-rose-300 text-rose-800 font-semibold hover:bg-rose-100 uppercase tracking-wider text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-700" />
              <span>Delete Selected</span>
            </button>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Feedback List & Table */}
      {isLoading ? (
        <div className="bg-[#FFFFFF] border border-[#E7E2D9] p-12 text-center">
          <div className="w-6 h-6 border-2 border-[#7A1C28] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs uppercase font-mono tracking-widest text-[#71717A]">
            Loading feedback records...
          </p>
        </div>
      ) : filteredFeedback.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#E7E2D9] p-12 text-center shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF8F5] border border-[#E7E2D9] flex items-center justify-center mb-4">
            <MessageSquare className="w-6 h-6 text-[#71717A]" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#141416] mb-1">
            {feedbackList.length === 0 ? 'No feedback yet.' : 'No feedback matches the selected filters.'}
          </h3>
          <p className="text-xs text-[#52525B] max-w-md mx-auto leading-relaxed">
            {feedbackList.length === 0
              ? 'Messages submitted through the Contact & Feedback page will appear here automatically.'
              : 'Try clearing your search query or broadening status/type filters.'}
          </p>
          {feedbackList.length > 0 && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setTypeFilter('ALL');
              }}
              className="mt-4 px-4 py-2 border border-[#E7E2D9] text-xs font-semibold uppercase tracking-wider text-[#141416] hover:bg-[#FAF8F5] transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-[#FFFFFF] border border-[#E7E2D9] shadow-xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E7E2D9] text-[#71717A] uppercase tracking-wider text-[10px] font-semibold">
                  <th className="py-3 px-4 w-10">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="cursor-pointer text-[#71717A] hover:text-[#141416]"
                      title="Select all on current filter"
                    >
                      {isAllSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#7A1C28]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-3 w-24">Status</th>
                  <th className="py-3 px-4 w-44">Name & Email</th>
                  <th className="py-3 px-4 w-36">Type</th>
                  <th className="py-3 px-4">Subject & Excerpt</th>
                  <th className="py-3 px-4 w-40">Date</th>
                  <th className="py-3 px-4 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E2D9]">
                {filteredFeedback.map(item => {
                  const isSelected = selectedIds.includes(item.id);
                  const isUnread = item.status === 'unread';

                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleOpenDetail(item)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#7A1C28]/5'
                          : isUnread
                          ? 'bg-[#FFFFFF] hover:bg-[#FAF8F5] font-medium'
                          : 'bg-[#FAF8F5]/40 hover:bg-[#FAF8F5] text-[#52525B]'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4" onClick={e => toggleSelectOne(item.id, e)}>
                        <button type="button" className="cursor-pointer text-[#71717A] hover:text-[#141416]">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#7A1C28]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-3">
                        <button
                          type="button"
                          onClick={e => handleToggleStatus(item, e)}
                          className="cursor-pointer inline-flex items-center gap-1.5 group"
                          title={isUnread ? 'Mark as Read' : 'Mark as Unread'}
                        >
                          {isUnread ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7A1C28] bg-[#7A1C28]/10 px-2 py-0.5 rounded-full border border-[#7A1C28]/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#7A1C28]" />
                              Unread
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#71717A] bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                              Read
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className={`font-semibold ${isUnread ? 'text-[#141416]' : 'text-[#3F3F46]'}`}>
                          {item.name}
                        </div>
                        <a
                          href={`mailto:${item.email}?subject=Re: ${encodeURIComponent(item.subject)}`}
                          onClick={e => e.stopPropagation()}
                          className="text-[11px] text-[#71717A] hover:text-[#7A1C28] hover:underline flex items-center gap-1 mt-0.5"
                          title="Compose email reply"
                        >
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[130px]">{item.email}</span>
                        </a>
                      </td>

                      {/* Feedback Type */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 text-[10px] font-mono tracking-wide bg-[#FAF8F5] border border-[#E7E2D9] text-[#52525B] font-semibold whitespace-nowrap">
                          {item.type}
                        </span>
                      </td>

                      {/* Subject & Message excerpt */}
                      <td className="py-3.5 px-4">
                        <div className={`line-clamp-1 ${isUnread ? 'font-bold text-[#141416]' : 'text-[#3F3F46]'}`}>
                          {item.subject}
                        </div>
                        <div className="text-[11px] text-[#71717A] line-clamp-1 mt-0.5">
                          {item.message}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[#71717A] text-[11px] whitespace-nowrap">
                        {formatDate(item.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(item)}
                            className="p-1.5 text-[#71717A] hover:text-[#7A1C28] hover:bg-neutral-100 transition-colors"
                            title="View full details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={e => handleDeleteSingle(item, e)}
                            className="p-1.5 text-[#71717A] hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            title="Delete message"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Card Layout */}
          <div className="lg:hidden divide-y divide-[#E7E2D9]">
            {filteredFeedback.map(item => {
              const isSelected = selectedIds.includes(item.id);
              const isUnread = item.status === 'unread';

              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenDetail(item)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#7A1C28]/5'
                      : isUnread
                      ? 'bg-[#FFFFFF]'
                      : 'bg-[#FAF8F5]/40 text-[#52525B]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={e => toggleSelectOne(item.id, e)}
                        className="cursor-pointer text-[#71717A]"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#7A1C28]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      {isUnread ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#7A1C28] bg-[#7A1C28]/10 px-2 py-0.5 rounded-full border border-[#7A1C28]/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#7A1C28]" />
                          Unread
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#71717A] bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200">
                          Read
                        </span>
                      )}

                      <span className="px-2 py-0.5 text-[10px] font-mono bg-[#FAF8F5] border border-[#E7E2D9] text-[#52525B]">
                        {item.type}
                      </span>
                    </div>

                    <span className="text-[10px] text-[#71717A] font-mono whitespace-nowrap">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  <h4 className={`text-sm mb-1 ${isUnread ? 'font-bold text-[#141416]' : 'font-medium text-[#27272A]'}`}>
                    {item.subject}
                  </h4>
                  <p className="text-xs text-[#52525B] line-clamp-2 mb-3 leading-relaxed">
                    {item.message}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E7E2D9]/60">
                    <div>
                      <span className="font-semibold text-[#141416]">{item.name}</span>
                      <span className="text-[#71717A] text-[11px] ml-2">({item.email})</span>
                    </div>

                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={e => handleToggleStatus(item, e)}
                        className="text-[11px] font-semibold text-[#71717A] hover:text-[#7A1C28]"
                      >
                        {isUnread ? 'Mark Read' : 'Mark Unread'}
                      </button>
                      <button
                        type="button"
                        onClick={e => handleDeleteSingle(item, e)}
                        className="p-1 text-[#71717A] hover:text-rose-700"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fadeIn">
          <div
            className="bg-[#FFFFFF] border border-[#E7E2D9] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[#E7E2D9] pb-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-[#7A1C28]/10 text-[#7A1C28] border border-[#7A1C28]/20 font-semibold">
                    {viewingItem.type}
                  </span>
                  {viewingItem.status === 'unread' ? (
                    <span className="text-[11px] font-semibold text-[#7A1C28] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Unread
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#71717A] bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200">
                      Read
                    </span>
                  )}
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#141416] tracking-tight">
                  {viewingItem.subject}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setViewingItem(null)}
                className="p-1 text-[#71717A] hover:text-[#141416] cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sender Metadata Box */}
            <div className="bg-[#FAF8F5] border border-[#E7E2D9] p-4 mb-6 space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <span className="font-semibold text-[#71717A] uppercase tracking-wider text-[10px] mr-2">
                    Sender:
                  </span>
                  <span className="font-semibold text-[#141416]">{viewingItem.name}</span>
                </div>
                <div className="text-[11px] text-[#71717A] font-mono">
                  {formatDate(viewingItem.createdAt)}
                </div>
              </div>

              <div>
                <span className="font-semibold text-[#71717A] uppercase tracking-wider text-[10px] mr-2">
                  Email:
                </span>
                <a
                  href={`mailto:${viewingItem.email}?subject=Re: ${encodeURIComponent(viewingItem.subject)}`}
                  className="text-[#7A1C28] underline underline-offset-2 hover:text-[#63141F] inline-flex items-center gap-1"
                >
                  <Mail className="w-3 h-3" />
                  <span>{viewingItem.email}</span>
                </a>
              </div>
            </div>

            {/* Complete Message Content */}
            <div className="mb-8">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#71717A] mb-2">
                Message Body
              </h4>
              <div className="p-4 bg-[#FFFFFF] border border-[#E7E2D9] text-sm text-[#141416] leading-relaxed whitespace-pre-wrap">
                {viewingItem.message}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E7E2D9]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(viewingItem)}
                  className="px-4 py-2 border border-[#E7E2D9] bg-[#FFFFFF] hover:bg-[#FAF8F5] text-xs font-semibold uppercase tracking-wider text-[#141416] transition-colors cursor-pointer"
                >
                  {viewingItem.status === 'unread' ? 'Mark as Read' : 'Mark as Unread'}
                </button>

                <a
                  href={`mailto:${viewingItem.email}?subject=Re: ${encodeURIComponent(viewingItem.subject)}`}
                  className="px-4 py-2 bg-[#7A1C28] hover:bg-[#63141F] text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Reply via Email</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteSingle(viewingItem)}
                className="px-3.5 py-2 border border-rose-300 text-rose-800 bg-rose-50 hover:bg-rose-100 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-700" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fadeIn">
          <div
            className="bg-[#FFFFFF] border border-[#E7E2D9] w-full max-w-md p-6 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-700" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#141416]">
                  {deleteTarget.type === 'single'
                    ? 'Delete this feedback?'
                    : `Delete ${deleteTarget.ids?.length} selected feedbacks?`}
                </h3>
                <p className="mt-1 text-xs text-[#52525B] leading-relaxed">
                  This action cannot be undone. The correspondence will be permanently removed from the server database.
                </p>
                {deleteTarget.type === 'single' && deleteTarget.item && (
                  <p className="mt-2 text-xs font-semibold text-[#141416] bg-[#FAF8F5] p-2 border border-[#E7E2D9] truncate">
                    "{deleteTarget.item.subject}" by {deleteTarget.item.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E7E2D9]">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-[#E7E2D9] text-xs font-semibold uppercase tracking-wider text-[#141416] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-xs"
              >
                {isDeleting ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
