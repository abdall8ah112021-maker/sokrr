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
console.log('[Build] Build completed successfully.');
