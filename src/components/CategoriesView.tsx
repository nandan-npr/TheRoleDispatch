import React, { useState } from 'react';
import { useJobs } from '../context/JobContext';
import { CATEGORY_STRUCTURE } from '../data/categories';
import { JobCategory } from '../types';
import { JobCard } from './JobCard';
import { ArrowRight, ChevronRight, Layers, Briefcase } from 'lucide-react';

export const CategoriesView: React.FC = () => {
  const { publishedJobs, navigateToCategory, navigateToJobDetails } = useJobs();
  const [expandedCategory, setExpandedCategory] = useState<JobCategory | null>(null);

  // Helper to count jobs for a specific category
  const getJobCount = (categoryName: JobCategory): number => {
    return publishedJobs.filter(job => job.category === categoryName).length;
  };

  // Helper to get jobs for a specific category
  const getJobsForCategory = (categoryName: JobCategory) => {
    return publishedJobs.filter(job => job.category === categoryName);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="border-b border-[#E7E2D9] pb-6 mb-10">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7A1C28] mb-1">
          <Layers className="w-3.5 h-3.5" />
          <span>Discipline Directory</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#141416]">
          Job Categories
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#52525B] max-w-2xl leading-relaxed">
          Every role in our publication is mapped strictly to a single, verified discipline. Explore targeted career channels without overlapping redundancies.
        </p>
      </div>

      {/* Category Groups */}
      <div className="space-y-12">
        {CATEGORY_STRUCTURE.map(group => {
          const groupTotal = group.subcategories.reduce(
            (sum, sub) => sum + getJobCount(sub.name),
            0
          );

          return (
            <section
              key={group.group}
              className="border border-[#E7E2D9] bg-[#FFFFFF] p-6 sm:p-8 shadow-xs"
            >
              {/* Group Masthead */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-[#F0EBE1] pb-4 mb-6 gap-2">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 bg-[#7A1C28]" />
                    <h2 className="font-serif text-2xl font-bold text-[#141416]">
                      {group.group}
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-[#52525B] mt-1 pl-5">
                    {group.description}
                  </p>
                </div>
                <div className="text-xs font-mono text-[#7A1C28] font-semibold pl-5 sm:pl-0">
                  {groupTotal} {groupTotal === 1 ? 'Role' : 'Roles'} Available
                </div>
              </div>

              {/* Subcategories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.subcategories.map(sub => {
                  const count = getJobCount(sub.name);
                  const isExpanded = expandedCategory === sub.name;
                  const categoryJobs = getJobsForCategory(sub.name);

                  return (
                    <div
                      key={sub.name}
                      className={`border transition-all duration-200 flex flex-col justify-between ${
                        count > 0
                          ? 'border-[#E7E2D9] bg-[#FAF8F5]/70 hover:border-[#7A1C28]/50 hover:bg-[#FFFFFF]'
                          : 'border-[#F0EBE1] bg-[#FAF8F5]/40 opacity-80'
                      }`}
                    >
                      <div className="p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-serif text-base font-semibold text-[#141416]">
                            {sub.name}
                          </h3>
                          <span
                            className={`text-[11px] font-mono px-2 py-0.5 rounded-xs font-semibold ${
                              count > 0
                                ? 'bg-[#7A1C28]/10 text-[#7A1C28] border border-[#7A1C28]/20'
                                : 'bg-[#E7E2D9]/50 text-[#71717A]'
                            }`}
                          >
                            {count}
                          </span>
                        </div>

                        <p className="text-xs text-[#52525B] mt-2 line-clamp-2 leading-relaxed">
                          {sub.description}
                        </p>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="p-4 pt-0 border-t border-[#F0EBE1]/60 mt-auto flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => navigateToCategory(sub.name)}
                          className="font-medium text-[#7A1C28] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Explore All</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        {count > 0 && (
                          <button
                            type="button"
                            onClick={() => setExpandedCategory(isExpanded ? null : sub.name)}
                            className="text-[11px] text-[#52525B] hover:text-[#141416] flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>{isExpanded ? 'Hide' : 'Quick View'}</span>
                            <ChevronRight
                              className={`w-3 h-3 transition-transform ${
                                isExpanded ? 'rotate-90' : ''
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {/* In-place drawer if Quick View expanded */}
                      {isExpanded && categoryJobs.length > 0 && (
                        <div className="border-t border-[#E7E2D9] bg-[#FFFFFF] p-3 space-y-2">
                          <p className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">
                            Direct Openings:
                          </p>
                          <div className="space-y-2">
                            {categoryJobs.map(job => (
                              <div
                                key={job.id}
                                onClick={() => navigateToJobDetails(job.id)}
                                className="p-2.5 border border-[#E7E2D9] hover:border-[#7A1C28] cursor-pointer bg-[#FBF9F5] transition-colors"
                              >
                                <div className="text-xs font-semibold text-[#141416] line-clamp-1">
                                  {job.role}
                                </div>
                                <div className="text-[11px] text-[#7A1C28] font-medium mt-0.5">
                                  {job.companyName} · <span className="text-[#52525B]">{job.location}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
