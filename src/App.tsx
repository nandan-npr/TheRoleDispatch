/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useCallback } from 'react';
import { JobProvider, useJobs } from './context/JobContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { JobListingsView } from './components/JobListingsView';
import { CategoriesView } from './components/CategoriesView';
import { JobDetailsView } from './components/JobDetailsView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginPage } from './components/admin/AdminLoginPage';

const AppContent: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    navigateToJobDetails,
    isAdminAuthenticated,
    selectedJobId
  } = useJobs();

  // Helper to extract clean route from pathname or hash
  const resolveRoute = useCallback(() => {
    const rawPath = window.location.pathname.toLowerCase();
    const rawHash = window.location.hash.replace(/^#\/?/, '').toLowerCase();

    // Priority: hash if explicitly present and non-empty, otherwise pathname
    const active = rawHash || (rawPath.startsWith('/') && rawPath !== '/' ? rawPath.slice(1) : '');

    // 1. Admin Login route: /admin/login or #admin/login
    if (active === 'admin/login' || active.startsWith('admin/login')) {
      if (isAdminAuthenticated) {
        // If already logged in, redirect to admin dashboard
        window.history.replaceState(null, '', '/admin/dashboard');
        window.location.hash = 'admin/dashboard';
        setCurrentView('admin');
      } else {
        setCurrentView('admin-login');
      }
      return;
    }

    // 2. Any other Admin routes: /admin, /admin/dashboard, /admin/jobs, /admin/jobs/new, /admin/jobs/edit
    if (active === 'admin' || active.startsWith('admin/')) {
      if (!isAdminAuthenticated) {
        // STRICT PROTECTION: Redirect unauthenticated requests to /admin/login
        window.history.replaceState(null, '', '/admin/login');
        window.location.hash = 'admin/login';
        setCurrentView('admin-login');
      } else {
        setCurrentView('admin');
      }
      return;
    }

    // 3. Public Job Details: /job/:id or #job/:id
    if (active.startsWith('job/')) {
      const jobId = active.replace('job/', '').split('/')[0];
      if (jobId) {
        navigateToJobDetails(jobId);
        return;
      }
    }

    // 4. Public Job Listings: /jobs or #jobs
    if (active === 'jobs') {
      setCurrentView('jobs');
      return;
    }

    // 5. Public Categories: /categories or #categories
    if (active === 'categories') {
      setCurrentView('categories');
      return;
    }

    // 6. Default Home View: / or #home
    setCurrentView('home');
  }, [isAdminAuthenticated, navigateToJobDetails, setCurrentView]);

  // Listen to popstate and hashchange for browser navigation & deep linking
  useEffect(() => {
    resolveRoute();
    window.addEventListener('hashchange', resolveRoute);
    window.addEventListener('popstate', resolveRoute);

    return () => {
      window.removeEventListener('hashchange', resolveRoute);
      window.removeEventListener('popstate', resolveRoute);
    };
  }, [resolveRoute]);

  // Sync window URL and hash when currentView changes
  useEffect(() => {
    if (currentView === 'home') {
      if (window.location.hash && window.location.hash !== '#home') {
        window.history.replaceState(null, '', '/');
      }
    } else if (currentView === 'jobs') {
      if (!window.location.hash.includes('jobs')) {
        window.location.hash = 'jobs';
      }
    } else if (currentView === 'categories') {
      if (!window.location.hash.includes('categories')) {
        window.location.hash = 'categories';
      }
    } else if (currentView === 'job-details' && selectedJobId) {
      window.location.hash = `job/${selectedJobId}`;
    } else if (currentView === 'admin-login') {
      if (!window.location.hash.includes('admin/login')) {
        window.location.hash = 'admin/login';
      }
    } else if (currentView === 'admin') {
      if (!isAdminAuthenticated) {
        // Enforce protection if view switched to admin without authentication
        setCurrentView('admin-login');
        window.location.hash = 'admin/login';
        return;
      }
      if (!window.location.hash.includes('admin')) {
        window.location.hash = 'admin/dashboard';
      }
    }
  }, [currentView, selectedJobId, isAdminAuthenticated, setCurrentView]);

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#141416] flex flex-col font-sans selection:bg-[#7A1C28]/15 selection:text-[#7A1C28]">
      {/* Editorial Navbar */}
      <Navbar />

      {/* Main View Display */}
      <main className="flex-1">
        {currentView === 'home' && <HomeView />}
        {currentView === 'jobs' && <JobListingsView />}
        {currentView === 'categories' && <CategoriesView />}
        {currentView === 'job-details' && <JobDetailsView />}
        {currentView === 'admin-login' && <AdminLoginPage />}
        {currentView === 'admin' && isAdminAuthenticated && <AdminDashboard />}
      </main>

      {/* Footer with Editorial Colophon and discreet Admin Access */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <JobProvider>
      <AppContent />
    </JobProvider>
  );
}
