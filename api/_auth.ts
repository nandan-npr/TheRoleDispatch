import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

export function getAdminCredentials() {
  try {
    const envLocalPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envLocalPath)) {
      dotenv.config({ path: envLocalPath, override: true });
    } else {
      dotenv.config();
    }
  } catch {
    // In serverless environments where filesystem access might be restricted
    dotenv.config();
  }

  const username = (process.env.ADMIN_USERNAME || '').trim();
  const password = process.env.ADMIN_PASSWORD || '';
  return { username, password };
}

function safeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function signSession(username: string): { token: string; expiresAt: number; cookie: string } {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload = Buffer.from(JSON.stringify({ u: username, exp: expiresAt })).toString('base64url');
  const secret = process.env.ADMIN_PASSWORD || 'the_role_dispatch_secure_secret_2026';
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  const token = `sess_${payload}.${sig}`;

  const isProduction = process.env.NODE_ENV === 'production';
  const cookie = `admin_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${isProduction ? '; Secure' : ''}`;

  return { token, expiresAt, cookie };
}

export function verifySessionToken(token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string' || !token.startsWith('sess_')) {
    return false;
  }
  const raw = token.slice(5);
  const dotIndex = raw.lastIndexOf('.');
  if (dotIndex === -1) return false;

  const payload = raw.substring(0, dotIndex);
  const sig = raw.substring(dotIndex + 1);

  const secret = process.env.ADMIN_PASSWORD || 'the_role_dispatch_secure_secret_2026';
  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');

  const sigBuf = Buffer.from(sig);
  const expectedSigBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedSigBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expectedSigBuf)) return false;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (typeof data.exp !== 'number' || Date.now() > data.exp) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function extractToken(req: any): string | null {
  // 1. From Authorization header
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  // 2. From Cookie header
  const cookieHeader = req.headers?.cookie || req.headers?.Cookie;
  if (typeof cookieHeader === 'string') {
    const match = cookieHeader.match(/(?:^|;\s*)admin_session=([^;]+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
  }

  // 3. From request body if present
  if (req.body && typeof req.body === 'object' && req.body.token) {
    return String(req.body.token);
  }

  return null;
}

export async function parseBody(req: any): Promise<any> {
  if (req.body) {
    if (typeof req.body === 'object') return req.body;
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
  }

  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk: any) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => {
      resolve({});
    });
  });
}

export function sendJson(
  res: any,
  statusCode: number,
  data: any,
  headers?: Record<string, string | string[]>
) {
  if (headers) {
    for (const [key, value] of Object.entries(headers)) {
      res.setHeader(key, value);
    }
  }

  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(statusCode).json(data);
  } else {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  }
}

export async function handleLogin(req: any, res: any) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { success: false, error: 'Method not allowed' });
  }

  try {
    const body = await parseBody(req);
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    const { username: expectedUser, password: expectedPass } = getAdminCredentials();

    if (!username || !password || !expectedUser || !expectedPass) {
      return sendJson(res, 401, {
        success: false,
        error: 'Invalid username or password'
      });
    }

    const userMatch =
      safeCompare(username, expectedUser) ||
      safeCompare(username.toLowerCase(), expectedUser.toLowerCase());
    const passMatch =
      safeCompare(password, expectedPass) ||
      safeCompare(password, expectedPass.trim());

    if (!userMatch || !passMatch) {
      return sendJson(res, 401, {
        success: false,
        error: 'Invalid username or password'
      });
    }

    const { token, expiresAt, cookie } = signSession(username);

    return sendJson(
      res,
      200,
      { success: true, token, expiresAt },
      { 'Set-Cookie': cookie }
    );
  } catch {
    return sendJson(res, 401, {
      success: false,
      error: 'Invalid username or password'
    });
  }
}

export async function handleVerify(req: any, res: any) {
  const token = extractToken(req) || (await parseBody(req))?.token;
  const isValid = verifySessionToken(token);

  if (isValid) {
    return sendJson(res, 200, { valid: true });
  }

  return sendJson(res, 401, { valid: false, error: 'Session expired' });
}

export async function handleLogout(req: any, res: any) {
  const expiredCookie =
    'admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
  return sendJson(res, 200, { success: true }, { 'Set-Cookie': expiredCookie });
}
