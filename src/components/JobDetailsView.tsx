import React, { useState } from 'react';
import { useJobs } from '../context/JobContext';
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Briefcase,
  DollarSign,
  Building2,
  Clock,
  Layers,
  Globe,
  Share2,
  Check,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const JobDetailsView: React.FC = () => {
  const { selectedJob, navigateToView, navigateToCategory, publishedJobs, navigateToJobDetails } = useJobs();
  const [copied, setCopied] = useState(false);

  if (!selectedJob) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-[#141416]">Job Not Found</h2>
        <p className="mt-2 text-sm text-[#52525B]">This posting may have been updated or archived.</p>
        <button
          onClick={() => navigateToView('jobs')}
          className="mt-6 px-5 py-2.5 bg-[#7A1C28] text-white text-xs font-semibold tracking-wider uppercase"
        >
          Return to Job Listings
        </button>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Related jobs from the same category
  const relatedJobs = publishedJobs
    .filter(j => j.category === selectedJob.category && j.id !== selectedJob.id)
    .slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Editorial Breadcrumb & Navigation */}
      <div className="flex items-center justify-between border-b border-[#E7E2D9] pb-4 mb-8">
        <button
          onClick={() => navigateToView('jobs')}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#52525B] hover:text-[#7A1C28] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Job Listings</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 border border-[#E7E2D9] bg-[#FFFFFF] hover:border-[#7A1C28]/40 text-[#3F3F46] transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-[#7A1C28]" />}
            <span>{copied ? 'Link Copied' : 'Share Role'}</span>
          </button>
        </div>
      </div>

      {/* Main Job Article Structure */}
      <article className="bg-[#FFFFFF] border border-[#E7E2D9] p-6 sm:p-10 shadow-xs">
        {/* Category & Discipline Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span
            onClick={() => navigateToCategory(selectedJob.category)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7A1C28] hover:underline cursor-pointer"
          >
            <Layers className="w-3 h-3 text-[#C5A059]" />
            <span>{selectedJob.category}</span>
          </span>
          <span className="text-[#C5A059]">/</span>
          <span className="text-xs text-[#71717A]">{selectedJob.workMode}</span>
        </div>

        {/* Strong Job Title per prompt */}
        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#141416] leading-[1.15]">
          {selectedJob.role}
        </h1>

        {/* Company Name visually distinctive using burgundy/gold accent per prompt */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF8F5] border-l-4 border-[#7A1C28] border-y border-r border-[#E7E2D9]">
            <Building2 className="w-4 h-4 text-[#7A1C28]" />
            <span className="font-serif text-lg sm:text-xl font-bold text-[#7A1C28] tracking-tight">
              {selectedJob.companyName}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs text-[#52525B] font-medium pl-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
            <span>Sourced via {selectedJob.source}</span>
          </div>
        </div>

        {/* Key Job Metadata Grid - Strictly No Dates */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-[#FAF8F5] border border-[#E7E2D9]">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#71717A] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#7A1C28]" />
              <span>Location</span>
            </div>
            <div className="text-sm font-semibold text-[#141416] mt-1">
              {selectedJob.location}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#71717A] flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-[#C5A059]" />
              <span>Experience</span>
            </div>
            <div className="text-sm font-semibold text-[#141416] mt-1">
              {selectedJob.experience}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#71717A] flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-[#7A1C28]" />
              <span>Compensation</span>
            </div>
            <div className="text-sm font-semibold text-[#141416] mt-1">
              {selectedJob.salary}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#71717A] flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#C5A059]" />
              <span>Job Type</span>
            </div>
            <div className="text-sm font-semibold text-[#141416] mt-1">
              {selectedJob.jobType}
            </div>
          </div>
        </div>

        {/* Primary Action Box: APPLY NOW button */}
        <div className="mt-8 p-5 bg-[#FBF9F5] border-l-2 border-[#7A1C28] border-y border-r border-[#E7E2D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-[#141416]">
              Direct Application Route
            </h2>
            <p className="text-xs text-[#52525B] mt-0.5">
              Opens directly at {selectedJob.source} portal. No intermediary account required.
            </p>
          </div>

          <a
            id="job-apply-now-btn"
            href={selectedJob.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#7A1C28] hover:bg-[#63141F] text-white text-xs font-bold tracking-widest uppercase transition-colors shadow-xs cursor-pointer"
          >
            <span>APPLY NOW</span>
            <ExternalLink className="w-4 h-4 text-[#C5A059]" />
          </a>
        </div>

        {/* Section Divider */}
        <div className="my-10 h-px bg-[#E7E2D9]" />

        {/* Description Section */}
        <div className="space-y-8">
          <section>
            <h2 className="font-serif text-xl font-bold text-[#141416] mb-3 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#7A1C28]" />
              <span>Role Overview</span>
            </h2>
            <p className="text-sm sm:text-base text-[#3F3F46] leading-relaxed font-sans">
              {selectedJob.description}
            </p>
          </section>

          {/* Requirements List */}
          {selectedJob.requirements && selectedJob.requirements.length > 0 && (
            <section>
              <h2 className="font-serif text-xl font-bold text-[#141416] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#C5A059]" />
                <span>Qualifications & Specifications</span>
              </h2>
              <ul className="space-y-2.5">
                {selectedJob.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-[#3F3F46] leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-[#7A1C28] mt-0.5 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Technical Skills */}
          {selectedJob.skills && selectedJob.skills.length > 0 && (
            <section>
              <h2 className="font-serif text-xl font-bold text-[#141416] mb-3 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#7A1C28]" />
                <span>Targeted Competencies & Skills</span>
              </h2>
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedJob.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium px-3 py-1.5 bg-[#FAF8F5] border border-[#E7E2D9] text-[#141416]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Source & Editorial Trust Note */}
          <section className="pt-6 border-t border-[#F0EBE1]">
            <div className="flex items-start gap-3 p-4 bg-[#FAF8F5] border border-[#E7E2D9] text-xs text-[#52525B]">
              <AlertCircle className="w-4 h-4 text-[#7A1C28] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#141416] block font-semibold mb-0.5">
                  Editorial Integrity Policy
                </strong>
                The Role Dispatch indexes and verifies publicly listed vacancies directly from corporate and authorized boards ({selectedJob.source}). We do not store resumes, request phone numbers, or act as an employment agency.
              </div>
            </div>
          </section>

          {/* Secondary Apply Button */}
          <div className="pt-4 flex justify-end">
            <a
              href={selectedJob.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#7A1C28] hover:bg-[#63141F] text-white text-xs font-bold tracking-widest uppercase transition-colors shadow-xs"
            >
              <span>APPLY ON {selectedJob.source.toUpperCase()}</span>
              <ExternalLink className="w-4 h-4 text-[#C5A059]" />
            </a>
          </div>
        </div>
      </article>

      {/* Related Roles from Same Category */}
      {relatedJobs.length > 0 && (
        <section className="mt-12 border-t border-[#E7E2D9] pt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold text-[#141416]">
              More Roles in {selectedJob.category}
            </h2>
            <button
              onClick={() => navigateToCategory(selectedJob.category)}
              className="text-xs font-semibold text-[#7A1C28] hover:underline"
            >
              View all in {selectedJob.category} →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedJobs.map(rel => (
              <div
                key={rel.id}
                onClick={() => navigateToJobDetails(rel.id)}
                className="p-5 border border-[#E7E2D9] bg-[#FFFFFF] hover:border-[#7A1C28] cursor-pointer transition-all shadow-2xs"
              >
                <div className="font-serif text-base font-bold text-[#141416] line-clamp-2">
                  {rel.role}
                </div>
                <div className="mt-2 text-xs font-semibold text-[#7A1C28]">
                  {rel.companyName}
                </div>
                <div className="mt-3 pt-3 border-t border-[#F0EBE1] text-xs text-[#52525B] flex items-center justify-between">
                  <span>{rel.location}</span>
                  <span>{rel.experience}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
