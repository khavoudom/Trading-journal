import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { inspect } from 'util';

const logDir = join(process.cwd(), 'logs');
const logFile = join(logDir, 'app.log');

mkdirSync(logDir, { recursive: true });

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: number =
  LOG_LEVELS[(process.env.LOG_LEVEL || 'info') as LogLevel] ?? LOG_LEVELS.info;

function levelPrefix(level: LogLevel): string {
  return level.toUpperCase().padEnd(5);
}

function formatArg(arg: unknown): string {
  if (arg instanceof Error) {
    return arg.stack || `${arg.name}: ${arg.message}`;
  }

  if (typeof arg === 'object' && arg !== null) {
    return inspect(arg, { depth: null, colors: false });
  }

  return String(arg);
}

function formatMessage(level: LogLevel, ctx: string, message: string, ...args: unknown[]): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${levelPrefix(level)}] [${ctx}]`;

  if (args.length > 0) {
    const extras = args.map(formatArg).join(' ');
    return `${prefix} ${message} ${extras}`;
  }
  return `${prefix} ${message}`;
}

function log(level: LogLevel, ctx: string, message: string, ...args: unknown[]) {
  if (LOG_LEVELS[level] < currentLevel) return;

  const line = formatMessage(level, ctx, message, ...args);

  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }

  writeFileSync(logFile, line + '\n', { flag: 'a' });
}

export const logger = {
  debug: (ctx: string, message: string, ...args: unknown[]) => log('debug', ctx, message, ...args),
  info: (ctx: string, message: string, ...args: unknown[]) => log('info', ctx, message, ...args),
  warn: (ctx: string, message: string, ...args: unknown[]) => log('warn', ctx, message, ...args),
  error: (ctx: string, message: string, ...args: unknown[]) => log('error', ctx, message, ...args),
};

/** Express middleware that logs each incoming request with method, path, status, and duration. */
export function requestLogger(
  req: import('express').Request,
  res: import('express').Response,
  next: import('express').NextFunction,
) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP', `${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
  });
  next();
}
