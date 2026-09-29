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

  const expiredCookie = 'admin_session=; Path=/; HttpOnly; SameSite=None; Secure; Partitioned; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT';

  return sendResponse(res, 200, { success: true }, { 'Set-Cookie': expiredCookie });
}
