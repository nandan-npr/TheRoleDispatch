import React, { useState } from 'react';
import { useJobs } from '../context/JobContext';
import { Search, Menu, X, ArrowRight, Shield } from 'lucide-react';

interface NavbarProps {
  onOpenAdminLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAdminLogin }) => {
  const { currentView, navigateToView, publishedJobs, isAdminAuthenticated } = useJobs();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view: 'home' | 'jobs' | 'categories' | 'admin') => {
    navigateToView(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#E7E2D9] transition-all">
      {/* Editorial top rule with dual accent line */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#7A1C28] via-[#C5A059] to-[#7A1C28]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Logo / Publication Masthead */}
          <div
            id="nav-logo-brand"
            onClick={() => handleNav('home')}
            className="cursor-pointer group flex flex-col justify-center"
          >
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#141416] group-hover:text-[#7A1C28] transition-colors">
                THE ROLE DISPATCH
              </span>
              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
            </div>
            <p className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#7A1C28] mt-0.5">
              Verified Direct Career Publication
            </p>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              id="nav-link-jobs"
              onClick={() => handleNav('jobs')}
              className={`text-sm font-medium tracking-wide transition-colors relative py-1 ${
                currentView === 'jobs'
                  ? 'text-[#7A1C28] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#7A1C28]'
                  : 'text-[#3F3F46] hover:text-[#141416]'
              }`}
            >
              Jobs
              <span className="ml-1.5 text-[11px] font-sans px-1.5 py-0.5 rounded bg-[#F0EBE1] text-[#52525B]">
                {publishedJobs.length}
              </span>
            </button>

            <button
              id="nav-link-categories"
              onClick={() => handleNav('categories')}
              className={`text-sm font-medium tracking-wide transition-colors relative py-1 ${
                currentView === 'categories'
                  ? 'text-[#7A1C28] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#7A1C28]'
                  : 'text-[#3F3F46] hover:text-[#141416]'
              }`}
            >
              Categories
            </button>

            <button
              id="nav-link-search"
              onClick={() => handleNav('jobs')}
              className="flex items-center gap-2 text-sm font-medium text-[#3F3F46] hover:text-[#7A1C28] px-3.5 py-1.5 rounded-sm border border-[#E7E2D9] bg-[#FFFFFF] hover:border-[#7A1C28]/40 transition-all shadow-xs"
            >
              <Search className="w-3.5 h-3.5 text-[#7A1C28]" />
              <span>Search Directory</span>
            </button>

            {/* If admin is authenticated, show active session indicator (discreet, not public promo) */}
            {isAdminAuthenticated && (
              <button
                id="nav-link-admin-active"
                onClick={() => handleNav('admin')}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded bg-[#7A1C28]/10 text-[#7A1C28] border border-[#7A1C28]/20 hover:bg-[#7A1C28]/20 transition-colors"
                title="Editor Session Active"
              >
                <Shield className="w-3 h-3" />
                <span>Desk Active</span>
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="mobile-search-btn"
              onClick={() => handleNav('jobs')}
              className="p-2 text-[#3F3F46] hover:text-[#141416]"
              aria-label="Search jobs"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#3F3F46] hover:text-[#141416] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E7E2D9] bg-[#FFFFFF] px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <button
            id="mobile-nav-jobs"
            onClick={() => handleNav('jobs')}
            className="flex items-center justify-between w-full py-2.5 text-left text-base font-medium text-[#141416] border-b border-[#F0EBE1]"
          >
            <span>Job Listings</span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#F0EBE1] text-[#52525B]">
              {publishedJobs.length} active
            </span>
          </button>

          <button
            id="mobile-nav-categories"
            onClick={() => handleNav('categories')}
            className="flex items-center justify-between w-full py-2.5 text-left text-base font-medium text-[#141416] border-b border-[#F0EBE1]"
          >
            <span>Browse Categories</span>
            <ArrowRight className="w-4 h-4 text-[#7A1C28]" />
          </button>

          <button
            id="mobile-nav-search"
            onClick={() => handleNav('jobs')}
            className="flex items-center gap-2 w-full py-2.5 text-left text-base font-medium text-[#7A1C28]"
          >
            <Search className="w-4 h-4" />
            <span>Search All Openings</span>
          </button>

          {isAdminAuthenticated && (
            <button
              onClick={() => handleNav('admin')}
              className="flex items-center gap-2 w-full py-2 text-left text-sm font-semibold text-[#7A1C28] bg-[#7A1C28]/5 px-3 rounded"
            >
              <Shield className="w-4 h-4" />
              <span>Editorial Desk</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
