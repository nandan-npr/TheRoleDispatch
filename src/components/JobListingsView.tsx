import React, { useState, useMemo } from 'react';
import { useJobs } from '../context/JobContext';
import { JobCard } from './JobCard';
import { ALL_CATEGORIES, ALL_SOURCES } from '../data/categories';
import { Search, MapPin, SlidersHorizontal, RotateCcw, ChevronDown, Check } from 'lucide-react';
import { JobCategory, JobSource, WorkMode, JobType } from '../types';

export const JobListingsView: React.FC = () => {
  const {
    publishedJobs,
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    navigateToJobDetails
  } = useJobs();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Experience filter options
  const experienceOptions = [
    { label: 'All Experience', value: 'ALL' },
    { label: 'Fresher / 0–1 Years', value: 'Fresher' },
    { label: '1–3 Years', value: '1–3' },
    { label: '3–5 Years', value: '3–5' },
    { label: '5+ Years', value: '5+' }
  ];

  // Salary range options
  const salaryOptions = [
    { label: 'All Salaries', value: 'ALL' },
    { label: 'Under ₹5 LPA', value: 'UNDER_5' },
    { label: '₹5 – ₹10 LPA', value: '5_TO_10' },
    { label: '₹10 – ₹20 LPA', value: '10_TO_20' },
    { label: '₹20+ LPA', value: 'OVER_20' }
  ];

  const workModeOptions: { label: string; value: string }[] = [
    { label: 'All Work Modes', value: 'ALL' },
    { label: 'In-office', value: 'In-office' },
    { label: 'Hybrid', value: 'Hybrid' },
    { label: 'Remote', value: 'Remote' }
  ];

  const jobTypeOptions: { label: string; value: string }[] = [
    { label: 'All Job Types', value: 'ALL' },
    { label: 'Full-time', value: 'Full-time' },
    { label: 'Contract', value: 'Contract' },
    { label: 'Internship', value: 'Internship' },
    { label: 'Part-time', value: 'Part-time' }
  ];

  // Filter & Sort Logic
  const filteredJobs = useMemo(() => {
    return publishedJobs.filter(job => {
      // Title / Query filter
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchesRole = job.role.toLowerCase().includes(query);
        const matchesCompany = job.companyName.toLowerCase().includes(query);
        const matchesSkills = job.skills.some(s => s.toLowerCase().includes(query));
        if (!matchesRole && !matchesCompany && !matchesSkills) return false;
      }

      // Location filter
      if (filters.locationQuery.trim()) {
        const loc = filters.locationQuery.toLowerCase().trim();
        if (!job.location.toLowerCase().includes(loc)) return false;
      }

      // Experience filter
      if (filters.experience !== 'ALL') {
        if (filters.experience === 'Fresher') {
          if (!job.experience.toLowerCase().includes('fresher') && !job.experience.includes('0–1') && !job.experience.includes('0-1')) {
            return false;
          }
        } else if (filters.experience === '1–3') {
          if (!job.experience.includes('1–3') && !job.experience.includes('1-3') && !job.experience.includes('1–4') && !job.experience.includes('2–4')) {
            return false;
          }
        } else if (filters.experience === '3–5') {
          if (!job.experience.includes('3–5') && !job.experience.includes('3-5') && !job.experience.includes('2–5') && !job.experience.includes('3–6')) {
            return false;
          }
        } else if (filters.experience === '5+') {
          if (!job.experience.includes('5+') && !job.experience.includes('4–8') && !job.experience.includes('4–7')) {
            return false;
          }
        }
      }

      // Category filter
      if (filters.category !== 'ALL') {
        if (job.category !== filters.category) return false;
      }

      // Work mode
      if (filters.workMode !== 'ALL') {
        if (job.workMode !== filters.workMode) return false;
      }

      // Job type
      if (filters.jobType !== 'ALL') {
        if (job.jobType !== filters.jobType) return false;
      }

      // Source
      if (filters.source !== 'ALL') {
        if (job.source !== filters.source) return false;
      }

      // Salary filter
      if (filters.salaryRange !== 'ALL') {
        const salStr = job.salary;
        // Parse numbers in LPA
        const numbers = salStr.match(/₹?(\d+(\.\d+)?)/g);
        if (numbers && numbers.length > 0) {
          const val = parseFloat(numbers[0].replace('₹', ''));
          if (filters.salaryRange === 'UNDER_5' && val >= 5.0) return false;
          if (filters.salaryRange === '5_TO_10' && (val < 5.0 || val >= 10.0)) return false;
          if (filters.salaryRange === '10_TO_20' && (val < 10.0 || val >= 20.0)) return false;
          if (filters.salaryRange === 'OVER_20' && val < 20.0) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'az') {
        return a.role.localeCompare(b.role);
      } else if (filters.sortBy === 'za') {
        return b.role.localeCompare(a.role);
      } else if (filters.sortBy === 'relevance') {
        if (!filters.searchQuery.trim()) return a.orderIndex - b.orderIndex;
        const q = filters.searchQuery.toLowerCase().trim();
        const aScore = a.role.toLowerCase().includes(q) ? 2 : (a.companyName.toLowerCase().includes(q) ? 1 : 0);
        const bScore = b.role.toLowerCase().includes(q) ? 2 : (b.companyName.toLowerCase().includes(q) ? 1 : 0);
        return bScore - aScore;
      }
      return 0;
    });
  }, [publishedJobs, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.experience !== 'ALL') count++;
    if (filters.salaryRange !== 'ALL') count++;
    if (filters.category !== 'ALL') count++;
    if (filters.workMode !== 'ALL') count++;
    if (filters.jobType !== 'ALL') count++;
    if (filters.source !== 'ALL') count++;
    return count;
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header - Editorial Style */}
      <div className="border-b border-[#E7E2D9] pb-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7A1C28] mb-1">
              The Registry
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#141416]">
              Job Listings
            </h1>
            <p className="mt-1 text-sm text-[#52525B]">
              Authentic employment opportunities across engineering, IT, and specialized technical disciplines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#FFFFFF] border border-[#E7E2D9] text-[#141416]">
              <strong className="text-[#7A1C28]">{filteredJobs.length}</strong> {filteredJobs.length === 1 ? 'Role' : 'Roles'} Listed
            </span>

            {/* Sorting */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#71717A] hidden sm:inline">Sort:</span>
              <select
                id="jobs-sort-select"
                value={filters.sortBy}
                onChange={e => updateFilter('sortBy', e.target.value as 'relevance' | 'az' | 'za')}
                aria-label="Sort listings"
                className="bg-[#FFFFFF] border border-[#E7E2D9] text-[#141416] text-xs py-1.5 px-3 rounded-xs focus:outline-none focus:border-[#7A1C28] cursor-pointer"
              >
                <option value="relevance">Relevance</option>
                <option value="az">A–Z</option>
                <option value="za">Z–A</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar per prompt: [ Search job title ] [ Location ] [ Search ] */}
      <div className="bg-[#FFFFFF] border border-[#E7E2D9] p-3 mb-8 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 flex items-center border border-[#E7E2D9] bg-[#FAF8F5] px-3 py-2">
            <Search className="w-4 h-4 text-[#7A1C28] mr-2 shrink-0" />
            <input
              id="jobs-search-title"
              type="text"
              placeholder="Search job title, role, or keywords..."
              value={filters.searchQuery}
              onChange={e => updateFilter('searchQuery', e.target.value)}
              className="w-full bg-transparent text-sm text-[#141416] placeholder-[#71717A] focus:outline-none"
            />
          </div>

          <div className="relative flex-1 flex items-center border border-[#E7E2D9] bg-[#FAF8F5] px-3 py-2">
            <MapPin className="w-4 h-4 text-[#C5A059] mr-2 shrink-0" />
            <input
              id="jobs-search-location"
              type="text"
              placeholder="Location..."
              value={filters.locationQuery}
              onChange={e => updateFilter('locationQuery', e.target.value)}
              className="w-full bg-transparent text-sm text-[#141416] placeholder-[#71717A] focus:outline-none"
            />
          </div>

          <button
            id="jobs-search-btn"
            type="button"
            onClick={() => {}}
            className="bg-[#7A1C28] hover:bg-[#63141F] text-[#FFFFFF] px-6 py-2.5 text-xs font-semibold tracking-wider uppercase transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout: Filters Sidebar (Desktop) + Job Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between pb-4 border-b border-[#E7E2D9]">
          <button
            id="mobile-filter-drawer-toggle"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2 border border-[#E7E2D9] bg-[#FFFFFF] text-[#141416]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#7A1C28]" />
            <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileFilterOpen ? 'rotate-180' : ''}`} />
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs text-[#7A1C28] hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          )}
        </div>

        {/* Filters Sidebar (Desktop or Collapsible on Mobile) */}
        <aside
          className={`space-y-6 ${
            mobileFilterOpen ? 'block' : 'hidden lg:block'
          } bg-[#FFFFFF] border border-[#E7E2D9] p-5 shadow-xs`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E2D9]">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#7A1C28]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#141416]">
                Filter Listings
              </h2>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-[11px] text-[#7A1C28] hover:underline flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* 1. Category Filter */}
          <div className="space-y-2">
            <label htmlFor="filter-category" className="text-xs font-semibold text-[#141416] tracking-wide block">
              Category
            </label>
            <select
              id="filter-category"
              value={filters.category}
              onChange={e => updateFilter('category', e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E7E2D9] text-xs text-[#141416] py-2 px-2.5 rounded-xs focus:outline-none focus:border-[#7A1C28] cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {ALL_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Experience Filter */}
          <div className="space-y-2">
            <label htmlFor="filter-experience" className="text-xs font-semibold text-[#141416] tracking-wide block">
              Experience Level
            </label>
            <select
              id="filter-experience"
              value={filters.experience}
              onChange={e => updateFilter('experience', e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E7E2D9] text-xs text-[#141416] py-2 px-2.5 rounded-xs focus:outline-none focus:border-[#7A1C28] cursor-pointer"
            >
              {experienceOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Salary Range Filter */}
          <div className="space-y-2">
            <label htmlFor="filter-salary" className="text-xs font-semibold text-[#141416] tracking-wide block">
              Salary Range
            </label>
            <select
              id="filter-salary"
              value={filters.salaryRange}
              onChange={e => updateFilter('salaryRange', e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E7E2D9] text-xs text-[#141416] py-2 px-2.5 rounded-xs focus:outline-none focus:border-[#7A1C28] cursor-pointer"
            >
              {salaryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Work Mode Filter */}
          <div className="space-y-2">
            <label htmlFor="filter-work-mode" className="text-xs font-semibold text-[#141416] tracking-wide block">
              Work Mode
            </label>
            <select
              id="filter-work-mode"
              value={filters.workMode}
              onChange={e => updateFilter('workMode', e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E7E2D9] text-xs text-[#141416] py-2 px-2.5 rounded-xs focus:outline-none focus:border-[#7A1C28] cursor-pointer"
            >
              {workModeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Job Type Filter */}
          <div className="space-y-2">
            <label htmlFor="filter-job-type" className="text-xs font-semibold text-[#141416] tracking-wide block">
              Job Type
            </label>
            <select
              id="filter-job-type"
              value={filters.jobType}
              onChange={e => updateFilter('jobType', e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E7E2D9] text-xs text-[#141416] py-2 px-2.5 rounded-xs focus:outline-none focus:border-[#7A1C28] cursor-pointer"
            >
              {jobTypeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 6. Source Filter */}
          <div className="space-y-2">
            <label htmlFor="filter-source" className="text-xs font-semibold text-[#141416] tracking-wide block">
              Source Portal
            </label>
            <select
              id="filter-source"
              value={filters.source}
              onChange={e => updateFilter('source', e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E7E2D9] text-xs text-[#141416] py-2 px-2.5 rounded-xs focus:outline-none focus:border-[#7A1C28] cursor-pointer"
            >
              <option value="ALL">All Sources</option>
              {ALL_SOURCES.map(source => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>
        </aside>

        {/* Job Cards Listings (Grid) */}
        <div className="lg:col-span-3">
          {/* Active Filter Badges */}
          {activeFilterCount > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-medium text-[#71717A] uppercase">Active:</span>
              {filters.category !== 'ALL' && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-[#FFFFFF] border border-[#7A1C28]/30 text-[#7A1C28]">
                  Category: {filters.category}
                  <button onClick={() => updateFilter('category', 'ALL')} className="hover:text-black">×</button>
                </span>
              )}
              {filters.experience !== 'ALL' && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-[#FFFFFF] border border-[#E7E2D9] text-[#141416]">
                  Exp: {filters.experience}
                  <button onClick={() => updateFilter('experience', 'ALL')} className="hover:text-[#7A1C28]">×</button>
                </span>
              )}
              {filters.salaryRange !== 'ALL' && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-[#FFFFFF] border border-[#E7E2D9] text-[#141416]">
                  Salary Filter Active
                  <button onClick={() => updateFilter('salaryRange', 'ALL')} className="hover:text-[#7A1C28]">×</button>
                </span>
              )}
              {filters.workMode !== 'ALL' && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-[#FFFFFF] border border-[#E7E2D9] text-[#141416]">
                  {filters.workMode}
                  <button onClick={() => updateFilter('workMode', 'ALL')} className="hover:text-[#7A1C28]">×</button>
                </span>
              )}
              {filters.source !== 'ALL' && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-[#FFFFFF] border border-[#E7E2D9] text-[#141416]">
                  {filters.source}
                  <button onClick={() => updateFilter('source', 'ALL')} className="hover:text-[#7A1C28]">×</button>
                </span>
              )}
            </div>
          )}

          {filteredJobs.length === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#E7E2D9] p-10 text-center">
              <h3 className="font-serif text-lg font-bold text-[#141416]">
                No Roles Match the Criteria
              </h3>
              <p className="mt-2 text-sm text-[#52525B] max-w-md mx-auto">
                No published postings correspond to this specific combination of role, location, and filters.
              </p>
              <button
                onClick={clearFilters}
                className="mt-5 px-4 py-2 text-xs font-semibold tracking-wider uppercase bg-[#7A1C28] text-white hover:bg-[#63141F] transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredJobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onClick={() => navigateToJobDetails(job.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
