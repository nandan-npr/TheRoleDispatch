import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Attempt to load .env.local and .env if present in current working directory (local dev / server)
try {
  const envLocal = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envLocal)) {
    dotenv.config({ path: envLocal, override: true });
  }
  const envMain = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envMain)) {
    dotenv.config({ path: envMain });
  }
} catch {
  // Silent in read-only / serverless environments
}

export function getSecret() {
  const secret = (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    'the_role_dispatch_secure_secret_2026'
  ).trim();
  return secret;
}

export function setCorsHeaders(req, res) {
  const origin = req.headers?.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, DELETE, HEAD'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Cookie, X-Requested-With, Accept'
  );
  res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');
}

export function handleCorsPreflight(req, res) {
  setCorsHeaders(req, res);
  res.statusCode = 204;
  res.end();
  return true;
}

export function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function signSession(username, req) {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload = Buffer.from(
    JSON.stringify({ u: username, exp: expiresAt, iat: Date.now() })
  ).toString('base64url');
  const secret = getSecret();
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  const token = `${payload}.${sig}`;

  const isHttps =
    req?.headers?.['x-forwarded-proto'] === 'https' ||
    req?.connection?.encrypted ||
    Boolean(req?.socket?.encrypted);

  const cookieParts = [
    `admin_session=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=None',
    'Secure',
    'Partitioned',
    'Max-Age=604800'
  ];

  const cookie = cookieParts.join('; ');

  return { token, expiresAt, cookie };
}

export function verifySessionCookie(cookieValue) {
  if (!cookieValue || typeof cookieValue !== 'string') return false;
  const dotIndex = cookieValue.lastIndexOf('.');
  if (dotIndex === -1) return false;

  const payload = cookieValue.substring(0, dotIndex);
  const sig = cookieValue.substring(dotIndex + 1);

  const secret = getSecret();
  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');

  const sigBuf = Buffer.from(sig);
  const expectedSigBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedSigBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expectedSigBuf)) return false;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (!data.exp || typeof data.exp !== 'number' || Date.now() > data.exp) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function extractCookie(req, name = 'admin_session') {
  let val = null;
  if (req.cookies && req.cookies[name]) {
    val = req.cookies[name];
  } else {
    const rawHeader = req.headers?.cookie || req.headers?.Cookie;
    if (rawHeader && typeof rawHeader === 'string') {
      const match = rawHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
      if (match) {
        val = decodeURIComponent(match[1].trim());
      }
    }
  }

  // Authorization header Bearer token fallback
  if (!val) {
    const authHeader = req.headers?.authorization || req.headers?.Authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      val = authHeader.slice(7).trim();
    }
  }

  if (typeof val === 'string') {
    val = val.trim();
    // RFC 6265 allows double-quoted cookie values
    if (val.startsWith('"') && val.endsWith('"') && val.length >= 2) {
      val = val.slice(1, -1).trim();
    }
    return val;
  }

  return null;
}

export async function parseBody(req) {
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
    req.on('data', (chunk) => {
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

export function sendResponse(res, statusCode, body, headers = {}) {
  for (const [key, val] of Object.entries(headers)) {
    res.setHeader(key, val);
  }
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(statusCode).json(body);
  } else {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(body));
  }
}
