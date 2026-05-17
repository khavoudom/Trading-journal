import { createServer } from 'http';
import { config } from '@/config/index.js';
import { logger } from '@/utils/logger.js';
import { connectDatabase, disconnectDatabase } from '@/database/connection.js';
import app from '@/app.js';
import { setupSocket } from '@/socket/index.js';
import { startReminderQueue, stopReminderQueue } from '@/queue/reminderQueue.js';

async function start() {
  await connectDatabase();

  const httpServer = createServer(app);
  setupSocket(httpServer);

  startReminderQueue();

  httpServer.listen(config.port, () => {
    logger.info('APP', 'Server running on http://localhost:%d', config.port);
    logger.info('APP', 'Health check: http://localhost:%d/health', config.port);
    logger.info('APP', 'API base: http://localhost:%d/api', config.port);
  });
}

start().catch((err) => {
  logger.error('APP', 'Failed to start server: %O', err);
  process.exit(1);
});

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

async function shutdown() {
  logger.info('APP', 'Shutting down...');
  stopReminderQueue();
  await disconnectDatabase();
  process.exit(0);
}
