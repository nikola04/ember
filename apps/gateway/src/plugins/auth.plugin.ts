import { Elysia } from 'elysia';
import { verifyJwt } from '../core/jwt';
import { UnauthorizedError } from '../core/errors';
import { tokenPayloadSchema } from '../modules/auth/auth.schemas';

export interface AuthUser {
    id: string;
}

export const authPlugin = new Elysia({ name: 'auth-plugin' }).derive({ as: 'global' }, ({ cookie: { access_token }, headers }) => {
    const resolveUser = async (): Promise<AuthUser> => {
        const authHeader = headers.authorization;
        const token = (access_token?.value as string | undefined) ?? (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined);

        if (!token) throw new UnauthorizedError('No token provided');

        const rawPayload = await verifyJwt(token);
        const parsedPayload = tokenPayloadSchema.safeParse(rawPayload);
        if (parsedPayload.error) throw new UnauthorizedError('Invalid token');
        const payload = parsedPayload.data;

        return { id: payload.userId };
    };

    return { resolveUser };
});

export const authGuard = new Elysia({ name: 'auth-guard' }).use(authPlugin).macro({
    requireAuth: {
        resolve: async ({ resolveUser }) => {
            const user = await resolveUser();
            return { user };
        },
    },
});
