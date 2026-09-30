import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { router } from './routes/index.js';
import { logger } from './shared/logger.js';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(pinoHttp({ logger }));
  app.use(express.json({ limit: '256kb' }));
  app.use('/api', router);
  app.use((error, _req, res, _next) => {
    logger.error({ err: error }, 'Request failed');
    res.status(error.name === 'ZodError' ? 400 : 500).json({ ok: false, error: error.name === 'ZodError' ? 'Payload webhook tidak valid' : 'Kesalahan server' });
  });
  return app;
}
