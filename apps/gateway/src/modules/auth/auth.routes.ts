import Elysia, { t } from 'elysia';
import type { AuthService } from './auth.service';
import { loginRequestSchema, registerRequestSchema } from '@ember/protocol';
import { UnauthorizedError } from '../../core/errors';
import { authGuard } from '../../plugins/auth.plugin';

const cookieSchema = t.Cookie({
    access_token: t.Optional(t.String()),
    refresh_token: t.Optional(t.String()),
});

export const createAuthRoutes = (authService: AuthService) =>
    new Elysia({ prefix: '/auth', detail: { tags: ['Auth'] } })
        .use(authGuard)
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
                access_token.set({ value: result.access_token, httpOnly: true, secure: true, sameSite: 'strict', maxAge: 600 });
                refresh_token.set({
                    value: result.refresh_token,
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    path: '/auth',
                    maxAge: 604800,
                });
                return { user: result.user };
            },
            { body: loginRequestSchema, detail: { summary: 'Login' } }
        )
        .post(
            '/refresh',
            async ({ headers, cookie }) => {
                const { refresh_token, access_token } = cookie;
                const oldRefreshToken = refresh_token.value;
                if (!oldRefreshToken) throw new UnauthorizedError('refresh token missing');

                const result = await authService.refresh({ refresh_token: oldRefreshToken });
                access_token.set({ value: result.access_token, httpOnly: true, secure: true, sameSite: 'strict', maxAge: 600 });
                refresh_token.set({
                    value: result.refresh_token,
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    path: '/auth',
                    maxAge: 604800,
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
