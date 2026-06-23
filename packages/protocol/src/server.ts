import { z } from 'zod';

export const createServerRequest = z.object({
    name: z.string().min(1, 'name is required').max(100, 'name too long').trim(),
    description: z.string().max(1000).trim().optional(),
    iconId: z.uuid().nullable().optional().default(null),
    bannerId: z.uuid().nullable().optional().default(null),
});
export type CreateServerRequest = z.infer<typeof createServerRequest>;

export const updateServerRequest = z.object({
    name: z.string().min(1).max(100).trim().optional(),
    description: z.string().max(1000).trim().nullable().optional(),
    iconId: z.uuid().nullable().optional(),
    bannerId: z.uuid().nullable().optional(),
});
export type UpdateServerRequest = z.infer<typeof updateServerRequest>;

export const serverDTO = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    ownerId: z.string(),
    iconId: z.string().nullable(),
    bannerId: z.string().nullable(),
    createdAt: z.string(), // ISO string
});

export type ServerDTO = z.infer<typeof serverDTO>;
