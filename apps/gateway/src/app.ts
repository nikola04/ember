import { Elysia } from 'elysia';
import { errorHandler } from './core/error.handler';
import { authModule } from './modules/auth';
import { env } from './core/env';
import openapi from '@elysiajs/openapi';

export const app = new Elysia().use(errorHandler).use(authModule.plugin);

if (env.NODE_ENV !== 'production') {
    app.use(
        openapi({
            specPath: '/openapi.json',
            path: '/swagger',
            scalar: {
                showDeveloperTools: 'never',
                layout: 'modern',
                defaultOpenAllTags: true,
            },
            documentation: {
                info: {
                    title: 'Ember API Documentation',
                    version: env.VERSION,
                    contact: {
                        name: 'Nikola Nedeljković',
                        url: 'https://github.com/nikola04',
                        email: 'nikolanedeljkovicc@icloud.com',
                    },
                },
                components: {
                    securitySchemes: {
                        JwtAuth: {
                            type: 'http',
                            scheme: 'bearer',
                            bearerFormat: 'JWT',
                            description: 'Standard Authorization header: Bearer <token>',
                        },
                        CookieAuth: {
                            type: 'apiKey',
                            in: 'cookie',
                            name: 'auth_token',
                            description: 'Authentication cookie: auth_token=<token>',
                        },
                    },
                },
            },
        })
    );
}
