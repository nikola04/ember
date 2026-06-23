import Elysia, { t } from 'elysia';
import type { AuthService } from './auth.service';
import { loginRequestSchema, registerRequestSchema } from '@ember/protocol';
import { UnauthorizedError } from '../../core/errors';
import { env } from '../../core/env';

const cookieSchema = t.Cookie({
    access_token: t.Optional(t.String()),
    refresh_token: t.Optional(t.String()),
});

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
                access_token!.set({
                    value: result.access_token,
                    httpOnly: true,
                    secure: env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: env.JWT_ACCESS_TTL,
                });
                refresh_token!.set({
                    value: result.refresh_token,
                    httpOnly: true,
                    secure: env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    path: '/auth',
                    maxAge: env.JWT_REFRESH_TTL,
                });
                return { user: result.user };
            },
            { body: loginRequestSchema, detail: { summary: 'Login' } }
        )
        .post(
            '/refresh',
            async ({ cookie }) => {
                const { refresh_token, access_token } = cookie;
                const oldRefreshToken = refresh_token.value;
                if (!oldRefreshToken) throw new UnauthorizedError('refresh token missing');

                const result = await authService.refresh({ refresh_token: oldRefreshToken });
                access_token.set({
                    value: result.access_token,
                    httpOnly: true,
                    secure: env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: env.JWT_ACCESS_TTL,
                });
                refresh_token.set({
                    value: result.refresh_token,
                    httpOnly: true,
                    secure: env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    path: '/auth',
                    maxAge: env.JWT_REFRESH_TTL,
                });

                return { status: 'success' };
            },
            { detail: { tags: ['Auth'], summary: 'Refresh' }, cookie: cookieSchema }
        )
        .post(
            '/logout',
            async ({ cookie: { access_token, refresh_token } }) => {
                const token = refresh_token.value;
                if (token) await authService.logout({ refresh_token: token });

                access_token.remove();
                refresh_token.remove();
                return { status: 'success' };
            },
            { cookie: cookieSchema, detail: { summary: 'Logout' } }
        );
