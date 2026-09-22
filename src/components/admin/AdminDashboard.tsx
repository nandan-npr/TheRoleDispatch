import React, { useState, useMemo } from 'react';
import { useJobs } from '../../context/JobContext';
import { Job, JobStatus, JobCategory, JobSource } from '../../types';
import { ALL_CATEGORIES, ALL_SOURCES } from '../../data/categories';
import { JobFormModal } from './JobFormModal';
import { JobPreviewModal } from './JobPreviewModal';
import {
  Plus,
  Search,
  CheckSquare,
  Square,
  Eye,
  Edit2,
  Trash2,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Shield,
  AlertTriangle,
  X,
  ArrowRight,
  LogOut
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    jobs,
    addJob,
    updateJob,
    deleteJob,
    deleteMultipleJobs,
    setJobStatus,
    setMultipleJobStatus,
    resetToSeedData,
    navigateToView,
    logoutAdmin
  } = useJobs();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | JobStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'relevance' | 'az' | 'za' | 'company' | 'status'>('relevance');

  // Bulk selection state
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [previewJob, setPreviewJob] = useState<Job | null>(null);

  // In-app Delete Confirmation Dialog state (replaces window.confirm which is blocked in iframes)
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'single' | 'bulk';
    job?: Job;
    count?: number;
  } | null>(null);

  // Statistics derived live from jobs state
  const stats = useMemo(() => {
    return {
      total: jobs.length,
      published: jobs.filter(j => j.status === 'PUBLISHED').length,
      draft: jobs.filter(j => j.status === 'DRAFT').length,
      hold: jobs.filter(j => j.status === 'HOLD').length
    };
  }, [jobs]);

  // Unique locations for filter
  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(jobs.map(j => j.location))).sort();
  }, [jobs]);

  // Filtered & Sorted Jobs - strictly without dates
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Search by role, company, location, category, or skills
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesRole = job.role.toLowerCase().includes(q);
        const matchesCompany = job.companyName.toLowerCase().includes(q);
        const matchesLoc = job.location.toLowerCase().includes(q);
        const matchesCategory = job.category.toLowerCase().includes(q);
        const matchesSkill = job.skills?.some(s => s.toLowerCase().includes(q));
        if (!matchesRole && !matchesCompany && !matchesLoc && !matchesCategory && !matchesSkill) {
          return false;
        }
      }

      // Status
      if (statusFilter !== 'ALL' && job.status !== statusFilter) {
        return false;
      }

      // Category
      if (categoryFilter !== 'ALL' && job.category !== categoryFilter) {
        return false;
      }

      // Source
      if (sourceFilter !== 'ALL' && job.source !== sourceFilter) {
        return false;
      }

      // Location
      if (locationFilter !== 'ALL' && job.location !== locationFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'az') {
        return a.role.localeCompare(b.role);
      }
      if (sortBy === 'za') {
        return b.role.localeCompare(a.role);
      }
      if (sortBy === 'company') {
        return a.companyName.localeCompare(b.companyName);
      }
      if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      }
      // 'relevance'
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const aScore = a.role.toLowerCase().includes(q) ? 2 : (a.companyName.toLowerCase().includes(q) ? 1 : 0);
        const bScore = b.role.toLowerCase().includes(q) ? 2 : (b.companyName.toLowerCase().includes(q) ? 1 : 0);
        return bScore - aScore;
      }
      return a.orderIndex - b.orderIndex;
    });
  }, [jobs, searchQuery, statusFilter, categoryFilter, sourceFilter, locationFilter, sortBy]);

  // Bulk Selection Handlers
  const handleSelectAll = () => {
    if (selectedJobIds.length === filteredJobs.length) {
      setSelectedJobIds([]);
    } else {
      setSelectedJobIds(filteredJobs.map(j => j.id));
    }
  };

  const toggleSelectJob = (id: string) => {
    setSelectedJobIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Bulk Actions
  const handleBulkPublish = () => {
    if (selectedJobIds.length === 0) return;
    setMultipleJobStatus(selectedJobIds, 'PUBLISHED');
    setSelectedJobIds([]);
  };

  const handleBulkHold = () => {
    if (selectedJobIds.length === 0) return;
    setMultipleJobStatus(selectedJobIds, 'HOLD');
    setSelectedJobIds([]);
  };

  const handleBulkDraft = () => {
    if (selectedJobIds.length === 0) return;
    setMultipleJobStatus(selectedJobIds, 'DRAFT');
    setSelectedJobIds([]);
  };

  const handlePromptBulkDelete = () => {
    if (selectedJobIds.length === 0) return;
    setDeleteConfirmTarget({
      type: 'bulk',
      count: selectedJobIds.length
    });
  };

  const handlePromptSingleDelete = (job: Job) => {
    setDeleteConfirmTarget({
      type: 'single',
      job
    });
  };

  // Confirm delete execution
  const handleConfirmDelete = () => {
    if (!deleteConfirmTarget) return;

    if (deleteConfirmTarget.type === 'single' && deleteConfirmTarget.job) {
      const idToDelete = deleteConfirmTarget.job.id;
      deleteJob(idToDelete);
      setSelectedJobIds(prev => prev.filter(id => id !== idToDelete));
    } else if (deleteConfirmTarget.type === 'bulk') {
      deleteMultipleJobs(selectedJobIds);
      setSelectedJobIds([]);
    }

    setDeleteConfirmTarget(null);
  };

  // Form Save
  const handleSaveJob = (jobData: Omit<Job, 'id' | 'orderIndex'>, status: JobStatus) => {
    if (editingJob) {
      updateJob(editingJob.id, { ...jobData, status });
    } else {
      addJob({ ...jobData, status });
    }
    setIsFormOpen(false);
    setEditingJob(null);
  };

  // Open add job modal
  const handleOpenAddJob = () => {
    setEditingJob(null);
    setIsFormOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (job: Job) => {
    setEditingJob(job);
    setIsFormOpen(true);
  };

  // Quick toggle status single row
  const handleToggleHoldPublish = (job: Job) => {
    if (job.status === 'PUBLISHED') {
      setJobStatus(job.id, 'HOLD');
    } else {
      setJobStatus(job.id, 'PUBLISHED');
    }
  };

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            PUBLISHED
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            DRAFT
          </span>
        );
      case 'HOLD':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase px-2 py-0.5 bg-neutral-100 text-neutral-800 border border-neutral-300 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
            HOLD
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Editorial Dashboard Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E7E2D9] pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7A1C28]">
            <Shield className="w-3.5 h-3.5" />
            <span>Editorial Operations Desk</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#141416]">
            Job Management Dashboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#52525B]">
            Author, categorize, review, and control publication states across all company career listings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigateToView('jobs')}
            className="px-3.5 py-2 border border-[#E7E2D9] bg-[#FFFFFF] hover:bg-[#FAF8F5] text-xs font-semibold tracking-wider uppercase text-[#141416] transition-colors"
          >
            View Public Site
          </button>

          <button
            id="admin-add-job-btn"
            onClick={handleOpenAddJob}
            className="px-4 py-2 bg-[#7A1C28] hover:bg-[#63141F] text-white text-xs font-semibold tracking-wider uppercase transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#C5A059]" />
            <span>Add Career Listing</span>
          </button>

          <button
            onClick={() => navigateToView('home')}
            className="px-3 py-2 text-xs text-[#71717A] hover:text-[#7A1C28] transition-colors"
            title="Exit back to home page"
          >
            Exit to Home
          </button>

          <button
            id="admin-logout-btn"
            onClick={logoutAdmin}
            className="px-3.5 py-2 border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold tracking-wider uppercase transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Invalidate session and sign out"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-700" />
            <span>LOGOUT</span>
          </button>
        </div>
      </div>

      {/* Simple Statistics per prompt: Total Jobs, Published, Draft, On Hold */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 sm:p-5 bg-[#FFFFFF] border border-[#E7E2D9] shadow-2xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">
            Total Jobs
          </div>
          <div className="mt-2 text-3xl font-serif font-bold text-[#141416]">
            {stats.total}
          </div>
          <div className="mt-1 text-[11px] text-[#52525B]">Managed database items</div>
        </div>

        <div className="p-4 sm:p-5 bg-[#FFFFFF] border border-emerald-200/80 shadow-2xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
            Published
          </div>
          <div className="mt-2 text-3xl font-serif font-bold text-emerald-700">
            {stats.published}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600/90">Visible to public applicants</div>
        </div>

        <div className="p-4 sm:p-5 bg-[#FFFFFF] border border-amber-200/80 shadow-2xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
            Draft
          </div>
          <div className="mt-2 text-3xl font-serif font-bold text-amber-700">
            {stats.draft}
          </div>
          <div className="mt-1 text-[11px] text-amber-600/90">Work in progress (hidden)</div>
        </div>

        <div className="p-4 sm:p-5 bg-[#FFFFFF] border border-neutral-300 shadow-2xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
            On Hold
          </div>
          <div className="mt-2 text-3xl font-serif font-bold text-neutral-700">
            {stats.hold}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">Temporarily paused roles</div>
        </div>
      </div>

      {/* Information-Dense Filter Bar per prompt: Search, Status, Category, Source, Location, Sort */}
      <div className="bg-[#FFFFFF] border border-[#E7E2D9] p-4 mb-6 space-y-3 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search */}
          <div className="md:col-span-4 relative flex items-center bg-[#FAF8F5] border border-[#E7E2D9] px-2.5 py-1.5">
            <Search className="w-4 h-4 text-[#7A1C28] mr-2 shrink-0" />
            <input
              id="admin-search-input"
              type="text"
              placeholder="Search by role, company, location, skills..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-[#141416] focus:outline-none placeholder-[#71717A]"
            />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              id="admin-status-filter"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full bg-[#FAF8F5] border border-[#E7E2D9] text-xs text-[#141416] py-2 px-2 focus:outline-none focus:border-[#7A1C28] cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published Only</option>
              <option value="DRAFT">Draft Only</option>
              <option value="HOLD">Hold Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="md:col-span-2">
            <select
              id="admin-category-filter"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E7E2D9] text-xs text-[#141416] py-2 px-2 focus:outline-none focus:border-[#7A1C28] cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {ALL_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Source Filter */}
          <div className="md:col-span-2">
            <select
              id="admin-source-filter"
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E7E2D9] text-xs text-[#141416] py-2 px-2 focus:outline-none focus:border-[#7A1C28] cursor-pointer"
            >
              <option value="ALL">All Sources</option>
              {ALL_SOURCES.map(src => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="md:col-span-2">
            <select
              id="admin-location-filter"
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E7E2D9] text-xs text-[#141416] py-2 px-2 focus:outline-none focus:border-[#7A1C28] cursor-pointer"
            >
              <option value="ALL">All Locations</option>
              {uniqueLocations.map(loc => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort & Bulk Action Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-[#F0EBE1] gap-3">
          {/* Bulk Selection Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs border border-[#E7E2D9] bg-[#FAF8F5] hover:bg-[#FFFFFF] font-medium cursor-pointer"
            >
              {selectedJobIds.length === filteredJobs.length && filteredJobs.length > 0 ? (
                <CheckSquare className="w-3.5 h-3.5 text-[#7A1C28]" />
              ) : (
                <Square className="w-3.5 h-3.5 text-[#71717A]" />
              )}
              <span>Select All ({filteredJobs.length})</span>
            </button>

            {selectedJobIds.length > 0 && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-[#E7E2D9]">
                <span className="font-semibold text-[#7A1C28] text-xs">
                  {selectedJobIds.length} selected:
                </span>
                <button
                  id="admin-bulk-publish-btn"
                  onClick={handleBulkPublish}
                  className="px-2.5 py-1 text-[11px] font-semibold uppercase bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer"
                >
                  Publish
                </button>
                <button
                  id="admin-bulk-hold-btn"
                  onClick={handleBulkHold}
                  className="px-2.5 py-1 text-[11px] font-semibold uppercase bg-neutral-600 hover:bg-neutral-700 text-white cursor-pointer"
                >
                  Hold
                </button>
                <button
                  id="admin-bulk-draft-btn"
                  onClick={handleBulkDraft}
                  className="px-2.5 py-1 text-[11px] font-semibold uppercase bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                >
                  Draft
                </button>
                <button
                  id="admin-bulk-delete-btn"
                  onClick={handlePromptBulkDelete}
                  className="px-2.5 py-1 text-[11px] font-semibold uppercase bg-rose-700 hover:bg-rose-800 text-white cursor-pointer"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Sort selection: Relevance, A–Z, Z–A, Company, Status */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#71717A]">Sort:</span>
            <select
              id="admin-sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-[#FAF8F5] border border-[#E7E2D9] text-xs py-1 px-2 focus:outline-none focus:border-[#7A1C28] cursor-pointer"
            >
              <option value="relevance">Relevance</option>
              <option value="az">Role (A–Z)</option>
              <option value="za">Role (Z–A)</option>
              <option value="company">Company (A–Z)</option>
              <option value="status">Status</option>
            </select>

            <button
              onClick={resetToSeedData}
              className="ml-2 text-[11px] text-[#71717A] hover:text-[#7A1C28] flex items-center gap-1 underline cursor-pointer"
              title="Reset sample listings to default"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Jobs Management Table */}
      <div className="bg-[#FFFFFF] border border-[#E7E2D9] shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#FAF8F5] border-b border-[#E7E2D9] text-[#52525B] font-semibold tracking-wider uppercase text-[10px]">
              <th className="p-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedJobIds.length === filteredJobs.length && filteredJobs.length > 0}
                  onChange={handleSelectAll}
                  className="cursor-pointer"
                />
              </th>
              <th className="p-3">Role & Discipline</th>
              <th className="p-3">Company</th>
              <th className="p-3">Location & Exp</th>
              <th className="p-3">Source</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0EBE1]">
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#71717A]">
                  No jobs found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredJobs.map(job => {
                const isSelected = selectedJobIds.includes(job.id);
                return (
                  <tr
                    key={job.id}
                    className={`hover:bg-[#FAF8F5]/80 transition-colors ${
                      isSelected ? 'bg-[#7A1C28]/5' : ''
                    }`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectJob(job.id)}
                        className="cursor-pointer"
                      />
                    </td>

                    {/* Role & Category */}
                    <td className="p-3 max-w-[240px]">
                      <div className="font-serif font-bold text-sm text-[#141416] truncate">
                        {job.role}
                      </div>
                      <div className="text-[11px] font-medium text-[#7A1C28] mt-0.5">
                        {job.category} · <span className="text-[#71717A]">{job.workMode}</span>
                      </div>
                    </td>

                    {/* Company Name with accent */}
                    <td className="p-3">
                      <span className="font-medium text-xs text-[#141416] border-b border-[#C5A059]/40">
                        {job.companyName}
                      </span>
                    </td>

                    {/* Location & Exp */}
                    <td className="p-3">
                      <div className="text-[#3F3F46] font-medium">{job.location}</div>
                      <div className="text-[11px] text-[#71717A]">{job.experience}</div>
                    </td>

                    {/* Source */}
                    <td className="p-3">
                      <span className="text-xs text-[#52525B] px-1.5 py-0.5 bg-[#FAF8F5] border border-[#E7E2D9]">
                        {job.source}
                      </span>
                    </td>

                    {/* Status badge and quick status selector */}
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        {getStatusBadge(job.status)}
                        <select
                          value={job.status}
                          onChange={e => setJobStatus(job.id, e.target.value as JobStatus)}
                          className="text-[10px] bg-transparent border border-[#E7E2D9] px-1 py-0.5 text-[#52525B] hover:border-[#7A1C28] cursor-pointer"
                          title="Change status directly"
                        >
                          <option value="PUBLISHED">Set PUBLISHED</option>
                          <option value="HOLD">Set HOLD</option>
                          <option value="DRAFT">Set DRAFT</option>
                        </select>
                      </div>
                    </td>

                    {/* Actions: Edit, Preview, Hold / Publish, Delete */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Preview */}
                        <button
                          onClick={() => setPreviewJob(job)}
                          className="p-1.5 text-[#52525B] hover:text-[#7A1C28] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                          title="Preview public appearance"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(job)}
                          className="p-1.5 text-[#52525B] hover:text-[#141416] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                          title="Edit job details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Hold / Publish Toggle */}
                        <button
                          onClick={() => handleToggleHoldPublish(job)}
                          className={`p-1.5 transition-colors cursor-pointer ${
                            job.status === 'PUBLISHED'
                              ? 'text-neutral-500 hover:text-neutral-800'
                              : 'text-emerald-600 hover:text-emerald-800'
                          }`}
                          title={job.status === 'PUBLISHED' ? 'Change to HOLD' : 'Change to PUBLISHED'}
                        >
                          {job.status === 'PUBLISHED' ? (
                            <PauseCircle className="w-4 h-4" />
                          ) : (
                            <PlayCircle className="w-4 h-4" />
                          )}
                        </button>

                        {/* Delete with reliable in-app modal */}
                        <button
                          onClick={() => handlePromptSingleDelete(job)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete job"
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

      {/* In-App Delete Confirmation Modal (Guarantees deletion works across all iframe environments) */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-[#FFFFFF] border border-[#E7E2D9] p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-100 text-rose-700 rounded-full shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#141416]">
                  {deleteConfirmTarget.type === 'single'
                    ? 'Permanently Delete Career Listing?'
                    : `Permanently Delete ${deleteConfirmTarget.count} Listings?`}
                </h3>
                <p className="mt-2 text-xs text-[#52525B] leading-relaxed">
                  {deleteConfirmTarget.type === 'single' ? (
                    <>
                      Are you sure you want to permanently delete{' '}
                      <strong className="text-[#141416]">"{deleteConfirmTarget.job?.role}"</strong> at{' '}
                      <strong className="text-[#141416]">{deleteConfirmTarget.job?.companyName}</strong>?
                      This action will immediately remove the listing from browser storage and all public views.
                    </>
                  ) : (
                    <>
                      Are you sure you want to permanently delete{' '}
                      <strong className="text-[#141416]">{deleteConfirmTarget.count}</strong> selected listings?
                      This action will immediately remove them from browser storage and all public views.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#F0EBE1] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 border border-[#E7E2D9] bg-[#FAF8F5] hover:bg-[#FFFFFF] text-xs font-semibold uppercase text-[#3F3F46] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-button"
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal (Add/Edit) */}
      <JobFormModal
        isOpen={isFormOpen}
        initialJob={editingJob}
        onClose={() => {
          setIsFormOpen(false);
          setEditingJob(null);
        }}
        onSave={handleSaveJob}
        onPreview={job => setPreviewJob(job)}
      />

      {/* Preview Modal */}
      <JobPreviewModal
        job={previewJob}
        onClose={() => setPreviewJob(null)}
      />
    </div>
  );
};
