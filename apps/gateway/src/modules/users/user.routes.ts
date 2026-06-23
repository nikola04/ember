import Elysia from 'elysia';
import { userDTO } from '@ember/protocol';
import { authGuard } from '../../plugins/auth.plugin';
import type { UserService } from './user.service';

export const createUserRoutes = (userService: UserService) =>
    new Elysia({ prefix: '/users', detail: { tags: ['User'] } })
        .use(authGuard)
        .guard({ auth: true })

        .get('/@me', ({ user }) => userService.getMe(user.id), {
            response: { 200: userDTO },
            detail: { summary: 'Get current user' },
        });
