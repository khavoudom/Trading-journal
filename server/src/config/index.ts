import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

/** Application configuration sourced from environment variables with sensible defaults. */
export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  databaseUrl: requireEnv('DATABASE_URL'),
  redisUrl: process.env.REDIS_URL || '',
  yahooFinanceBaseUrl:
    process.env.YAHOO_FINANCE_BASE_URL || 'https://query1.finance.yahoo.com/v8/finance/chart',
  uploadDir: process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads'),
};
