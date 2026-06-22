import { isUniqueViolation, uniqueViolationField, type AccountProvider, type Database, type Executor, type User } from '@ember/db';
import type { UserRepository } from './repository/user.repo';
import { ConflictError, UnauthorizedError } from '../../core/errors';
import type { AccountRepository } from './repository/account.repo';
import type { AuthUserDTO, LoginRequest, RegisterRequest } from '@ember/protocol';
import { toAuthUserDTO } from './auth.mapper';
import { signJwt } from '../../core/jwt';
import type { TokenPayload } from './auth.schemas';
import { randomBytes } from 'node:crypto';
import type { SessionRepository } from './repository/session.repo';

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

    const login = async (db: Executor, data: { userId: string }) => {
        const payload = { userId: data.userId };
        const accessToken = await signJwt<TokenPayload>({ payload, expiry: '10m' });

        const refreshToken = randomBytes(32).toString('hex');
        const refreshExpiry = new Date(Date.now() + 7 * 86400_000);
        await sessionRepository.createSession(db, { userId: data.userId, token: refreshToken, expiresAt: refreshExpiry });

        return { access_token: accessToken, refresh_token: refreshToken };
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
            if (!user) throw new UnauthorizedError('invalid credentials');

            const account = await accountRepository.findByUserAndProvider(db, user.id, 'password');
            if (!account?.passwordHash) throw new UnauthorizedError('invalid credentials');

            const verified = await Bun.password.verify(data.password, account.passwordHash);
            if (!verified) throw new UnauthorizedError('invalid credentials');

            const { access_token, refresh_token } = await login(db, { userId: user.id });
            return { user: toAuthUserDTO(user), access_token, refresh_token };
        },
        refresh: async (data: { refresh_token: string }) => {
            return await db.transaction(async (tx) => {
                const session = await sessionRepository.findSessionByToken(tx, data.refresh_token);
                if (!session) throw new UnauthorizedError('invalid refresh token');
                if (session.expiresAt < new Date()) throw new UnauthorizedError('refresh token expired');

                await sessionRepository.deleteSession(tx, session.id);

                return await login(tx, { userId: session.userId });
            });
        },
        logout: async (data: { refresh_token: string }) => {
            await sessionRepository.deleteSessionByToken(db, data.refresh_token);
        },
    };
};

export type AuthService = ReturnType<typeof createAuthService>;
