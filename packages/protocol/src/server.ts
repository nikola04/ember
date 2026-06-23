import { z } from 'zod';
import { publicUserDTO } from './user';

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

export const roleDTO = z.object({
    id: z.string(),
    serverId: z.string(),
    name: z.string(),
    permissions: z.string(), // bigint serialized as string
    color: z.number().int().nullable(),
    position: z.number().int(),
    isDefault: z.boolean(),
});
export type RoleDTO = z.infer<typeof roleDTO>;

export const memberDTO = z.object({
    id: z.string(),
    serverId: z.string(),
    userId: z.string(),
    nickname: z.string().nullable(),
    joinedAt: z.string(),
    roleIds: z.array(z.string()),
});
export type MemberDTO = z.infer<typeof memberDTO>;

export const serverDetailsDTO = z.union([
    serverDTO.extend({
        member: memberDTO,
        roles: z.array(roleDTO),
    }),
    serverDTO,
]);
export type ServerDetailsDTO = z.infer<typeof serverDetailsDTO>;

export const serverMemberDTO = memberDTO.extend({
    user: publicUserDTO,
});
export type ServerMemberDTO = z.infer<typeof serverMemberDTO>;
