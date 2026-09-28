import {
  parseBody,
  safeCompare,
  signSession,
  sendResponse,
  setCorsHeaders,
  handleCorsPreflight
} from '../_session.js';

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return handleCorsPreflight(req, res);
  }

  if (req.method !== 'POST') {
    return sendResponse(res, 405, { error: 'Method not allowed' });
  }

  try {
    const body = await parseBody(req);
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    const expectedUser = (process.env.ADMIN_USERNAME || '').trim();
    const expectedPass = process.env.ADMIN_PASSWORD || '';

    if (!username || !password || !expectedUser || !expectedPass) {
      return sendResponse(res, 401, { error: 'Invalid username or password' });
    }

    const userMatch =
      safeCompare(username, expectedUser) ||
      safeCompare(username.toLowerCase(), expectedUser.toLowerCase());
    const passMatch =
      safeCompare(password, expectedPass) ||
      safeCompare(password, expectedPass.trim());

    if (!userMatch || !passMatch) {
      return sendResponse(res, 401, { error: 'Invalid username or password' });
    }

    const { cookie, token } = signSession(username, req);

    return sendResponse(
      res,
      200,
      { success: true, token },
      { 'Set-Cookie': cookie }
    );
  } catch {
    return sendResponse(res, 401, { error: 'Invalid username or password' });
  }
}
