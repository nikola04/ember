import z from 'zod';

export const tokenPayloadSchema = z.object({
    userId: z.string().uuid(),
});

export type TokenPayload = z.infer<typeof tokenPayloadSchema>;
