import React, { createContext, useContext, useState, useEffect } from 'react';
import { Job, JobFilters, JobStatus, JobCategory } from '../types';
import { SEED_JOBS } from '../data/seedJobs';
import { authService } from '../services/authService';

export type ViewType = 'home' | 'jobs' | 'categories' | 'job-details' | 'admin' | 'admin-login';

interface JobContextType {
  jobs: Job[];
  publishedJobs: Job[];
  currentView: ViewType;
  selectedJobId: string | null;
  selectedJob: Job | null;
  filters: JobFilters;
  isAdminAuthenticated: boolean;
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
  
  // Admin Auth
  loginAdmin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;
  checkAdminAuth: () => Promise<boolean>;
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

  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [filters, setFilters] = useState<JobFilters>(DEFAULT_FILTERS);
  const [selectedCategoryForBrowse, setSelectedCategoryForBrowse] = useState<JobCategory | null>(null);

  // Secure admin session state initialized from token check
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() =>
    authService.isAuthenticated()
  );

  // Validate session with server on startup and window focus
  useEffect(() => {
    const verify = async () => {
      if (authService.isAuthenticated()) {
        const isValid = await authService.verifySession();
        setIsAdminAuthenticated(isValid);
        if (!isValid && (currentView === 'admin' || currentView === 'admin-login')) {
          setCurrentView('admin-login');
        }
      } else {
        setIsAdminAuthenticated(false);
      }
    };
    verify();
  }, [currentView]);

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

  const navigateToJobDetails = (jobId: string) => {
    setSelectedJobId(jobId);
    setCurrentView('job-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCategory = (category: JobCategory) => {
    setSelectedCategoryForBrowse(category);
    setFilters(prev => ({ ...prev, category }));
    setCurrentView('jobs');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToView = (view: ViewType) => {
    if (view !== 'job-details') {
      setSelectedJobId(null);
    }
    // Strict Route Guard: protect admin dashboard from unauthenticated access
    if (view === 'admin') {
      if (!isAdminAuthenticated && !authService.isAuthenticated()) {
        setCurrentView('admin-login');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    const res = await authService.login(username, password);
    if (res.success) {
      setIsAdminAuthenticated(true);
      return { success: true };
    }
    return { success: false, error: res.error || 'Invalid username or password' };
  };

  const logoutAdmin = async () => {
    await authService.logout();
    setIsAdminAuthenticated(false);
    navigateToView('admin-login');
  };

  const checkAdminAuth = async (): Promise<boolean> => {
    const isValid = await authService.verifySession();
    setIsAdminAuthenticated(isValid);
    return isValid;
  };

  return (
    <JobContext.Provider
      value={{
        jobs,
        publishedJobs,
        currentView,
        selectedJobId,
        selectedJob,
        filters,
        isAdminAuthenticated,
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
        checkAdminAuth
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
