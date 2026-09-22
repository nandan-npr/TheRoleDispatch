import React from 'react';
import { Job } from '../../types';
import { JobCard } from '../JobCard';
import { X, ExternalLink, MapPin, Briefcase, DollarSign, Building2, CheckCircle2, Clock } from 'lucide-react';

interface JobPreviewModalProps {
  job: Job | null;
  onClose: () => void;
}

export const JobPreviewModal: React.FC<JobPreviewModalProps> = ({ job, onClose }) => {
  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#FFFFFF] border border-[#E7E2D9] shadow-2xl my-8 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E7E2D9] mb-6">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#7A1C28]">
              Administrator View Mode
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#141416]">
              Listing Preview: {job.role}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#71717A] hover:text-[#141416] border border-transparent hover:border-[#E7E2D9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Views: 1) Public Card appearance, 2) Public Detail appearance */}
        <div className="space-y-8">
          {/* Card View Preview */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#71717A] mb-3">
              1. Appearance in Job Directory (Public Card)
            </h3>
            <div className="max-w-md">
              <JobCard job={job} onClick={() => {}} />
            </div>
          </div>

          <div className="h-px bg-[#E7E2D9]" />

          {/* Full Details Page Preview */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#71717A] mb-3">
              2. Appearance on Dedicated Job Page
            </h3>

            <div className="border border-[#E7E2D9] bg-[#FAF8F5] p-6 sm:p-8">
              <div className="text-xs font-semibold text-[#7A1C28] uppercase tracking-wider mb-2">
                {job.category} · {job.workMode}
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#141416]">
                {job.role}
              </h1>

              <div className="mt-3 flex items-center gap-3">
                <span className="font-serif text-lg font-bold text-[#7A1C28]">
                  {job.companyName}
                </span>
                <span className="text-xs text-[#71717A]">· Via {job.source}</span>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 p-4 bg-[#FFFFFF] border border-[#E7E2D9] text-xs">
                <div>
                  <span className="text-[#71717A] block">Location</span>
                  <span className="font-semibold text-[#141416]">{job.location}</span>
                </div>
                <div>
                  <span className="text-[#71717A] block">Experience</span>
                  <span className="font-semibold text-[#141416]">{job.experience}</span>
                </div>
                <div>
                  <span className="text-[#71717A] block">Salary</span>
                  <span className="font-semibold text-[#141416]">{job.salary}</span>
                </div>
                <div>
                  <span className="text-[#71717A] block">Type</span>
                  <span className="font-semibold text-[#141416]">{job.jobType}</span>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6 text-sm text-[#3F3F46] leading-relaxed">
                <p className="font-semibold text-[#141416] mb-1">Description:</p>
                {job.description}
              </div>

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <div className="mt-5">
                  <p className="font-semibold text-xs text-[#141416] mb-2 uppercase">Requirements:</p>
                  <ul className="space-y-1.5 text-xs text-[#3F3F46]">
                    {job.requirements.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#7A1C28] mt-0.5 shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <div className="mt-5">
                  <p className="font-semibold text-xs text-[#141416] mb-2 uppercase">Key Skills:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.map((s, i) => (
                      <span key={i} className="text-xs px-2.5 py-0.5 bg-[#FFFFFF] border border-[#E7E2D9]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Apply button preview */}
              <div className="mt-6 pt-4 border-t border-[#E7E2D9] flex justify-between items-center">
                <span className="text-xs text-[#71717A]">
                  Target URL: <code className="text-[#7A1C28]">{job.applicationUrl}</code>
                </span>
                <button
                  type="button"
                  disabled
                  className="px-6 py-2.5 bg-[#7A1C28] text-white text-xs font-semibold tracking-wider uppercase opacity-80 cursor-not-allowed"
                >
                  APPLY NOW (Simulated)
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-[#E7E2D9] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-[#E7E2D9] bg-[#FAF8F5] hover:bg-[#FFFFFF] text-xs font-semibold tracking-wider uppercase transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
