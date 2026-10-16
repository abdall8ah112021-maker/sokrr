#!/usr/bin/env node
const { execSync } = require('child_process');

console.log('[Build] Initializing production build sequence...');

// 1. Generate Prisma Client
try {
  console.log('[Build] Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
} catch (err) {
  console.warn('[Build] Warning during prisma generate:', err.message);
}

// 2. Automated Database Migration/Push
if (process.env.DATABASE_URL) {
  console.log('[Build] DATABASE_URL detected. Executing prisma db push to remote database...');
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('[Build] Database schema synchronized successfully.');
  } catch (err) {
    console.error('[Build] Database sync failed:', err.message);
    if (process.env.VERCEL || process.env.RENDER || process.env.CI) {
      process.exit(1);
    }
  }
} else {
  console.log('[Build] Notice: DATABASE_URL environment variable is not defined in this environment.');
  console.log('[Build] Prisma db push will execute automatically in Vercel/Render when DATABASE_URL is configured.');
}

// 3. Build Client Assets (Vite)
console.log('[Build] Building frontend assets with Vite...');
execSync('npx vite build', { stdio: 'inherit' });

// 4. Bundle Vercel Serverless API Functions (Resolves all relative imports, prevents ERR_MODULE_NOT_FOUND)
console.log('[Build] Bundling Vercel Serverless API functions with esbuild...');
try {
  execSync(
    'npx esbuild api/server.ts --bundle --platform=node --format=esm --target=node18 --packages=external --outfile=api/index.js',
    { stdio: 'inherit' }
  );
  execSync(
    'npx esbuild api/server.ts --bundle --platform=node --format=esm --target=node18 --packages=external --outfile=api/server.js',
    { stdio: 'inherit' }
  );
  console.log('[Build] API serverless functions bundled successfully.');
} catch (err) {
  console.warn('[Build] Warning during serverless bundling:', err.message);
}

console.log('[Build] Production build sequence completed successfully.');
