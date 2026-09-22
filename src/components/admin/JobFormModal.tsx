import React, { useState, useEffect } from 'react';
import { Job, JobCategory, JobSource, JobStatus, JobType, WorkMode } from '../../types';
import { ALL_CATEGORIES, ALL_SOURCES } from '../../data/categories';
import { X, Eye, FileText, CheckCircle, Sparkles } from 'lucide-react';

interface JobFormModalProps {
  initialJob?: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (jobData: Omit<Job, 'id' | 'orderIndex'>, status: JobStatus) => void;
  onPreview: (previewJob: Job) => void;
}

export const JobFormModal: React.FC<JobFormModalProps> = ({
  initialJob,
  isOpen,
  onClose,
  onSave,
  onPreview
}) => {
  const [role, setRole] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('Fresher / 0–1 Years');
  const [salary, setSalary] = useState('₹5.0 – ₹8.0 LPA');
  const [jobType, setJobType] = useState<JobType>('Full-time');
  const [workMode, setWorkMode] = useState<WorkMode>('In-office');
  const [category, setCategory] = useState<JobCategory>('IT Fresher');
  const [source, setSource] = useState<JobSource>('Company Careers');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [description, setDescription] = useState('');
  const [requirementsText, setRequirementsText] = useState('');
  const [skillsText, setSkillsText] = useState('');

  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (initialJob) {
      setRole(initialJob.role || '');
      setCompanyName(initialJob.companyName || '');
      setCompanyLogo(initialJob.companyLogo || '');
      setLocation(initialJob.location || '');
      setExperience(initialJob.experience || '');
      setSalary(initialJob.salary || '');
      setJobType(initialJob.jobType || 'Full-time');
      setWorkMode(initialJob.workMode || 'In-office');
      setCategory(initialJob.category || 'IT Fresher');
      setSource(initialJob.source || 'Company Careers');
      setApplicationUrl(initialJob.applicationUrl || '');
      setDescription(initialJob.description || '');
      setRequirementsText(initialJob.requirements ? initialJob.requirements.join('\n') : '');
      setSkillsText(initialJob.skills ? initialJob.skills.join(', ') : '');
    } else {
      // Clean defaults
      setRole('');
      setCompanyName('');
      setCompanyLogo('');
      setLocation('');
      setExperience('Fresher / 0–1 Years');
      setSalary('₹4.5 – ₹7.0 LPA');
      setJobType('Full-time');
      setWorkMode('In-office');
      setCategory('IT Fresher');
      setSource('Company Careers');
      setApplicationUrl('https://');
      setDescription('');
      setRequirementsText('');
      setSkillsText('');
    }
    setValidationError('');
  }, [initialJob, isOpen]);

  if (!isOpen) return null;

  const getStructuredJob = (status: JobStatus): Omit<Job, 'id' | 'orderIndex'> => {
    const requirements = requirementsText
      .split('\n')
      .map(r => r.trim())
      .filter(r => r.length > 0);

    const skills = skillsText
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    return {
      role: role.trim(),
      companyName: companyName.trim(),
      companyLogo: companyLogo.trim() || undefined,
      location: location.trim(),
      experience: experience.trim(),
      salary: salary.trim(),
      jobType,
      workMode,
      category,
      source,
      applicationUrl: applicationUrl.trim() || 'https://careers.example.com',
      description: description.trim(),
      requirements,
      skills,
      status
    };
  };

  const validate = () => {
    if (!role.trim()) {
      setValidationError('Job Role is required.');
      return false;
    }
    if (!companyName.trim()) {
      setValidationError('Company Name is required.');
      return false;
    }
    if (!location.trim()) {
      setValidationError('Location is required.');
      return false;
    }
    if (!experience.trim()) {
      setValidationError('Experience is required.');
      return false;
    }
    if (!salary.trim()) {
      setValidationError('Salary is required.');
      return false;
    }
    if (!description.trim()) {
      setValidationError('Description is required.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const jobData = getStructuredJob('DRAFT');
    onSave(jobData, 'DRAFT');
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const jobData = getStructuredJob('PUBLISHED');
    onSave(jobData, 'PUBLISHED');
  };

  const handlePreviewTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const data = getStructuredJob(initialJob ? initialJob.status : 'DRAFT');
    const previewJob: Job = {
      ...data,
      id: initialJob ? initialJob.id : 'preview-temp-id',
      orderIndex: initialJob ? initialJob.orderIndex : 999
    };
    onPreview(previewJob);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#FFFFFF] border border-[#E7E2D9] shadow-2xl my-6 p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E7E2D9] mb-6">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#7A1C28]">
              Editorial Workflow
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#141416]">
              {initialJob ? 'Edit Career Listing' : 'Create New Career Listing'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#71717A] hover:text-[#141416] border border-transparent hover:border-[#E7E2D9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {validationError && (
          <div className="mb-6 p-3 bg-[#7A1C28]/10 border border-[#7A1C28]/30 text-[#7A1C28] text-xs font-semibold">
            {validationError}
          </div>
        )}

        {/* Form */}
        <form className="space-y-6">
          {/* Row 1: Role & Company Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#141416] mb-1.5">
                Job Role <span className="text-[#7A1C28]">*</span>
              </label>
              <input
                id="form-job-role"
                type="text"
                placeholder="e.g. Lead Mechanical Design Engineer"
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E7E2D9] px-3 py-2 text-sm text-[#141416] focus:outline-none focus:border-[#7A1C28]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#141416] mb-1.5">
                Company Name <span className="text-[#7A1C28]">*</span>
              </label>
              <input
                id="form-company-name"
                type="text"
                placeholder="e.g. Larsen & Toubro"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E7E2D9] px-3 py-2 text-sm text-[#141416] focus:outline-none focus:border-[#7A1C28]"
              />
            </div>
          </div>

          {/* Row 2: Location, Experience, Salary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#141416] mb-1.5">
                Location <span className="text-[#7A1C28]">*</span>
              </label>
              <input
                id="form-location"
                type="text"
                placeholder="e.g. Bangalore"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E7E2D9] px-3 py-2 text-sm text-[#141416] focus:outline-none focus:border-[#7A1C28]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#141416] mb-1.5">
                Experience <span className="text-[#7A1C28]">*</span>
              </label>
              <input
                id="form-experience"
                type="text"
                placeholder="e.g. Fresher / 0–1 Years"
                value={experience}
                onChange={e => setExperience(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E7E2D9] px-3 py-2 text-sm text-[#141416] focus:outline-none focus:border-[#7A1C28]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#141416] mb-1.5">
                Salary <span className="text-[#7A1C28]">*</span>
              </label>
              <input
                id="form-salary"
                type="text"
                placeholder="e.g. ₹6.0 – ₹9.5 LPA"
                value={salary}
                onChange={e => setSalary(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E7E2D9] px-3 py-2 text-sm text-[#141416] focus:outline-none focus:border-[#7A1C28]"
              />
            </div>
          </div>

          {/* Row 3: Category (Dropdown per prompt) & Source (Dropdown per prompt) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#FAF8F5] border border-[#E7E2D9]">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A1C28] mb-1.5">
                Category (Dropdown Required) <span className="text-[#7A1C28]">*</span>
              </label>
              <select
                id="form-category-select"
                value={category}
                onChange={e => setCategory(e.target.value as JobCategory)}
                className="w-full bg-[#FFFFFF] border border-[#E7E2D9] px-3 py-2 text-sm text-[#141416] focus:outline-none focus:border-[#7A1C28] cursor-pointer"
              >
                {ALL_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A1C28] mb-1.5">
                Source (Dropdown Required) <span className="text-[#7A1C28]">*</span>
              </label>
              <select
                id="form-source-select"
                value={source}
                onChange={e => setSource(e.target.value as JobSource)}
                className="w-full bg-[#FFFFFF] border border-[#E7E2D9] px-3 py-2 text-sm text-[#141416] focus:outline-none focus:border-[#7A1C28] cursor-pointer"
              >
                {ALL_SOURCES.map(src => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Job Type & Work Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#141416] mb-1.5">
                Job Type
              </label>
              <select
                id="form-job-type"
                value={jobType}
                onChange={e => setJobType(e.target.value as JobType)}
                className="w-full bg-[#FAF8F5] border border-[#E7E2D9] px-3 py-2 text-sm text-[#141416] focus:outline-none focus:border-[#7A1C28] cursor-pointer"
              >
                <option value="Full-time">Full-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#141416] mb-1.5">
                Work Mode
              </label>
              <select
                id="form-work-mode"
                value={workMode}
                onChange={e => setWorkMode(e.target.value as WorkMode)}
                className="w-full bg-[#FAF8F5] border border-[#E7E2D9] px-3 py-2 text-sm text-[#141416] focus:outline-none focus:border-[#7A1C28] cursor-pointer"
              >
                <option value="In-office">In-office</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>

          {/* Row 5: Application URL & Company Logo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#141416] mb-1.5">
                Application URL (Direct Link) <span className="text-[#7A1C28]">*</span>
              </label>
              <input
                id="form-app-url"
                type="url"
                placeholder="https://company.com/careers/role"
                value={applicationUrl}
                onChange={e => setApplicationUrl(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E7E2D9] px-3 py-2 text-sm text-[#141416] focus:outline-none focus:border-[#7A1C28]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#141416] mb-1.5">
                Company Logo URL (Optional)
              </label>
              <input
                id="form-company-logo"
                type="text"
                placeholder="https://..."
                value={companyLogo}
                onChange={e => setCompanyLogo(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E7E2D9] px-3 py-2 text-sm text-[#141416] focus:outline-none focus:border-[#7A1C28]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#141416] mb-1.5">
              Description <span className="text-[#7A1C28]">*</span>
            </label>
            <textarea
              id="form-description"
              rows={4}
              placeholder="Provide clean editorial description of the role, responsibilities, and team context..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E7E2D9] p-3 text-sm text-[#141416] focus:outline-none focus:border-[#7A1C28]"
            />
          </div>

          {/* Requirements (One per line) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#141416] mb-1.5">
              Requirements (One item per line)
            </label>
            <textarea
              id="form-requirements"
              rows={3}
              placeholder="Bachelor's degree in engineering discipline&#10;3+ years of experience with CAD/FEA&#10;Proficiency with ASME design codes"
              value={requirementsText}
              onChange={e => setRequirementsText(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E7E2D9] p-3 text-sm text-[#141416] focus:outline-none focus:border-[#7A1C28]"
            />
          </div>

          {/* Skills (Comma separated) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#141416] mb-1.5">
              Key Skills (Comma separated)
            </label>
            <input
              id="form-skills"
              type="text"
              placeholder="Embedded C, RTOS, ARM Cortex, CAN Protocol"
              value={skillsText}
              onChange={e => setSkillsText(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E7E2D9] px-3 py-2 text-sm text-[#141416] focus:outline-none focus:border-[#7A1C28]"
            />
          </div>

          {/* Prompt explicit action buttons: [ SAVE DRAFT ] [ PREVIEW ] [ PUBLISH ] */}
          <div className="pt-6 border-t border-[#E7E2D9] flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#52525B] hover:text-[#141416]"
            >
              Cancel
            </button>

            <div className="flex flex-wrap items-center gap-3">
              {/* [ SAVE DRAFT ] */}
              <button
                id="btn-save-draft"
                type="button"
                onClick={handleSaveDraft}
                className="px-5 py-2.5 border border-[#E7E2D9] bg-[#FAF8F5] hover:bg-[#FFFFFF] text-xs font-semibold tracking-wider uppercase text-[#141416] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-[#71717A]" />
                <span>SAVE DRAFT</span>
              </button>

              {/* [ PREVIEW ] */}
              <button
                id="btn-preview-job"
                type="button"
                onClick={handlePreviewTrigger}
                className="px-5 py-2.5 border border-[#C5A059] bg-[#FFFFFF] hover:bg-[#FAF8F5] text-xs font-semibold tracking-wider uppercase text-[#141416] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>PREVIEW</span>
              </button>

              {/* [ PUBLISH ] */}
              <button
                id="btn-publish-job"
                type="button"
                onClick={handlePublish}
                className="px-6 py-2.5 bg-[#7A1C28] hover:bg-[#63141F] text-white text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>PUBLISH</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
