#!/usr/bin/env node
/**
 * Project setup script.
 * - Installs dependencies for root, server, and frontend
 * - Creates server/.env from server/.env.example (does not overwrite existing)
 * - Runs Prisma migrations for the top-level server
 * - Reports status at each step
 */

import { execSync } from 'node:child_process';
import { existsSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function run(label, command, cwd = ROOT) {
  console.log(`\n▶ ${label}...`);
  try {
    execSync(command, { cwd, stdio: 'inherit' });
    console.log(`  ✓ ${label} complete`);
  } catch (err) {
    console.error(`  ✗ ${label} failed`);
    process.exit(1);
  }
}

function copyEnv(examplePath, envPath) {
  const resolvedExample = resolve(examplePath);
  const resolvedEnv = resolve(envPath);
  if (existsSync(resolvedEnv)) {
    console.log(`  · ${resolvedEnv} already exists — skipping`);
    return;
  }
  copyFileSync(resolvedExample, resolvedEnv);
  console.log(`  ✓ Created ${resolvedEnv}`);
}

// ── 1. Root dependencies ──
run('Installing root dependencies', 'npm install', ROOT);

// ── 2. Server dependencies ──
const SERVER = resolve(ROOT, 'server');
run('Installing server dependencies', 'npm install', SERVER);

// ── 3. Frontend dependencies ──
const FRONTEND = resolve(ROOT, 'frontend');
run('Installing frontend dependencies', 'npm install', FRONTEND);

// ── 4. Create .env files ──
console.log('\n▶ Setting up .env files...');
copyEnv(resolve(SERVER, '.env.example'), resolve(SERVER, '.env'));
console.log('  ✓ .env files ready');

// ── 5. Run Prisma migrations ──
run('Running server Prisma migrate', 'npx prisma migrate deploy', SERVER);

// ── 6. Done ──
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  Setup complete!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\nNext steps:');
console.log('  1. Edit server/.env with your credentials');
console.log('  2. Start full app:      npm run dev:full');
console.log('  3. Or start manually:   cd server && npm run dev');
console.log('                         cd frontend && npm run dev\n');
