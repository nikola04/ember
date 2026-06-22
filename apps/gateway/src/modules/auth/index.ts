import { createAuthRoutes } from './auth.routes';
import { createAuthService } from './auth.service';
import { createAccountRepo } from './repository/account.repo';
import { createSessionRepo } from './repository/session.repo';
import { createUserRepo } from './repository/user.repo';
import { db } from '../../core/db';

const authService = createAuthService({
    db,
    userRepository: createUserRepo(),
    accountRepository: createAccountRepo(),
    sessionRepository: createSessionRepo(),
});

export const authModule = {
    plugin: createAuthRoutes(authService),
    lifecycle: {},
};
