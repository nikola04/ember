import { Elysia } from 'elysia';
import { errorPlugin } from './plugins/error.plugin';
import { loggerPlugin } from './plugins/logger.plugin';
import { authModule } from './modules/auth';
import { env } from './core/env';
import cors from '@elysiajs/cors';
import { serverModule } from './modules/servers';
import { openapiPlugin } from './core/openapi';
import { channelModule } from './modules/channels';
import { userModule } from './modules/users';

export const app = new Elysia()
    .use(cors())
    .use(loggerPlugin)
    .use(errorPlugin)
    .use(authModule.plugin)
    .use(userModule.plugin)
    .use(serverModule.plugin)
    .use(channelModule.plugin);

if (env.NODE_ENV !== 'production') {
    app.use(openapiPlugin);
}
