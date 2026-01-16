import { env } from './env';

type Level = 'debug' | 'info' | 'warn' | 'error';

const levelOrder: Record<Level, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function getLevel(): Level {
  const raw = process.env.LOG_LEVEL;
  const v = typeof raw === 'string' ? (raw.trim().toLowerCase() as Level) : undefined;
  if (v === 'debug' || v === 'info' || v === 'warn' || v === 'error') return v;
  return env.isProduction ? 'info' : 'debug';
}

const current = getLevel();

function shouldLog(level: Level): boolean {
  return levelOrder[level] >= levelOrder[current];
}

export const logger = {
  debug: (...args: any[]) => {
    if (shouldLog('debug')) console.debug(...args);
  },
  info: (...args: any[]) => {
    if (shouldLog('info')) console.info(...args);
  },
  warn: (...args: any[]) => {
    if (shouldLog('warn')) console.warn(...args);
  },
  error: (...args: any[]) => {
    if (shouldLog('error')) console.error(...args);
  },
};
