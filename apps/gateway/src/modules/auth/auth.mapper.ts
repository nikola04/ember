import type { User } from '@ember/db';
import type { AuthUserDTO } from '@ember/protocol';

export const toAuthUserDTO = (user: User): AuthUserDTO => ({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    emailVerified: !!user.emailVerified,
});
