import type { Database } from '@ember/db';
import type { UserDTO } from '@ember/protocol';
import { NotFoundError } from '../../core/errors';
import type { UserRepository } from '../auth/repository/user.repo';
import { toUserDTO } from './user.mapper';

export const createUserService = ({ db, userRepository }: { db: Database; userRepository: UserRepository }) => ({
    getMe: async (userId: string): Promise<UserDTO> => {
        const user = await userRepository.findById(db, userId);
        if (!user) throw new NotFoundError('User not found');
        return toUserDTO(user);
    },
});

export type UserService = ReturnType<typeof createUserService>;
