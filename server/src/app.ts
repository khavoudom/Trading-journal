import express from 'express';
import cors from 'cors';
import routes from '@/routes/index.js';
import { AppError } from '@/errors/AppError.js';
import { logger, requestLogger } from '@/utils/logger.js';
import { config } from '@/config/index.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(config.uploadDir));
app.use(requestLogger);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(routes);

app.use('*', (_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('APP', 'Unhandled error: %s', err.message, err.stack);
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
