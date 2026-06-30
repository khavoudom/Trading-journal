import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { inspect } from 'util';
import type { LogEntry, LoggerDriver } from '../types';

function formatArg(arg: unknown): string {
  if (arg instanceof Error) {
    return arg.stack || `${arg.name}: ${arg.message}`;
  }
  if (typeof arg === 'object' && arg !== null) {
    return inspect(arg, { depth: null, colors: false });
  }
  return String(arg);
}

function formatMessage(entry: LogEntry): string {
  const prefix = `[${entry.timestamp.toISOString()}] [${entry.level.toUpperCase().padEnd(5)}] [${entry.ctx}]`;

  if (entry.args.length > 0) {
    const extras = entry.args.map(formatArg).join(' ');
    return `${prefix} ${entry.message} ${extras}`;
  }
  return `${prefix} ${entry.message}`;
}

export class FileDriver implements LoggerDriver {
  readonly name = 'file';
  private filePath: string;

  constructor(logDir: string, logFile: string) {
    mkdirSync(logDir, { recursive: true });
    this.filePath = join(logDir, logFile);
  }

  log(entry: LogEntry): void {
    const line = formatMessage(entry);
    writeFileSync(this.filePath, line + '\n', { flag: 'a' });
  }
}
