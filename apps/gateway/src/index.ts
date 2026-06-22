import { app } from './app';
import { env } from './core/env';
import { logger } from './core/logger';

app.listen({ port: env.PORT, hostname: env.HOSTNAME }, () => logger.info(`gateway on http://localhost:${env.PORT}`));

const shutdown = async () => {
    logger.info('shutting down...');
    await app.stop();
    logger.flush();
    process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
