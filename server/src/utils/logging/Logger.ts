import type { LogEntry, LogLevel, LoggerDriver } from './types';
import { LOG_LEVELS } from './types';
import { ConsoleDriver } from './drivers/ConsoleDriver';
import { FileDriver } from './drivers/FileDriver';
import { SentryDriver } from './drivers/SentryDriver';
import type { LoggerDriverConfig } from './types';

export class Logger {
  private drivers: LoggerDriver[] = [];
  private minLevel: number;
  private config: LoggerDriverConfig;

  constructor(config: LoggerDriverConfig) {
    this.config = config;
    this.minLevel = LOG_LEVELS[config.minLevel] ?? LOG_LEVELS.info;
    this.initDrivers();
  }

  private initDrivers(): void {
    const enabled = new Set(this.config.drivers);

    for (const name of enabled) {
      switch (name) {
        case 'console':
          this.drivers.push(new ConsoleDriver());
          break;
        case 'file':
          this.drivers.push(new FileDriver(this.config.logDir ?? 'logs', this.config.logFile ?? 'app.log'));
          break;
        case 'sentry':
          if (this.config.sentryDsn) {
            this.drivers.push(new SentryDriver(this.config.sentryDsn));
          }
          break;
      }
    }
  }

  /** Register a custom driver at runtime. */
  addDriver(driver: LoggerDriver): void {
    this.drivers.push(driver);
  }

  private log(level: LogLevel, ctx: string, message: string, ...args: unknown[]): void {
    if (LOG_LEVELS[level] < this.minLevel) return;

    const entry: LogEntry = { level, ctx, message, args, timestamp: new Date() };

    for (const driver of this.drivers) {
      try {
        driver.log(entry);
      } catch {
        // Never let a single driver failure cascade
      }
    }
  }

  debug(ctx: string, message: string, ...args: unknown[]): void {
    this.log('debug', ctx, message, ...args);
  }

  info(ctx: string, message: string, ...args: unknown[]): void {
    this.log('info', ctx, message, ...args);
  }

  warn(ctx: string, message: string, ...args: unknown[]): void {
    this.log('warn', ctx, message, ...args);
  }

  error(ctx: string, message: string, ...args: unknown[]): void {
    this.log('error', ctx, message, ...args);
  }
}

const DEFAULT_CONFIG: LoggerDriverConfig = {
  drivers: (process.env.LOG_DRIVERS || 'console,file').split(',').map((s) => s.trim()).filter(Boolean),
  minLevel: (process.env.LOG_LEVEL as LogLevel) || 'info',
  sentryDsn: process.env.SENTRY_DSN,
  logDir: process.env.LOG_DIR || 'logs',
  logFile: process.env.LOG_FILE || 'app.log',
};

let defaultLogger: Logger | null = null;

export function getLogger(): Logger {
  if (!defaultLogger) {
    defaultLogger = new Logger(DEFAULT_CONFIG);
  }
  return defaultLogger;
}
