import type { LogEntry, LoggerDriver } from '../types';

const ERROR_LEVELS = new Set(['error', 'warn']);

/**
 * Minimal Sentry driver using the Envelope ingestion API.
 * DSN format: https://<key>@<org>.ingest.sentry.io/<project_id>
 */
export class SentryDriver implements LoggerDriver {
  readonly name = 'sentry';
  private envelopeUrl: string;

  constructor(private dsn: string) {
    const parts = dsn.match(/https:\/\/(.+@)?(.+\.ingest\.sentry\.io)\/(\d+)/);
    this.envelopeUrl = parts
      ? `https://${parts[2]}/api/${parts[3]}/envelope/`
      : '';
  }

  log(entry: LogEntry): void {
    if (!ERROR_LEVELS.has(entry.level)) return;
    if (!this.envelopeUrl) return;

    const eventId = crypto.randomUUID();
    const payload: Record<string, unknown> = {
      event_id: eventId,
      timestamp: entry.timestamp.toISOString(),
      level: entry.level,
      logger: entry.ctx,
      message: {
        formatted: entry.args.length > 0
          ? `${entry.message} ${entry.args.map(String).join(' ')}`
          : entry.message,
      },
      exception: this.extractException(entry),
      tags: { ctx: entry.ctx },
    };

    const envelopeHeaders = JSON.stringify({ event_id: eventId, dsn: this.dsn });
    const itemHeaders = JSON.stringify({ type: 'event' });
    const itemBody = JSON.stringify(payload);

    fetch(this.envelopeUrl, {
      method: 'POST',
      body: `${envelopeHeaders}\n${itemHeaders}\n${itemBody}`,
    }).catch(() => {
      /* swallow — don't let Sentry failure cascade */
    });
  }

  private extractException(entry: LogEntry): unknown {
    const err = entry.args.find((a) => a instanceof Error) as Error | undefined;
    if (!err) return undefined;

    return {
      type: err.name,
      value: err.message,
      stacktrace: err.stack
        ? {
            frames: err.stack
              .split('\n')
              .slice(1)
              .map((line) => {
                const match = line.match(/at\s+(?:(.+)\s+)?\(?(.+):(\d+):(\d+)\)?/);
                return match
                  ? { function: match[1] || '<anonymous>', filename: match[2], lineno: Number(match[3]), colno: Number(match[4]) }
                  : { function: '<anonymous>' };
              }),
          }
        : undefined,
    };
  }
}
