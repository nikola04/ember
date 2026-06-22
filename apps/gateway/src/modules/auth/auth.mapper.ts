import type { User } from '@ember/db/src/schema/users';
import type { AuthUserDTO } from '../../../../../packages/protocol/src';

export const toAuthUserDTO = (user: User): AuthUserDTO => ({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    emailVerified: !!user.emailVerified,
});
