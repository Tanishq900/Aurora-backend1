import type { CorsOptions } from 'cors';

import { env } from './env';

export function createCorsOptions(): CorsOptions {
  const allowlist = new Set(env.corsOrigins());

  return {
    credentials: true,
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowlist.has(origin)) return callback(null, true);
      return callback(null, false);
    },
  };
}
