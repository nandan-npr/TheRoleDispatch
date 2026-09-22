import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import crypto from 'crypto';
import {defineConfig, loadEnv, Plugin} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  const adminUsername = env.ADMIN_USERNAME || process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'dispatch_editor_2026';

  // In-memory active session tokens
  const activeSessions = new Map<string, number>();

  const adminAuthPlugin: Plugin = {
    name: 'admin-auth-api',
    configureServer(server) {
      server.middlewares.use('/api/admin/login', (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const {username, password} = JSON.parse(body || '{}');
              if (
                typeof username === 'string' &&
                typeof password === 'string' &&
                username.trim() === adminUsername &&
                password === adminPassword
              ) {
                const token = 'sess_' + crypto.randomBytes(24).toString('hex');
                const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
                activeSessions.set(token, expiresAt);

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({success: true, token, expiresAt}));
                return;
              }

              res.statusCode = 401;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: false,
                  error: 'Invalid username or password',
                })
              );
            } catch {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({success: false, error: 'Malformed request'}));
            }
          });
          return;
        }
        next();
      });

      server.middlewares.use('/api/admin/verify', (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const {token} = JSON.parse(body || '{}');
              if (token && activeSessions.has(token)) {
                const expiresAt = activeSessions.get(token)!;
                if (Date.now() < expiresAt) {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({valid: true}));
                  return;
                }
                activeSessions.delete(token);
              }
              res.statusCode = 401;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({valid: false, error: 'Session expired'}));
            } catch {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({valid: false, error: 'Malformed request'}));
            }
          });
          return;
        }
        next();
      });

      server.middlewares.use('/api/admin/logout', (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const {token} = JSON.parse(body || '{}');
              if (token) {
                activeSessions.delete(token);
              }
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({success: true}));
            } catch {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({success: true}));
            }
          });
          return;
        }
        next();
      });
    },
  };

  return {
    plugins: [react(), tailwindcss(), adminAuthPlugin],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
