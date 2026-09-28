import {
  extractCookie,
  verifySessionCookie,
  sendResponse,
  setCorsHeaders,
  handleCorsPreflight
} from '../_session.js';

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return handleCorsPreflight(req, res);
  }

  const sessionCookie = extractCookie(req, 'admin_session');
  const hasCookie = Boolean(sessionCookie);
  const isValid = verifySessionCookie(sessionCookie);

  if (!isValid) {
    console.warn(`[Admin Verify] Session rejected. Cookie provided: ${hasCookie}, Origin: ${req.headers?.origin || 'none'}`);
  }

  if (isValid) {
    return sendResponse(res, 200, { valid: true });
  }

  return sendResponse(res, 401, {
    valid: false,
    reason: hasCookie ? 'invalid_or_expired_session' : 'no_session_cookie'
  });
}
