import { db } from '../../core/db';
import { createUserRepo } from '../auth/repository/user.repo';
import { createUserRoutes } from './user.routes';
import { createUserService } from './user.service';

const userService = createUserService({
    db,
    userRepository: createUserRepo(),
});

export const userModule = {
    plugin: createUserRoutes(userService),
    lifecycle: {},
};
