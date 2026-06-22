import Elysia from 'elysia';
import type { AuthService } from './auth.service';
import { loginRequestSchema, registerRequestSchema } from '@ember/protocol';

export const createAuthRoutes = (authService: AuthService) =>
    new Elysia({ prefix: '/auth', detail: { tags: ['Auth'] } })
        .post(
            '/register',
            async ({ body }) => {
                return authService.registerWithPassword(body);
            },
            { body: registerRequestSchema, detail: { summary: 'Register' } }
        )
        .post(
            '/login',
            async ({ body, cookie: { access_token, refresh_token } }) => {
                const result = await authService.loginWithPassword(body);
                access_token.set({ value: result.accessToken, httpOnly: true, secure: true, sameSite: 'strict', maxAge: 600 });
                refresh_token.set({
                    value: result.refreshToken,
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    path: '/auth',
                    maxAge: 604800,
                });
                return { user: result.user };
            },
            { body: loginRequestSchema, detail: { summary: 'Login' } }
        );
