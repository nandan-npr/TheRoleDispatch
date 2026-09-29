import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Job, JobFilters, JobStatus, JobCategory } from '../types';
import { SEED_JOBS } from '../data/seedJobs';
import { authService } from '../services/authService';
import { feedbackService } from '../services/feedbackService';

export type ViewType = 'home' | 'jobs' | 'categories' | 'job-details' | 'admin' | 'admin-login' | 'contact';
export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

export function parseRouteFromUrl(): { view: ViewType; jobId: string | null } {
  if (typeof window === 'undefined') return { view: 'home', jobId: null };
  const rawPath = window.location.pathname.toLowerCase();
  const rawHash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  const active = rawHash || (rawPath.startsWith('/') && rawPath !== '/' ? rawPath.slice(1) : '');

  if (active === 'contact' || active.startsWith('contact')) {
    return { view: 'contact', jobId: null };
  }
  if (active === 'admin/login' || active.startsWith('admin/login')) {
    return { view: 'admin-login', jobId: null };
  }
  if (active === 'admin' || active.startsWith('admin/')) {
    const hasToken = typeof window !== 'undefined' && Boolean(sessionStorage.getItem('the_role_dispatch_admin_token'));
    if (!hasToken) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/admin/login') {
        window.history.replaceState(null, '', '/admin/login');
      }
      return { view: 'admin-login', jobId: null };
    }
    return { view: 'admin', jobId: null };
  }
  if (active.startsWith('job/')) {
    const jobId = active.replace('job/', '').split('/')[0];
    return { view: 'job-details', jobId: jobId || null };
  }
  if (active === 'jobs') {
    return { view: 'jobs', jobId: null };
  }
  if (active === 'categories') {
    return { view: 'categories', jobId: null };
  }
  return { view: 'home', jobId: null };
}

interface JobContextType {
  jobs: Job[];
  publishedJobs: Job[];
  currentView: ViewType;
  selectedJobId: string | null;
  setSelectedJobId: (id: string | null) => void;
  selectedJob: Job | null;
  filters: JobFilters;
  authStatus: AuthStatus;
  isAdminAuthenticated: boolean;
  isAuthChecking: boolean;
  selectedCategoryForBrowse: JobCategory | null;
  
  // Navigation
  setCurrentView: (view: ViewType) => void;
  navigateToJobDetails: (jobId: string) => void;
  navigateToCategory: (category: JobCategory) => void;
  navigateToView: (view: ViewType) => void;
  
  // Filters
  setFilters: React.Dispatch<React.SetStateAction<JobFilters>>;
  updateFilter: <K extends keyof JobFilters>(key: K, value: JobFilters[K]) => void;
  clearFilters: () => void;
  
