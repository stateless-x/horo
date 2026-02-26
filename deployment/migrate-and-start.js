#!/usr/bin/env node

/**
 * Migration and Start Script for Railway Deployment
 *
 * This script runs database migrations before starting the API server.
 * It's called from the Railway deployment configuration.
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🚀 Starting migration and deployment process...');
console.log(`Root directory: ${rootDir}`);

try {
  // Step 1: Run database migrations
  console.log('\n📦 Running database migrations...');
  execSync('bun run --filter=@horo/db db:push', {
    cwd: rootDir,
    stdio: 'inherit',
    env: process.env,
  });

  console.log('✅ Migrations completed successfully\n');

  // Step 2: Start the API server
  console.log('🔥 Starting API server...');
  execSync('bun run --filter=@horo/api start', {
    cwd: rootDir,
    stdio: 'inherit',
    env: process.env,
  });

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
