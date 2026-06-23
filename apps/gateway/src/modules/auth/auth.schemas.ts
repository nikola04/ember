import { z } from '@ember/protocol';

export const tokenPayloadSchema = z.object({
    userId: z.uuid(),
});

export type TokenPayload = z.infer<typeof tokenPayloadSchema>;
