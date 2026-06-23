import type { User } from '@ember/db';
import type { UserDTO } from '@ember/protocol';

export const toUserDTO = (user: User): UserDTO => ({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    emailVerified: !!user.emailVerified,
    createdAt: user.createdAt.toISOString(),
});
