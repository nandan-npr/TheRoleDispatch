import React from 'react';
import { useJobs } from '../context/JobContext';
import { Shield, ArrowUpRight, CheckCircle, ExternalLink } from 'lucide-react';

interface FooterProps {
  onOpenAdminLogin?: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  const { navigateToView, navigateToCategory } = useJobs();

  return (
    <footer className="mt-20 border-t border-[#E7E2D9] bg-[#F4F0E8] text-[#141416]">
      {/* Editorial Principles Strip */}
      <div className="border-b border-[#E7E2D9] bg-[#FAF8F5] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#3F3F46]">
            <div className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7A1C28] mt-1.5 shrink-0" />
              <div>
                <strong className="text-[#141416] block font-serif text-sm font-semibold mb-1">
                  100% Direct Application Links
                </strong>
                Every vacancy connects directly to the official enterprise or hiring portal. No internal forms or resume harvesting.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] mt-1.5 shrink-0" />
              <div>
                <strong className="text-[#141416] block font-serif text-sm font-semibold mb-1">
                  Strict Single Categorization
                </strong>
                Each role belongs to exactly one discipline without duplicates or cross-posting spam.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7A1C28] mt-1.5 shrink-0" />
              <div>
                <strong className="text-[#141416] block font-serif text-sm font-semibold mb-1">
                  No Registration Walls
                </strong>
                No accounts, passwords, or personal profiles. Job seekers search, review, and apply directly.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand & Editorial Mission */}
          <div className="md:col-span-5 space-y-3">
            <div className="font-serif text-2xl font-bold tracking-tight text-[#141416]">
              THE ROLE DISPATCH
            </div>
            <p className="text-xs text-[#52525B] leading-relaxed max-w-sm">
              An independent, curated career publication cutting through the algorithmic noise of modern recruitment aggregators.
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#7A1C28]">
              Published daily for engineers, technicians, and technical leaders.
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#7A1C28]">
              Directory Index
            </div>
            <ul className="space-y-2 text-xs text-[#3F3F46]">
              <li>
                <button
                  onClick={() => navigateToView('jobs')}
                  className="hover:text-[#7A1C28] hover:underline"
                >
                  All Job Listings
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToView('categories')}
                  className="hover:text-[#7A1C28] hover:underline"
                >
                  Browse Disciplines
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToCategory('IT Fresher')}
                  className="hover:text-[#7A1C28] hover:underline"
                >
                  IT Fresher Vacancies
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToCategory('ECE')}
                  className="hover:text-[#7A1C28] hover:underline"
                >
                  Electronics & Embedded
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToCategory('Mechanical')}
                  className="hover:text-[#7A1C28] hover:underline"
                >
                  Mechanical Design & Tooling
                </button>
              </li>
            </ul>
          </div>

          {/* Polytechnic & Other Disciplines */}
          <div className="md:col-span-4 space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#7A1C28]">
              Polytechnic Diploma Streams
            </div>
            <ul className="space-y-2 text-xs text-[#3F3F46]">
              <li>
                <button
                  onClick={() => navigateToCategory('Diploma - CSE')}
                  className="hover:text-[#7A1C28] hover:underline"
                >
                  Diploma - Computer Science & Network
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToCategory('Diploma - Mechanical')}
                  className="hover:text-[#7A1C28] hover:underline"
                >
                  Diploma - Mechanical & CNC Tooling
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToCategory('Diploma - ECE')}
                  className="hover:text-[#7A1C28] hover:underline"
                >
                  Diploma - Electronics & SMT Testing
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToCategory('Civil')}
                  className="hover:text-[#7A1C28] hover:underline"
                >
                  Civil Infrastructure & Structural
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Colophon & Discreet Admin Trigger */}
        <div className="mt-12 pt-6 border-t border-[#E7E2D9] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#71717A] gap-3">
          <div>
            © {new Date().getFullYear()} The Role Dispatch. Authentic listings curated from verified corporate endpoints.
          </div>

          {/* Discreet Admin Access Trigger */}
          <div className="flex items-center gap-4">
            <button
              id="footer-admin-login-trigger"
              onClick={() => navigateToView('admin')}
              className="hover:text-[#7A1C28] flex items-center gap-1.5 transition-colors cursor-pointer text-[#71717A]"
              title="Restricted publication management"
            >
              <Shield className="w-3 h-3 text-[#7A1C28]" />
              <span>Editorial Desk</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
