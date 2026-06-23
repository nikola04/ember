import { Elysia } from 'elysia';
import { errorPlugin } from './plugins/error.plugin';
import { authModule } from './modules/auth';
import { env } from './core/env';
import cors from '@elysiajs/cors';
import { serverModule } from './modules/servers';
import { openapiPlugin } from './core/openapi';
import { channelModule } from './modules/channels';

export const app = new Elysia().use(cors()).use(errorPlugin).use(authModule.plugin).use(serverModule.plugin).use(channelModule.plugin);

if (env.NODE_ENV !== 'production') {
    app.use(openapiPlugin);
}
