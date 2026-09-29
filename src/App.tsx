/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { JobProvider, useJobs, parseRouteFromUrl } from './context/JobContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { JobListingsView } from './components/JobListingsView';
import { CategoriesView } from './components/CategoriesView';
import { JobDetailsView } from './components/JobDetailsView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { ContactView } from './components/ContactView';

const AppContent: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    authStatus,
    isAdminAuthenticated,
    isAuthChecking,
    setSelectedJobId,
    logoutAdmin
  } = useJobs();

  const currentViewRef = React.useRef(currentView);
  useEffect(() => {
    currentViewRef.current = currentView;
  }, [currentView]);

  // Listen to popstate and hashchange strictly for user browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const prevView = currentViewRef.current;
      const route = parseRouteFromUrl();
      setSelectedJobId(route.jobId);

      // If user was on admin dashboard and navigated away via browser Back/Forward to a public view:
      // IMMEDIATELY log out and invalidate the session!
      if (prevView === 'admin' && route.view !== 'admin') {
        console.log('[AUTH] Browser Back/Forward away from admin dashboard -> logging out');
        logoutAdmin(window.location.pathname);
        setCurrentView(route.view);
        return;
      }

      // If user is trying to navigate to admin dashboard via Back/Forward but is NOT authenticated:
      // Redirect to /admin/login immediately!
      if (route.view === 'admin' && authStatus !== 'authenticated') {
        console.log('[AUTH] Blocked unauthenticated attempt to access admin dashboard -> redirecting to /admin/login');
        window.history.replaceState(null, '', '/admin/login');
        setCurrentView('admin-login');
        return;
      }

      setCurrentView(route.view);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, [authStatus, logoutAdmin, setCurrentView, setSelectedJobId]);

  // Guard admin URLs: whenever unauthenticated, never allow staying on /admin/dashboard
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      const path = window.location.pathname.toLowerCase();
      if ((path === '/admin' || path.startsWith('/admin/')) && path !== '/admin/login') {
        window.history.replaceState(null, '', '/admin/login');
        setCurrentView('admin-login');
      }
    }
  }, [authStatus, setCurrentView]);

  // Handle page exit/unload when on admin dashboard
  useEffect(() => {
    const handlePageExit = () => {
      if (currentViewRef.current === 'admin') {
        try {
          navigator.sendBeacon('/api/admin/logout');
          sessionStorage.removeItem('the_role_dispatch_admin_token');
        } catch {
          // silent
        }
      }
    };

    window.addEventListener('pagehide', handlePageExit);
    return () => {
      window.removeEventListener('pagehide', handlePageExit);
    };
  }, []);

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
        {currentView === 'contact' && <ContactView />}
        {currentView === 'admin-login' && <AdminLoginPage />}
        {currentView === 'admin' && (
          isAuthChecking ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-[#7A1C28] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs uppercase font-mono tracking-widest text-[#71717A]">
                Verifying editorial session...
              </span>
            </div>
          ) : isAdminAuthenticated ? (
            <AdminDashboard />
          ) : (
            <AdminLoginPage />
          )
        )}
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
