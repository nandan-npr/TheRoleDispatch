import React from 'react';
import { Job } from '../types';
import { MapPin, Briefcase } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onClick: () => void;
  id?: string;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onClick, id }) => {
  return (
    <div
      id={id || `job-card-${job.id}`}
      onClick={onClick}
      className="group relative cursor-pointer border border-[#E7E2D9] bg-[#FFFFFF] p-5 sm:p-6 transition-all duration-200 hover:border-[#7A1C28]/40 hover:shadow-[0_4px_20px_-4px_rgba(20,20,22,0.06)] flex flex-col justify-between"
    >
      {/* Top accent bar on hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-transparent group-hover:bg-[#7A1C28] transition-colors duration-200" />

      <div>
        {/* Job Role */}
        <h3 className="font-serif text-lg sm:text-xl font-medium tracking-tight text-[#141416] group-hover:text-[#7A1C28] transition-colors line-clamp-2">
          {job.role}
        </h3>

        {/* Company Name with subtle visual highlight using site's accent color (dark red / gold) */}
        <div className="mt-2.5 inline-block">
          <span className="inline-flex items-center text-xs font-semibold tracking-wider uppercase text-[#7A1C28] border-b border-[#C5A059]/40 pb-0.5">
            {job.companyName}
          </span>
        </div>
      </div>

      {/* Location & Experience ONLY - Clean & disciplined per editorial mandate */}
      <div className="mt-5 pt-4 border-t border-[#F0EBE1] flex flex-wrap items-center justify-between gap-y-2 text-xs text-[#52525B]">
        <div className="flex items-center gap-1.5 font-medium text-[#3F3F46]">
          <MapPin className="w-3.5 h-3.5 text-[#7A1C28]/70 shrink-0" />
          <span>{job.location}</span>
        </div>

        <div className="flex items-center gap-1.5 font-medium text-[#3F3F46]">
          <Briefcase className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
          <span>{job.experience}</span>
        </div>
      </div>
    </div>
  );
};
