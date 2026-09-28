import { FeedbackRecord, FeedbackStats, FeedbackType, FeedbackStatus } from '../types';
import { authService } from './authService';

export interface SubmitFeedbackPayload {
  name: string;
  email: string;
  type: FeedbackType;
  subject: string;
  message: string;
  website_url_check?: string; // honeypot
}

export interface SubmitFeedbackResponse {
  success: boolean;
  id?: string;
  message?: string;
  error?: string;
}

export interface AdminFeedbackListResponse {
  success: boolean;
  feedback: FeedbackRecord[];
  stats: FeedbackStats;
  error?: string;
}

function getAdminHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  const token = authService.getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const feedbackService = {
  /**
   * Submit public user feedback
   */
  async submitFeedback(payload: SubmitFeedbackPayload): Promise<SubmitFeedbackResponse> {
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        return {
          success: false,
          error: data?.error || 'Unable to submit your feedback at this time. Please try again.'
        };
      }

      return {
        success: true,
        id: data?.id,
        message: data?.message || 'Thank you for your feedback!'
      };
    } catch {
      return {
        success: false,
        error: 'Network connectivity error. Please check your connection and retry.'
      };
    }
  },

  /**
   * Retrieve all feedback and stats for admin dashboard
   */
  async getAdminFeedback(): Promise<AdminFeedbackListResponse> {
    try {
      const response = await fetch('/api/admin/feedback', {
        method: 'GET',
        headers: getAdminHeaders(),
        credentials: 'include'
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        return {
          success: false,
          feedback: [],
          stats: { total: 0, unread: 0, read: 0, thisWeek: 0 },
          error: data?.error || 'Failed to load feedback records.'
        };
      }

      return {
        success: true,
        feedback: data.feedback || [],
        stats: data.stats || { total: 0, unread: 0, read: 0, thisWeek: 0 }
      };
    } catch {
      return {
        success: false,
        feedback: [],
        stats: { total: 0, unread: 0, read: 0, thisWeek: 0 },
        error: 'Network connectivity error.'
      };
    }
  },

  /**
   * Update feedback status (e.g. read/unread/archived)
   */
  async updateStatus(
    id: string,
    status: FeedbackStatus
  ): Promise<{ success: boolean; item?: FeedbackRecord; stats?: FeedbackStats; error?: string }> {
    try {
      const response = await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: getAdminHeaders(),
        credentials: 'include',
        body: JSON.stringify({ id, status })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        return { success: false, error: data?.error || 'Failed to update status.' };
      }

      return {
        success: true,
        item: data.item,
        stats: data.stats
      };
    } catch {
      return { success: false, error: 'Network error while updating feedback.' };
    }
  },

  /**
   * Delete single feedback record
   */
  async deleteFeedback(
    id: string
  ): Promise<{ success: boolean; stats?: FeedbackStats; error?: string }> {
    try {
      const response = await fetch('/api/admin/feedback', {
        method: 'DELETE',
        headers: getAdminHeaders(),
        credentials: 'include',
        body: JSON.stringify({ id })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        return { success: false, error: data?.error || 'Failed to delete record.' };
      }

      return { success: true, stats: data.stats };
    } catch {
      return { success: false, error: 'Network error while deleting feedback.' };
    }
  },

  /**
   * Bulk delete multiple feedback records
   */
  async deleteMultiple(
    ids: string[]
  ): Promise<{ success: boolean; deletedCount?: number; stats?: FeedbackStats; error?: string }> {
    try {
      const response = await fetch('/api/admin/feedback', {
        method: 'DELETE',
        headers: getAdminHeaders(),
        credentials: 'include',
        body: JSON.stringify({ ids })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        return { success: false, error: data?.error || 'Failed to delete selected records.' };
      }

      return {
        success: true,
        deletedCount: data.deletedCount || 0,
        stats: data.stats
      };
    } catch {
      return { success: false, error: 'Network error while deleting selected records.' };
    }
  }
};
