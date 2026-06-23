import { z } from 'zod';

export const inviteCodeDTO = z.object({
    code: z.string(),
});
export type InviteCodeDTO = z.infer<typeof inviteCodeDTO>;

export const inviteDTO = z.object({
    code: z.string(),
    memberId: z.string(),
});
export type InviteDTO = z.infer<typeof inviteDTO>;
