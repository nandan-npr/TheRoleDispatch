import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (.env.local for local dev, .env if present)
const envLocal = path.resolve(__dirname, '.env.local');
if (fs.existsSync(envLocal)) {
  dotenv.config({ path: envLocal, override: true });
}
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Support JSON bodies for API routes
app.use(express.json());

// Serverless function handlers mounted directly
app.all('/api/admin/login', async (req, res) => {
  const { default: handler } = await import('./api/admin/login.js');
  return handler(req, res);
});

app.all('/api/admin/verify', async (req, res) => {
  const { default: handler } = await import('./api/admin/verify.js');
  return handler(req, res);
});

app.all('/api/admin/logout', async (req, res) => {
  const { default: handler } = await import('./api/admin/logout.js');
  return handler(req, res);
});

// Feedback routes
app.all('/api/feedback', async (req, res) => {
  const { default: handler } = await import('./api/feedback.js');
  return handler(req, res);
});

app.all(['/api/admin/feedback', '/api/admin/feedback/:id'], async (req, res) => {
  const { default: handler } = await import('./api/admin/feedback.js');
  return handler(req, res);
});

// Setup Vite dev server middleware or serve production build
async function setupServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT} [${isProd ? 'production' : 'development'}]`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