  // Job actions (Admin)
  addJob: (job: Omit<Job, 'id' | 'orderIndex'>) => string;
  updateJob: (id: string, jobData: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  deleteMultipleJobs: (ids: string[]) => void;
  setJobStatus: (id: string, status: JobStatus) => void;
  setMultipleJobStatus: (ids: string[], status: JobStatus) => void;
  resetToSeedData: () => void;
  
  // Admin Auth & Feedback
  loginAdmin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: (redirectUrl?: string) => Promise<void>;
  checkAdminAuth: () => Promise<boolean>;
  unreadFeedbackCount: number;
  setUnreadFeedbackCount: React.Dispatch<React.SetStateAction<number>>;
  refreshFeedbackCount: () => Promise<void>;
}

const STORAGE_KEY = 'the_role_dispatch_jobs_v2';

const DEFAULT_FILTERS: JobFilters = {
  searchQuery: '',
  locationQuery: '',
  experience: 'ALL',
  salaryRange: 'ALL',
  category: 'ALL',
  workMode: 'ALL',
  jobType: 'ALL',
  source: 'ALL',
  sortBy: 'relevance'
};

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return SEED_JOBS;
  });

  const initialRoute = parseRouteFromUrl();
  const [currentView, setCurrentView] = useState<ViewType>(initialRoute.view);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(initialRoute.jobId);
  const [filters, setFilters] = useState<JobFilters>(DEFAULT_FILTERS);
  const [selectedCategoryForBrowse, setSelectedCategoryForBrowse] = useState<JobCategory | null>(null);

  // Strict 3-state authentication state model
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');
  const authSequenceRef = useRef<number>(0);

  // Helper flags
  const isAdminAuthenticated = authStatus === 'authenticated';
  const isAuthChecking = authStatus === 'checking';

  // Feedback unread count state for admin navigation
  const [unreadFeedbackCount, setUnreadFeedbackCount] = useState<number>(0);

  const refreshFeedbackCount = useCallback(async () => {
    if (authStatus !== 'authenticated') return;
    try {
      const res = await feedbackService.getAdminFeedback();
      if (res.success && res.stats) {
        setUnreadFeedbackCount(res.stats.unread);
      }
    } catch {
      // silent
    }
  }, [authStatus]);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      refreshFeedbackCount();
    } else {
      setUnreadFeedbackCount(0);
    }
  }, [authStatus, refreshFeedbackCount]);

  // Validate session with server on initial app mount ONLY if starting on an admin route with active token
  useEffect(() => {
    const route = parseRouteFromUrl();
    const hasToken = Boolean(authService.getAuthToken());

    if (route.view !== 'admin' || !hasToken) {
      setAuthStatus('unauthenticated');
      return;
    }

    let isMounted = true;
    const seq = ++authSequenceRef.current;
    console.log('[AUTH] verify started: admin startup (seq:', seq, ')');

    authService.verifySession().then(isValid => {
      if (!isMounted) return;
      if (seq !== authSequenceRef.current) return;
      console.log('[AUTH] verify result:', isValid);
      console.log('[AUTH] authentication state changed:', isValid ? 'authenticated' : 'unauthenticated');
      if (isValid) {
        setAuthStatus('authenticated');
      } else {
        setAuthStatus('unauthenticated');
        setCurrentView('admin-login');
        if (window.location.pathname !== '/admin/login') {
          window.history.replaceState(null, '', '/admin/login');
        }
      }
    }).catch(() => {
      if (isMounted && seq === authSequenceRef.current) {
        console.log('[AUTH] verify result: false (error)');
        setAuthStatus('unauthenticated');
        setCurrentView('admin-login');
        if (window.location.pathname !== '/admin/login') {
          window.history.replaceState(null, '', '/admin/login');
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Invalidate admin session on server and client
  const logoutAdmin = useCallback(async (redirectUrl?: string) => {
    console.log('[AUTH] logout called');
    ++authSequenceRef.current;
    setAuthStatus('unauthenticated');
    setUnreadFeedbackCount(0);
    try {
      await authService.logout();
    } catch {
      // silent
    }
    const finalUrl = redirectUrl !== undefined ? redirectUrl : '/admin/login';
    if (finalUrl === '/admin/login') {
      setCurrentView('admin-login');
    }
    if (typeof window !== 'undefined' && finalUrl && window.location.pathname !== finalUrl) {
      window.history.replaceState(null, '', finalUrl);
    }
  }, []);

  // Backup sync to localStorage when jobs change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    } catch (e) {
      console.error('Failed to persist jobs to localStorage:', e);
    }
  }, [jobs]);

  // Derived list of published jobs for public views - Strictly only PUBLISHED
  const publishedJobs = jobs.filter(job => job.status === 'PUBLISHED');

  const selectedJob = selectedJobId ? jobs.find(j => j.id === selectedJobId) || null : null;

  const navigateToJobDetails = useCallback((jobId: string) => {
    if (currentView === 'admin') {
      logoutAdmin('/job/' + jobId);
    }
    setSelectedJobId(jobId);
    setCurrentView('job-details');
    const targetUrl = `/job/${jobId}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState(null, '', targetUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, logoutAdmin]);

  const navigateToCategory = useCallback((category: JobCategory) => {
    if (currentView === 'admin') {
      logoutAdmin('/jobs');
    }
    setSelectedCategoryForBrowse(category);
    setFilters(prev => ({ ...prev, category }));
    setCurrentView('jobs');
    if (window.location.pathname !== '/jobs') {
      window.history.pushState(null, '', '/jobs');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, logoutAdmin]);

  const navigateToView = useCallback((view: ViewType) => {
    if (view !== 'job-details') {
      setSelectedJobId(null);
    }

    let targetView = view;
    let targetUrl = '/';

    if (view === 'home') {
      targetUrl = '/';
    } else if (view === 'jobs') {
      targetUrl = '/jobs';
    } else if (view === 'categories') {
      targetUrl = '/categories';
    } else if (view === 'contact') {
      targetView = 'contact';
      targetUrl = '/contact';
    } else if (view === 'admin') {
      if (authStatus === 'authenticated') {
        targetView = 'admin';
        targetUrl = '/admin/dashboard';
      } else {
        targetView = 'admin-login';
        targetUrl = '/admin/login';
      }
    } else if (view === 'admin-login') {
      targetView = 'admin-login';
      targetUrl = '/admin/login';
    }

    // CRITICAL: If leaving the admin dashboard to ANY other view (public or login),
    // immediately log out and invalidate the session on server & client!
    if (currentView === 'admin' && targetView !== 'admin') {
      console.log('[AUTH] Leaving admin dashboard via navigateToView -> immediate session logout');
      logoutAdmin(targetUrl);
    }

    setCurrentView(targetView);
    if (window.location.pathname !== targetUrl) {
      window.history.pushState(null, '', targetUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [authStatus, currentView, logoutAdmin]);

  const updateFilter = <K extends keyof JobFilters>(key: K, value: JobFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSelectedCategoryForBrowse(null);
  };

  const addJob = (jobData: Omit<Job, 'id' | 'orderIndex'>): string => {
    const newId = `job-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setJobs(prev => {
      const nextIndex = prev.length > 0 ? Math.max(...prev.map(j => j.orderIndex)) + 1 : 1;
      const newJob: Job = {
        ...jobData,
        id: newId,
        orderIndex: nextIndex
      };
      const next = [newJob, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to persist jobs to localStorage:', e);
      }
      return next;
    });
    return newId;
  };

  const updateJob = (id: string, jobData: Partial<Job>) => {
    setJobs(prev => {
      const next = prev.map(job => (job.id === id ? { ...job, ...jobData, id } : job));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to persist jobs to localStorage:', e);
      }
      return next;
    });
  };

  const deleteJob = (id: string) => {
    setJobs(prev => {
      const next = prev.filter(job => job.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to persist jobs to localStorage:', e);
      }
      return next;
    });
    if (selectedJobId === id) {
      setSelectedJobId(null);
    }
  };

  const deleteMultipleJobs = (ids: string[]) => {
    setJobs(prev => {
      const next = prev.filter(job => !ids.includes(job.id));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to persist jobs to localStorage:', e);
      }
      return next;
    });
    if (selectedJobId && ids.includes(selectedJobId)) {
      setSelectedJobId(null);
    }
  };

  const setJobStatus = (id: string, status: JobStatus) => {
    setJobs(prev => {
      const next = prev.map(job => (job.id === id ? { ...job, status } : job));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to persist jobs to localStorage:', e);
      }
      return next;
    });
  };

  const setMultipleJobStatus = (ids: string[], status: JobStatus) => {
    setJobs(prev => {
      const next = prev.map(job => (ids.includes(job.id) ? { ...job, status } : job));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to persist jobs to localStorage:', e);
      }
      return next;
    });
  };

  const resetToSeedData = () => {
    setJobs(SEED_JOBS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_JOBS));
    } catch (e) {
      console.error('Failed to reset localStorage:', e);
    }
  };

  const loginAdmin = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    console.log('[AUTH] login started');
    const seq = ++authSequenceRef.current;
    const res = await authService.login(username, password);

    if (res.success) {
      console.log('[AUTH] login success');
      console.log('[AUTH] authentication state changed: authenticated (seq:', seq, ')');
      setAuthStatus('authenticated');
      setCurrentView('admin');
      window.history.replaceState(null, '', '/admin/dashboard');
      return { success: true };
    }

    console.log('[AUTH] login failed:', res.error);
    return { success: false, error: res.error || 'Invalid username or password' };
  };

  const checkAdminAuth = async (): Promise<boolean> => {
    console.log('[AUTH] verify started: checkAdminAuth');
    const seq = ++authSequenceRef.current;
    const isValid = await authService.verifySession();
    if (seq === authSequenceRef.current) {
      console.log('[AUTH] verify result:', isValid);
      console.log('[AUTH] authentication state changed:', isValid ? 'authenticated' : 'unauthenticated');
      setAuthStatus(isValid ? 'authenticated' : 'unauthenticated');
    }
    return isValid;
  };

  return (
    <JobContext.Provider
      value={{
        jobs,
        publishedJobs,
        currentView,
        selectedJobId,
        setSelectedJobId,
        selectedJob,
        filters,
        authStatus,
        isAdminAuthenticated,
        isAuthChecking,
        selectedCategoryForBrowse,
        setCurrentView,
        navigateToJobDetails,
        navigateToCategory,
        navigateToView,
        setFilters,
        updateFilter,
        clearFilters,
        addJob,
        updateJob,
        deleteJob,
        deleteMultipleJobs,
        setJobStatus,
        setMultipleJobStatus,
        resetToSeedData,
        loginAdmin,
        logoutAdmin,
        checkAdminAuth,
        unreadFeedbackCount,
        setUnreadFeedbackCount,
        refreshFeedbackCount
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};
