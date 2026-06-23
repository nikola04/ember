import { z } from 'zod';

export const userDTO = z.object({
    id: z.string(),
    username: z.string(),
    displayName: z.string(),
    email: z.string(),
    emailVerified: z.boolean(),
    createdAt: z.string(),
});
export type UserDTO = z.infer<typeof userDTO>;

export const publicUserDTO = z.object({
    id: z.string(),
    username: z.string(),
    displayName: z.string(),
});
export type PublicUserDTO = z.infer<typeof publicUserDTO>;
