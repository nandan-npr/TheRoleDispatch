import {
  setCorsHeaders,
  handleCorsPreflight,
  extractCookie,
  verifySessionCookie,
  parseBody,
  sendResponse
} from '../_session.js';
import {
  FEEDBACK_STATUSES,
  getAllFeedback,
  getFeedbackStats,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  deleteMultipleFeedback
} from '../_feedbackDb.js';

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return handleCorsPreflight(req, res);
  }

  // Admin authentication verification
  const sessionCookie = extractCookie(req, 'admin_session');
  const isValidSession = verifySessionCookie(sessionCookie);

  if (!isValidSession) {
    return sendResponse(res, 401, {
      success: false,
      error: 'Unauthorized. Admin session required.'
    });
  }

  // Extract ID from URL path or query params
  // Handles /api/admin/feedback/:id or ?id=
  let idFromUrl = req.query?.id || null;
  if (!idFromUrl && req.url) {
    const parts = req.url.split('?')[0].split('/');
    const lastPart = parts[parts.length - 1];
    if (lastPart && lastPart !== 'feedback' && lastPart.startsWith('fb_')) {
      idFromUrl = lastPart;
    }
  }

  try {
    // GET: List all with stats OR get single item
    if (req.method === 'GET') {
      if (idFromUrl) {
        const item = getFeedbackById(idFromUrl);
        if (!item) {
          return sendResponse(res, 404, { success: false, error: 'Feedback not found.' });
        }
        return sendResponse(res, 200, { success: true, item });
      }

      const feedback = getAllFeedback();
      const stats = getFeedbackStats();
      return sendResponse(res, 200, { success: true, feedback, stats });
    }

    // PATCH: Update status (e.g. mark read / unread / archived)
    if (req.method === 'PATCH') {
      const body = await parseBody(req);
      const targetId = idFromUrl || body.id;
      const { status } = body;

      if (!targetId) {
        return sendResponse(res, 400, { success: false, error: 'Missing feedback ID.' });
      }

      if (!status || !FEEDBACK_STATUSES.includes(status)) {
        return sendResponse(res, 400, {
          success: false,
          error: `Invalid status. Must be one of: ${FEEDBACK_STATUSES.join(', ')}`
        });
      }

      const updated = updateFeedback(targetId, { status });
      if (!updated) {
        return sendResponse(res, 404, { success: false, error: 'Feedback record not found.' });
      }

      const stats = getFeedbackStats();
      return sendResponse(res, 200, { success: true, item: updated, stats });
    }

    // DELETE: Delete single or multiple
    if (req.method === 'DELETE') {
      const body = await parseBody(req);
      const targetId = idFromUrl || body.id;
      const targetIds = body.ids;

      if (targetIds && Array.isArray(targetIds) && targetIds.length > 0) {
        const count = deleteMultipleFeedback(targetIds);
        const stats = getFeedbackStats();
        return sendResponse(res, 200, {
          success: true,
          deletedCount: count,
          message: `Successfully deleted ${count} item(s).`,
          stats
        });
      }

      if (targetId) {
        const deleted = deleteFeedback(targetId);
        if (!deleted) {
          return sendResponse(res, 404, { success: false, error: 'Feedback record not found.' });
        }
        const stats = getFeedbackStats();
        return sendResponse(res, 200, {
          success: true,
          deletedCount: 1,
          message: 'Feedback deleted successfully.',
          stats
        });
      }

      return sendResponse(res, 400, {
        success: false,
        error: 'Please provide an ID or array of IDs to delete.'
      });
    }

    return sendResponse(res, 405, { error: 'Method not allowed.' });
  } catch (err) {
    console.error('[AdminFeedbackAPI] Handler error:', err);
    return sendResponse(res, 500, {
      success: false,
      error: 'An internal error occurred while processing feedback management.'
    });
  }
}
