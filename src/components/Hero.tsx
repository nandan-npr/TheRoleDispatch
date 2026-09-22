import React, { useState } from 'react';
import { useJobs } from '../context/JobContext';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import { JobCategory } from '../types';

export const Hero: React.FC = () => {
  const { filters, setFilters, navigateToView, navigateToCategory } = useJobs();
  const [titleInput, setTitleInput] = useState(filters.searchQuery);
  const [locationInput, setLocationInput] = useState(filters.locationQuery);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFilters(prev => ({
      ...prev,
      searchQuery: titleInput,
      locationQuery: locationInput
    }));
    navigateToView('jobs');
  };

  const quickCategories: { label: string; cat: JobCategory }[] = [
    { label: 'IT Fresher', cat: 'IT Fresher' },
    { label: 'IT Experienced', cat: 'IT Experienced' },
    { label: 'ECE & Embedded', cat: 'ECE' },
    { label: 'Mechanical', cat: 'Mechanical' },
    { label: 'Civil Structures', cat: 'Civil' },
    { label: 'Diploma - CSE', cat: 'Diploma - CSE' }
  ];

  return (
    <section className="relative pt-12 pb-14 sm:pt-16 sm:pb-20 border-b border-[#E7E2D9] bg-[#FBF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Sub-Masthead Indicator */}
        <div className="flex items-center gap-3 mb-6">
          <span className="h-px w-8 bg-[#7A1C28]" />
          <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#7A1C28]">
            Curated Direct Openings
          </span>
          <span className="h-px flex-1 max-w-[120px] bg-[#E7E2D9]" />
        </div>

        {/* Large Headline per prompt */}
        <div className="max-w-4xl">
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#141416] leading-[1.08]">
            FIND THE JOB.
            <br />
            <span className="text-[#7A1C28]">NOT THE NOISE.</span>
          </h1>

          {/* Two small supporting lines/quotes per prompt */}
          <div className="mt-6 sm:mt-8 space-y-2 border-l-2 border-[#C5A059] pl-4 sm:pl-5 text-sm sm:text-base text-[#3F3F46] font-medium leading-relaxed">
            <p className="italic">“Real opportunities. Direct applications.”</p>
            <p className="italic text-[#52525B]">“Find the role. Know the details. Apply where it matters.”</p>
          </div>
        </div>

        {/* Strong Search Section immediately underneath */}
        <div className="mt-10 sm:mt-12 max-w-4xl">
          <form
            onSubmit={handleSearch}
            className="border border-[#D6CFC3] bg-[#FFFFFF] shadow-[0_4px_24px_-6px_rgba(20,20,22,0.06)] p-2 sm:p-2.5 flex flex-col md:flex-row gap-2"
          >
            {/* Search job title */}
            <div className="relative flex-1 flex items-center border-b md:border-b-0 md:border-r border-[#E7E2D9] px-3 py-2.5">
              <Search className="w-4 h-4 text-[#7A1C28] mr-2.5 shrink-0" />
              <input
                id="hero-search-title"
                type="text"
                placeholder="Search job title, skills, or role..."
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                className="w-full bg-transparent text-sm sm:text-base text-[#141416] placeholder-[#71717A] focus:outline-none"
              />
            </div>

            {/* Location */}
            <div className="relative flex-1 flex items-center px-3 py-2.5">
              <MapPin className="w-4 h-4 text-[#C5A059] mr-2.5 shrink-0" />
              <input
                id="hero-search-location"
                type="text"
                placeholder="Location (e.g. Bangalore, Pune, Remote)..."
                value={locationInput}
                onChange={e => setLocationInput(e.target.value)}
                className="w-full bg-transparent text-sm sm:text-base text-[#141416] placeholder-[#71717A] focus:outline-none"
              />
            </div>

            {/* SEARCH JOBS BUTTON */}
            <button
              id="hero-submit-search"
              type="submit"
              className="bg-[#7A1C28] hover:bg-[#63141F] text-[#FFFFFF] px-6 py-3 text-xs sm:text-sm font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs whitespace-nowrap"
            >
              <span>SEARCH JOBS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Subtle category/filter shortcuts below search */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#71717A] font-medium tracking-wide uppercase text-[11px] mr-1">
              Curated Streams:
            </span>
            {quickCategories.map(item => (
              <button
                key={item.cat}
                type="button"
                onClick={() => navigateToCategory(item.cat)}
                className="px-2.5 py-1 rounded-xs border border-[#E7E2D9] bg-[#FFFFFF]/80 hover:bg-[#FFFFFF] hover:border-[#7A1C28]/60 text-[#3F3F46] hover:text-[#7A1C28] transition-all cursor-pointer font-medium"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
