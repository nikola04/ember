import { z } from 'zod';

export const registerRequestSchema = z.object({
    username: z
        .string()
        .min(3, 'username must have at least 3 characters')
        .max(32, 'username must have at most 32 characters')
        .regex(/^[a-z0-9_]+$/, 'only lowercase letters, numbers and _ are allowed'),
    displayName: z.string().min(1, 'displayName is required').max(64, 'displayName must have at most 64 characters').trim(),
    email: z.email().toLowerCase().trim(),
    password: z.string().min(8, 'password must be at least 8 characters').max(128, 'password must have at most 128 characters'),
});
export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export const loginRequestSchema = z.object({
    email: z.email().toLowerCase().trim(),
    password: z.string().min(1, 'password is required'),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const AuthUserDTO = z.object({
    id: z.string(),
    username: z.string(),
    displayName: z.string(),
    email: z.string(),
    emailVerified: z.boolean(),
});
export type AuthUserDTO = z.infer<typeof AuthUserDTO>;
