import {
  sendResponse,
  setCorsHeaders,
  handleCorsPreflight
} from '../_session.js';

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return handleCorsPreflight(req, res);
  }

  const isHttps =
    req?.headers?.['x-forwarded-proto'] === 'https' ||
    req?.connection?.encrypted ||
    Boolean(req?.socket?.encrypted);

  const cookieParts = [
    'admin_session=',
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT'
  ];

  if (isHttps) {
    cookieParts.push('Secure');
  }

  const expiredCookie = cookieParts.join('; ');

  return sendResponse(res, 200, { success: true }, { 'Set-Cookie': expiredCookie });
}
