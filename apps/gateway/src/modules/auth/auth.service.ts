import { isUniqueViolation, uniqueViolationField, type Database } from '@ember/db';
import type { UserRepository } from './repository/user.repo';
import { ConflictError, UnauthorizedError } from '../../core/errors';
import type { AccountRepository } from './repository/account.repo';
import type { AccountProvider } from '@ember/db/src/schema/accounts';
import type { User } from '@ember/db/src/schema/users';
import type { AuthUserDTO, LoginRequest, RegisterRequest } from '@ember/protocol';
import { toAuthUserDTO } from './auth.mapper';
import { signJwt } from '../../core/jwt';
import type { TokenPayload } from './auth.schemas';
import { randomBytes } from 'node:crypto';
import type { SessionRepository } from './repository/session.repo';
import { logger } from '../../core/logger';

interface RegisterUser {
    username: string;
    email: string;
    displayName: string;
}
interface RegisterAccount {
    provider: AccountProvider;
    passwordHash?: string;
    providerAccountId?: string;
    accessToken?: string;
    refreshToken?: string;
    scope?: string;
    tokenType?: string;
    expiresAt?: Date;
}

export const createAuthService = ({
    db,
    userRepository,
    accountRepository,
    sessionRepository,
}: {
    db: Database;
    userRepository: UserRepository;
    accountRepository: AccountRepository;
    sessionRepository: SessionRepository;
}) => {
    const register = async (data: { user: RegisterUser; account: RegisterAccount }): Promise<{ user: User }> => {
        try {
            return await db.transaction(async (tx) => {
                const user = await userRepository.createUser(tx, {
                    username: data.user.username,
                    email: data.user.email,
                    displayName: data.user.displayName,
                });
                await accountRepository.createAccount(tx, {
                    ...data.account,
                    userId: user.id,
                });

                return { user };
            });
        } catch (e) {
            if (isUniqueViolation(e)) {
                if (uniqueViolationField(e, 'email')) throw new ConflictError('email is already taken');
                if (uniqueViolationField(e, 'username')) throw new ConflictError('username is already taken');
                throw new ConflictError('unexpected conflict occured');
            }
            throw e;
        }
    };

    const login = async (data: { user: User }) => {
        const payload = { userId: data.user.id };
        const accessToken = await signJwt<TokenPayload>({ payload, expiry: '10m' });

        const refreshToken = randomBytes(32).toString('hex');
        const refreshExpiry = new Date(Date.now() + 7 * 86400_000);
        await sessionRepository.createSession(db, { userId: data.user.id, token: refreshToken, expiresAt: refreshExpiry });

        return { user: toAuthUserDTO(data.user), accessToken, refreshToken };
    };

    return {
        registerWithPassword: async (data: RegisterRequest): Promise<AuthUserDTO> => {
            const hashedPassword = await Bun.password.hash(data.password);
            const { user } = await register({
                user: {
                    username: data.username,
                    displayName: data.displayName,
                    email: data.email,
                },
                account: {
                    provider: 'password',
                    passwordHash: hashedPassword,
                },
            });

            return toAuthUserDTO(user);
        },
        loginWithPassword: async (data: LoginRequest) => {
            const user = await userRepository.findByEmail(db, data.email);
            if (!user) throw new UnauthorizedError('Invalid credentials');

            const account = await accountRepository.findByUserAndProvider(db, user.id, 'password');
            if (!account?.passwordHash) throw new UnauthorizedError('Invalid credentials');

            const verified = await Bun.password.verify(data.password, account.passwordHash);
            if (!verified) throw new UnauthorizedError('Invalid credentials');

            return await login({ user });
        },
    };
};

export type AuthService = ReturnType<typeof createAuthService>;
