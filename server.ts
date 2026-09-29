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

// Explicitly serve Google Search Console verification file
app.get('/googlec526eaffc1b52bc7.html', (_req, res) => {
  const publicPath = path.resolve(__dirname, 'public', 'googlec526eaffc1b52bc7.html');
  if (fs.existsSync(publicPath)) {
    return res.sendFile(publicPath);
  }
  const distPath = path.resolve(__dirname, 'dist', 'googlec526eaffc1b52bc7.html');
  if (fs.existsSync(distPath)) {
    return res.sendFile(distPath);
  }
  res.status(404).send('Not found');
});

// Explicitly serve sitemap.xml with XML content type
app.get('/sitemap.xml', (_req, res) => {
  const publicPath = path.resolve(__dirname, 'public', 'sitemap.xml');
  if (fs.existsSync(publicPath)) {
    res.type('application/xml');
    return res.sendFile(publicPath);
  }
  const distPath = path.resolve(__dirname, 'dist', 'sitemap.xml');
  if (fs.existsSync(distPath)) {
    res.type('application/xml');
    return res.sendFile(distPath);
  }
  res.status(404).type('text/plain').send('Sitemap not found');
});

// Explicitly serve robots.txt
app.get('/robots.txt', (_req, res) => {
  const publicPath = path.resolve(__dirname, 'public', 'robots.txt');
  if (fs.existsSync(publicPath)) {
    res.type('text/plain');
    return res.sendFile(publicPath);
  }
  const distPath = path.resolve(__dirname, 'dist', 'robots.txt');
  if (fs.existsSync(distPath)) {
    res.type('text/plain');
    return res.sendFile(distPath);
  }
  res.status(404).type('text/plain').send('Robots.txt not found');
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
