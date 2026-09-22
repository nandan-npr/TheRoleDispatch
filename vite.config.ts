import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import {handleLogin, handleVerify, handleLogout} from './api/_auth';

export default defineConfig(() => {
  const adminAuthPlugin: Plugin = {
    name: 'admin-auth-api',
    configureServer(server) {
      server.middlewares.use('/api/admin/login', (req, res, next) => {
        if (req.method === 'POST') {
          handleLogin(req, res);
          return;
        }
        next();
      });

      server.middlewares.use('/api/admin/verify', (req, res, next) => {
        if (req.method === 'POST' || req.method === 'GET') {
          handleVerify(req, res);
          return;
        }
        next();
      });

      server.middlewares.use('/api/admin/logout', (req, res, next) => {
        if (req.method === 'POST') {
          handleLogout(req, res);
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
