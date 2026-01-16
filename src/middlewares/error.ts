import type { NextFunction, Request, Response } from 'express';

import { logger } from '../config/logger';

export function notFound(req: Request, res: Response): void {
  res.status(404).json({ error: 'Not found' });
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  const status = typeof err?.status === 'number' ? err.status : 500;
  const message = typeof err?.message === 'string' && err.message.trim() ? err.message : 'Internal server error';

  logger.error('Request failed', {
    method: req.method,
    path: req.originalUrl,
    status,
    message,
  });

  if (status >= 500) {
    logger.error(err);
  }

  res.status(status).json({ error: status >= 500 ? 'Internal server error' : message });
}
