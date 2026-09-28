import React, { useState } from 'react';
import { useJobs } from '../context/JobContext';
import { FeedbackType } from '../types';
import { feedbackService } from '../services/feedbackService';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Mail,
  ShieldCheck,
  Clock,
  Sparkles
} from 'lucide-react';

const FEEDBACK_TYPE_OPTIONS: { value: FeedbackType; label: string; desc: string }[] = [
  {
    value: 'General Feedback',
    label: 'General Feedback',
    desc: 'Thoughts on your browsing experience or editorial curation.'
  },
  {
    value: 'Job Listing Issue',
    label: 'Job Listing Issue',
    desc: 'Broken link, expired requisition, or incorrect job metadata.'
  },
  {
    value: 'Website Issue',
    label: 'Website Issue',
    desc: 'Layout bug, rendering anomaly, or usability defect.'
  },
  {
    value: 'Job Suggestion',
    label: 'Job Suggestion',
    desc: 'Recommend an authentic company career opening to curate.'
  },
  {
    value: 'Feature Request',
    label: 'Feature Request',
    desc: 'Suggest new filter capabilities, notifications, or tools.'
  },
  {
    value: 'Other',
    label: 'Other',
    desc: 'Press, editorial inquiries, or miscellaneous matters.'
  }
];

export const ContactView: React.FC = () => {
  const { navigateToView } = useJobs();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState<FeedbackType>('General Feedback');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = (): string | null => {
    if (!name.trim() || name.trim().length < 2) {
      return 'Please enter your name (at least 2 characters).';
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailPattern.test(email.trim())) {
      return 'Please enter a valid email address.';
    }
    if (!subject.trim() || subject.trim().length < 3) {
      return 'Please enter a subject (at least 3 characters).';
    }
    if (!message.trim() || message.trim().length < 10) {
      return 'Please enter a message containing at least 10 characters.';
    }
    if (message.length > 3000) {
      return 'Your message exceeds the 3,000 character maximum limit.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await feedbackService.submitFeedback({
        name,
        email,
        type,
        subject,
        message,
        website_url_check: honeypot
      });

      if (response.success) {
        setSubmitSuccess(true);
        setName('');
        setEmail('');
        setType('General Feedback');
        setSubject('');
        setMessage('');
        setHoneypot('');
      } else {
        setErrorMessage(response.error || 'Failed to send feedback. Please try again.');
      }
    } catch {
      setErrorMessage('A network error occurred. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitSuccess(false);
    setErrorMessage('');
  };

  return (
    <div className="min-h-[85vh] bg-[#FBF9F5] py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Back Link */}
        <button
          type="button"
          onClick={() => navigateToView('home')}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#71717A] hover:text-[#7A1C28] transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        {/* Page Header */}
        <div className="border-b border-[#E7E2D9] pb-8 mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-[#7A1C28]/10 text-[#7A1C28] border border-[#7A1C28]/20 font-semibold">
              Reader Desk
            </span>
            <span className="text-xs text-[#71717A] font-mono">Dispatches & Correspondence</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#141416]">
            Contact & Feedback
          </h1>
          <p className="mt-3 text-base text-[#52525B] max-w-2xl leading-relaxed">
            Have a question, found an issue, or want to suggest something? We'd love to hear from you.
            Our editorial staff reviews every transmission.
          </p>
        </div>

        {submitSuccess ? (
          /* Success Card */
          <div className="bg-[#FFFFFF] border border-[#E7E2D9] p-8 sm:p-12 text-center shadow-xs">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#141416] tracking-tight mb-2">
              Thank you for your feedback!
            </h2>
            <p className="text-sm sm:text-base text-[#52525B] max-w-md mx-auto leading-relaxed mb-8">
              Your message has been received. Our team will review it. If your message requires a follow-up, our editors will reach out to your provided email.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigateToView('home')}
                className="w-full sm:w-auto px-6 py-3 bg-[#7A1C28] hover:bg-[#63141F] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
              >
                Back to Home
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto px-6 py-3 border border-[#E7E2D9] bg-[#FFFFFF] hover:bg-[#FAF8F5] text-xs font-semibold uppercase tracking-wider text-[#141416] transition-colors cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Section */}
            <div className="lg:col-span-8 bg-[#FFFFFF] border border-[#E7E2D9] p-6 sm:p-8 shadow-xs">
              <h2 className="font-serif text-xl font-bold text-[#141416] mb-1">
                Dispatch Correspondence
              </h2>
              <p className="text-xs text-[#71717A] mb-6">
                All submissions are stored directly in our secure editorial database.
              </p>

              {errorMessage && (
                <div
                  id="contact-form-error"
                  className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                  <div className="leading-relaxed font-medium">{errorMessage}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Honeypot field (hidden from screen reader / UI) */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="website_url_check">Leave this field empty</label>
                  <input
                    type="text"
                    id="website_url_check"
                    name="website_url_check"
                    value={honeypot}
                    onChange={e => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-semibold text-[#141416] uppercase tracking-wider mb-1.5"
                    >
                      Your Name <span className="text-[#7A1C28]">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Aditi Rao"
                      disabled={isSubmitting}
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E7E2D9] text-sm text-[#141416] focus:outline-hidden focus:border-[#7A1C28] focus:bg-[#FFFFFF] transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-semibold text-[#141416] uppercase tracking-wider mb-1.5"
                    >
                      Email Address <span className="text-[#7A1C28]">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="aditi@example.com"
                      disabled={isSubmitting}
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E7E2D9] text-sm text-[#141416] focus:outline-hidden focus:border-[#7A1C28] focus:bg-[#FFFFFF] transition-colors"
                    />
                  </div>
                </div>

                {/* Feedback Type Dropdown */}
                <div>
                  <label
                    htmlFor="contact-type"
                    className="block text-xs font-semibold text-[#141416] uppercase tracking-wider mb-1.5"
                  >
                    Feedback Type <span className="text-[#7A1C28]">*</span>
                  </label>
                  <select
                    id="contact-type"
                    value={type}
                    onChange={e => setType(e.target.value as FeedbackType)}
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E7E2D9] text-sm text-[#141416] focus:outline-hidden focus:border-[#7A1C28] focus:bg-[#FFFFFF] transition-colors cursor-pointer"
                  >
                    {FEEDBACK_TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-[11px] text-[#71717A]">
                    {FEEDBACK_TYPE_OPTIONS.find(o => o.value === type)?.desc}
                  </p>
                </div>

                {/* Subject */}
                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-xs font-semibold text-[#141416] uppercase tracking-wider mb-1.5"
                  >
                    Subject <span className="text-[#7A1C28]">*</span>
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    required
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Brief summary of your inquiry or feedback"
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E7E2D9] text-sm text-[#141416] focus:outline-hidden focus:border-[#7A1C28] focus:bg-[#FFFFFF] transition-colors"
                  />
                </div>

                {/* Message & Character Counter */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-semibold text-[#141416] uppercase tracking-wider"
                    >
                      Message <span className="text-[#7A1C28]">*</span>
                    </label>
                    <span
                      className={`text-[11px] font-mono ${
                        message.length > 2800 ? 'text-amber-700 font-semibold' : 'text-[#71717A]'
                      }`}
                    >
                      {message.length} / 3,000
                    </span>
                  </div>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    maxLength={3000}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Provide specific details, requisition URLs, error descriptions, or suggested listings..."
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E7E2D9] text-sm text-[#141416] focus:outline-hidden focus:border-[#7A1C28] focus:bg-[#FFFFFF] transition-colors resize-y leading-relaxed"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    id="contact-submit-btn"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#7A1C28] hover:bg-[#63141F] text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>Send Feedback</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Editorial Sidebar Info */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#FFFFFF] border border-[#E7E2D9] p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-[#7A1C28]" />
                  <h3 className="font-serif font-bold text-base text-[#141416]">
                    Our Editorial Pledge
                  </h3>
                </div>
                <p className="text-xs text-[#52525B] leading-relaxed mb-4">
                  The Role Dispatch curates career listings exclusively from authenticated corporate career portals.
                  We do not syndicate scraped third-party ads or pay-to-play listings.
                </p>
                <div className="pt-3 border-t border-[#E7E2D9] space-y-2.5">
                  <div className="flex items-start gap-2 text-xs text-[#52525B]">
                    <Clock className="w-3.5 h-3.5 text-[#7A1C28] shrink-0 mt-0.5" />
                    <span>Response timeframe: 24 to 48 business hours</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-[#52525B]">
                    <Mail className="w-3.5 h-3.5 text-[#7A1C28] shrink-0 mt-0.5" />
                    <span>
                      Direct contact:{' '}
                      <a
                        href="mailto:editorial@theroledispatch.com"
                        className="text-[#7A1C28] underline underline-offset-2 hover:text-[#63141F]"
                      >
                        editorial@theroledispatch.com
                      </a>
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#FAF8F5] border border-[#E7E2D9] p-5 text-xs text-[#52525B] leading-relaxed">
                <div className="flex items-center gap-2 mb-2 font-semibold text-[#141416]">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Submitting a Career Opening?</span>
                </div>
                If you represent a corporate talent acquisition team and wish to have an authentic vacancy listed, select <strong>Job Suggestion</strong> and provide the official requisition link.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
