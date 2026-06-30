export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export interface LogEntry {
  level: LogLevel;
  ctx: string;
  message: string;
  args: unknown[];
  timestamp: Date;
}

export interface LoggerDriver {
  readonly name: string;
  log(entry: LogEntry): void;
}

export interface LoggerDriverConfig {
  /** Globally enabled drivers. Default: ['console', 'file'] */
  drivers: string[];
  sentryDsn?: string;
  /** Minimum log level. Default: 'info' */
  minLevel: LogLevel;
  /** Directory for file driver. Default: 'logs/' */
  logDir?: string;
  /** Filename for file driver. Default: 'app.log' */
  logFile?: string;
}
