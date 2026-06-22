import pino from 'pino';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { env } from './env';

const isDev = env.NODE_ENV === 'development';

const LOG_DIR = join(process.cwd(), 'logs');
mkdirSync(LOG_DIR, { recursive: true });

const startedAt = new Date().toISOString().replace(/[:.]/g, '-');
const logFile = join(LOG_DIR, `gateway-${startedAt}#${crypto.randomUUID().substring(0, 8)}.log`);

const streams: pino.StreamEntry[] = [
    {
        level: env.LOG_LEVEL,
        stream: isDev
            ? pino.transport({
                  target: 'pino-pretty',
                  options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
              })
            : process.stdout,
    },
    {
        level: env.LOG_LEVEL,
        stream: pino.destination({ dest: logFile, sync: false }),
    },
];

export const logger = pino(
    {
        level: env.LOG_LEVEL,
        redact: {
            paths: ['password', 'passwordHash', 'token', 'jwt', '*.password', 'req.headers.authorization'],
            censor: '[redacted]',
        },
        base: { env: env.NODE_ENV },
    },
    pino.multistream(streams),
);

logger.info({ logFile }, 'logger initialized');

export function moduleLogger(module: string) {
    return logger.child({ module });
}
