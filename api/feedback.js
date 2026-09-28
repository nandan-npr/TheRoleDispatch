import {
  setCorsHeaders,
  handleCorsPreflight,
  parseBody,
  sendResponse
} from './_session.js';
import {
  FEEDBACK_TYPES,
  createFeedback
} from './_feedbackDb.js';

// In-memory rate limiting map: ip -> [timestamp, timestamp, ...]
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

function isRateLimited(ip) {
  if (!ip) return false;
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const recent = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(ip, recent);
    return true;
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);

  // Periodic cleanup if map grows
  if (rateLimitMap.size > 2000) {
    for (const [key, tsList] of rateLimitMap.entries()) {
      if (tsList.every(t => now - t >= RATE_LIMIT_WINDOW_MS)) {
        rateLimitMap.delete(key);
      }
    }
  }

  return false;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return handleCorsPreflight(req, res);
  }

  if (req.method !== 'POST') {
    return sendResponse(res, 405, { error: 'Method not allowed. Use POST.' });
  }

  // Rate limit check
  const clientIp =
    req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'anonymous';

  if (isRateLimited(clientIp)) {
    return sendResponse(res, 429, {
      error: 'Too many submissions. Please wait a minute before submitting again.'
    });
  }

  try {
    const body = await parseBody(req);
    const { name, email, type, subject, message, website_url_check } = body;

    // Honeypot spam trap: real users won't fill this hidden field
    if (website_url_check && String(website_url_check).trim().length > 0) {
      // Silently pretend success to trick automated spam bots
      return sendResponse(res, 200, {
        success: true,
        message: 'Your feedback has been received.'
      });
    }

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return sendResponse(res, 400, {
        error: 'Please provide a valid name between 2 and 100 characters.'
      });
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim()) || email.trim().length > 150) {
      return sendResponse(res, 400, {
        error: 'Please provide a valid email address.'
      });
    }

    if (!type || typeof type !== 'string' || !FEEDBACK_TYPES.includes(type.trim())) {
      return sendResponse(res, 400, {
        error: `Please select a valid feedback type from: ${FEEDBACK_TYPES.join(', ')}.`
      });
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length < 3 || subject.trim().length > 200) {
      return sendResponse(res, 400, {
        error: 'Please provide a subject between 3 and 200 characters.'
      });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10 || message.trim().length > 3000) {
      return sendResponse(res, 400, {
        error: 'Please provide a message between 10 and 3,000 characters.'
      });
    }

    // Strip basic harmful HTML tags for sanitized persistence
    const sanitizedName = name.replace(/<[^>]*>?/gm, '').trim();
    const sanitizedSubject = subject.replace(/<[^>]*>?/gm, '').trim();
    const sanitizedMessage = message.replace(/<[^>]*>?/gm, '').trim();

    const created = createFeedback({
      name: sanitizedName,
      email: email.trim().toLowerCase(),
      type: type.trim(),
      subject: sanitizedSubject,
      message: sanitizedMessage
    });

    return sendResponse(res, 201, {
      success: true,
      id: created.id,
      message: 'Your feedback has been received. Our team will review it.'
    });
  } catch (err) {
    console.error('[FeedbackAPI] Public submission error:', err);
    return sendResponse(res, 500, {
      error: 'Failed to process feedback submission. Please try again shortly.'
    });
  }
}
