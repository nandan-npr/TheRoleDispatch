export type JobStatus = 'DRAFT' | 'PUBLISHED' | 'HOLD';

export type WorkMode = 'In-office' | 'Hybrid' | 'Remote';

export type JobType = 'Full-time' | 'Contract' | 'Internship' | 'Part-time';

export type JobCategory =
  // IT
  | 'IT Fresher'
  | 'IT Experienced'
  // Engineering
  | 'ECE'
  | 'EEE'
  | 'Mechanical'
  | 'Civil'
  | 'Automobile'
  | 'Instrumentation'
  | 'Other Engineering'
  // Diploma
  | 'Diploma - CSE'
  | 'Diploma - ECE'
  | 'Diploma - EEE'
  | 'Diploma - Mechanical'
  | 'Diploma - Civil'
  | 'Diploma - Other'
  // Other
  | 'Other Jobs';

export type CategoryGroup = 'IT' | 'Engineering' | 'Diploma' | 'Other';

export interface CategoryStructure {
  group: CategoryGroup;
  description: string;
  subcategories: {
    name: JobCategory;
    description: string;
  }[];
}

export type JobSource =
  | 'Company Careers'
  | 'LinkedIn'
  | 'Indeed'
  | 'Naukri'
  | 'Foundit'
  | 'Glassdoor'
  | 'Internshala'
  | 'Wellfound'
  | 'Cutshort'
  | 'Workday'
  | 'Other';

export interface Job {
  id: string;
  role: string;
  companyName: string;
  companyLogo?: string;
  location: string;
  experience: string; // e.g. "Fresher / 0–1 Years", "2–4 Years", "5+ Years"
  salary: string; // e.g. "₹6.5 – 9.0 LPA", "$85,000 – $105,000"
  jobType: JobType;
  workMode: WorkMode;
  category: JobCategory;
  description: string;
  requirements: string[];
  skills: string[];
  source: JobSource;
  applicationUrl: string;
  status: JobStatus;
  orderIndex: number; // For manual or chronological internal sorting without showing dates
}

export interface JobFilters {
  searchQuery: string;
  locationQuery: string;
  experience: string;
  salaryRange: string;
  category: string;
  workMode: string;
  jobType: string;
  source: string;
  sortBy: 'relevance' | 'az' | 'za';
}

export interface AdminFilters {
  search: string;
  status: 'ALL' | JobStatus;
  category: string;
  source: string;
  location: string;
  sortBy: 'relevance' | 'az' | 'za' | 'company' | 'status';
}
