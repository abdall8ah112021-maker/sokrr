import express from 'express';
import path from 'path';
import fs from 'fs';
import { apiRouter } from './src/server/routes/api';
import { authenticate } from './src/server/security';

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Basic security & parsing middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS & Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Authentication middleware for populating req.user
app.use(authenticate);

// Mount API v1 router
app.use('/api/v1', apiRouter);

// Forward compatibility /api redirect
app.use('/api', (req, res, next) => {
  if (req.url === '' || req.url === '/') {
    res.json({ message: 'Sugar Business API v1. Use /api/v1' });
    return;
  }
  next();
});

async function startServer() {
  if (!isProd) {
    // Development mode: Mount Vite dev server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static files
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Sugar Business Server] Running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('[Sugar Business Server] Startup failed:', err);
  process.exit(1);
});
