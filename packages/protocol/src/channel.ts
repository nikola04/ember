import { z } from 'zod';

export const channelTypes = ['text', 'voice'] as const;
export type ChannelType = (typeof channelTypes)[number];

const baseCreate = z.object({
    name: z
        .string()
        .min(1, 'name is required')
        .max(100, 'name too long')
        .trim()
        .regex(/^[a-z0-9-_]+$/, 'only lowercase letters, numbers, - and _ are allowed'),
    groupId: z.uuid().optional().nullable().default(null),
    position: z.number().int().nonnegative().optional(),
});

const createTextChannelRequest = baseCreate.extend({
    type: z.literal('text'),
    topic: z.string().max(1024).optional(),
    retentionDays: z.number().int().positive().optional(),
});

const createVoiceChannelRequest = baseCreate.extend({
    type: z.literal('voice'),
    bitrate: z.number().int().min(8000).max(384000).optional(),
    userLimit: z.number().int().min(0).max(99).optional(),
});

export const createChannelRequest = z.discriminatedUnion('type', [createTextChannelRequest, createVoiceChannelRequest]);
export type CreateChannelRequest = z.infer<typeof createChannelRequest>;

export const channelDTO = z.object({
    id: z.string(),
    serverId: z.string(),
    groupId: z.string().nullable(),
    name: z.string(),
    type: z.enum(channelTypes),
    position: z.number().int(),
    topic: z.string().nullable(),
    retentionDays: z.number().int().nullable(),
    bitrate: z.number().int().nullable(),
    userLimit: z.number().int().nullable(),
    createdAt: z.string(),
});
export type ChannelDTO = z.infer<typeof channelDTO>;
