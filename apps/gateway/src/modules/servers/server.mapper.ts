import type { Server, ServerMember, ServerRole } from '@ember/db';
import type { MemberDTO, RoleDTO, ServerDTO } from '@ember/protocol';

export const toServerDTO = (server: Server): ServerDTO => ({
    id: server.id,
    name: server.name,
    description: server.description,
    ownerId: server.ownerId,
    iconId: server.iconId,
    bannerId: server.bannerId,
    createdAt: server.createdAt.toISOString(),
});

export const toRoleDTO = (role: ServerRole): RoleDTO => ({
    id: role.id,
    serverId: role.serverId,
    name: role.name,
    permissions: role.permissions.toString(),
    color: role.color,
    position: role.position,
    isDefault: role.isDefault,
});

export const toMemberDTO = (member: ServerMember, roleIds: string[]): MemberDTO => ({
    id: member.id,
    serverId: member.serverId,
    userId: member.userId,
    nickname: member.nickname,
    joinedAt: member.joinedAt.toISOString(),
    roleIds,
});
