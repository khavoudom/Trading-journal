/**
 * Logger — multi-driver logging with console, file, and Sentry support.
 *
 * Usage (unchanged API):
 *   logger.info('CTX', 'message %s', arg);
 *   logger.error('CTX', 'something broke: %O', err);
 *
 * Configure via env vars:
 *   LOG_DRIVERS       comma-separated — console,file,sentry (default: console,file)
 *   SENTRY_DSN        required for sentry driver
 *   LOG_LEVEL         debug|info|warn|error (default: info)
 *   LOG_DIR           directory for file driver (default: logs)
 *   LOG_FILE          filename for file driver (default: app.log)
 */
export { getLogger, Logger } from './logging/Logger';
export type { LogLevel, LogEntry, LoggerDriver, LoggerDriverConfig } from './logging/types';
export { ConsoleDriver } from './logging/drivers/ConsoleDriver';
export { FileDriver } from './logging/drivers/FileDriver';
export { SentryDriver } from './logging/drivers/SentryDriver';

import { getLogger } from './logging/Logger';

/** Singleton logger instance used across the app. */
export const logger = getLogger();

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
