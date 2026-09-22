import React from 'react';
import { useJobs } from '../context/JobContext';
import { Hero } from './Hero';
import { JobCard } from './JobCard';
import { CATEGORY_STRUCTURE } from '../data/categories';
import { ArrowRight, Sparkles, Building2, CheckCircle, ShieldCheck } from 'lucide-react';

export const HomeView: React.FC = () => {
  const { publishedJobs, navigateToJobDetails, navigateToView, navigateToCategory } = useJobs();

  // Highlighted first 6 published jobs for immediate discovery on homepage
  const featuredJobs = publishedJobs.slice(0, 6);

  return (
    <div>
      {/* Editorial Hero per exact requirements */}
      <Hero />

      {/* Immediate Job Discovery Area Underneath Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#E7E2D9] pb-4 mb-8 gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7A1C28] mb-1">
              Active Gazette
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#141416]">
              Featured Career Vacancies
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#52525B]">
              Direct applications verified from corporate career endpoints.
            </p>
          </div>

          <button
            onClick={() => navigateToView('jobs')}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7A1C28] hover:underline"
          >
            <span>View All {publishedJobs.length} Listings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Clean Job Cards Grid - strictly Role, Company, Location, Experience */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onClick={() => navigateToJobDetails(job.id)}
            />
          ))}
        </div>

        {/* Bottom CTA to see complete listings */}
        <div className="mt-10 text-center">
          <button
            id="home-view-all-jobs-btn"
            onClick={() => navigateToView('jobs')}
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#FAF8F5] hover:bg-[#FFFFFF] border border-[#E7E2D9] hover:border-[#7A1C28] text-xs font-semibold tracking-wider uppercase text-[#141416] transition-all shadow-2xs"
          >
            <span>Explore Full Job Listings Registry</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#7A1C28]" />
          </button>
        </div>
      </section>

      {/* Discipline Architecture Spotlight */}
      <section className="border-t border-[#E7E2D9] bg-[#FAF8F5] py-14 sm:py-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7A1C28] mb-1">
              Rigorous Taxonomy
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#141416]">
              Browse by Strict Discipline
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#52525B] leading-relaxed">
              Every opening is cataloged into one distinct specialty. Explore dedicated registers for degree holders and polytechnic technicians.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {CATEGORY_STRUCTURE.map(group => {
              const count = publishedJobs.filter(j =>
                group.subcategories.some(sub => sub.name === j.category)
              ).length;

              return (
                <div
                  key={group.group}
                  className="bg-[#FFFFFF] border border-[#E7E2D9] p-6 flex flex-col justify-between hover:border-[#7A1C28]/40 transition-colors shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-[#7A1C28] font-bold uppercase">
                        Stream
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 bg-[#FAF8F5] border border-[#E7E2D9] text-[#52525B]">
                        {count} {count === 1 ? 'Role' : 'Roles'}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-[#141416] mt-3">
                      {group.group}
                    </h3>

                    <p className="text-xs text-[#52525B] mt-2 line-clamp-2">
                      {group.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-[#F0EBE1] space-y-1">
                      {group.subcategories.slice(0, 3).map(sub => (
                        <div
                          key={sub.name}
                          onClick={() => navigateToCategory(sub.name)}
                          className="text-[11px] text-[#3F3F46] hover:text-[#7A1C28] cursor-pointer truncate"
                        >
                          · {sub.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => navigateToView('categories')}
                    className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[#7A1C28] hover:underline"
                  >
                    <span>View stream specs</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Editorial Standards Section */}
      <section className="border-t border-[#E7E2D9] bg-[#FFFFFF] py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7A1C28] mb-1">
                The Editorial Guarantee
              </div>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-[#141416]">
                Curated for Candidates. Direct to Employers.
              </h2>
              <p className="mt-4 text-xs sm:text-sm text-[#52525B] leading-relaxed">
                Aggregator platforms are filled with ghost job listings, duplicate reposts, automated scrapers, and mandatory registration funnels. The Role Dispatch operates with traditional publication discipline:
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-[#7A1C28] mt-0.5 shrink-0" />
                  <div className="text-xs text-[#3F3F46]">
                    <strong className="text-[#141416]">Strictly No Intermediary Applications:</strong> Every job card leads directly to the official enterprise ATS (Workday, Careers, LinkedIn).
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-[#7A1C28] mt-0.5 shrink-0" />
                  <div className="text-xs text-[#3F3F46]">
                    <strong className="text-[#141416]">Single Categorization Guarantee:</strong> No cross-posted duplicates cluttering multiple departments.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-[#7A1C28] mt-0.5 shrink-0" />
                  <div className="text-xs text-[#3F3F46]">
                    <strong className="text-[#141416]">Zero Resume Harvesting:</strong> We do not store candidate CVs, telephone numbers, or profile information.
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-[#E7E2D9] bg-[#FAF8F5] p-8 border-l-4 border-l-[#7A1C28]">
              <h3 className="font-serif text-lg font-bold text-[#141416]">
                Publication Notice
              </h3>
              <p className="mt-3 text-xs text-[#52525B] leading-relaxed">
                “Find the role. Know the details. Apply where it matters.” All listings in this directory are selected and maintained manually by the editorial board.
              </p>
              <div className="mt-6 pt-4 border-t border-[#E7E2D9] flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-[#71717A]">
                  Active Entries: {publishedJobs.length}
                </span>
                <button
                  onClick={() => navigateToView('jobs')}
                  className="px-4 py-2 bg-[#7A1C28] text-white text-[11px] font-semibold tracking-wider uppercase"
                >
                  Explore Listings
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
