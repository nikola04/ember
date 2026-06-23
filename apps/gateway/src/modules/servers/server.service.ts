import type { Database } from '@ember/db';
import type { ServerRepository } from './repository/servers.repo';
import { ConflictError, ForbiddenError, NotFoundError } from '../../core/errors';
import type {
    ChannelDTO,
    CreateServerRequest,
    ServerDetailsDTO,
    ServerDTO,
    ServerMemberDTO,
    ServerMembershipDTO,
    UpdateServerRequest,
} from '@ember/protocol';
import { toMemberDTO, toRoleDTO, toServerDTO } from './server.mapper';
import type { MemberRepository } from './repository/members.repo';
import type { RoleRepository } from './repository/roles.repo';
import { env } from '../../core/env';
import { computePermissions, DEFAULT_EVERYONE_PERMISSIONS, Permissions } from '../../core/permissions';
import type { PermissionService } from '../permissions/permission.service';
import type { ChannelRepository } from '../channels/repository/channels.repo';
import { toChannelDTO } from '../channels/channel.mapper';

export const createServerService = ({
    db,
    permissionService,
    serverRepository,
    channelRepository,
    memberRepository,
    roleRepository,
}: {
    db: Database;
    permissionService: PermissionService;
    serverRepository: ServerRepository;
    channelRepository: ChannelRepository;
    memberRepository: MemberRepository;
    roleRepository: RoleRepository;
}) => ({
    getMyServers: async (userId: string): Promise<ServerDTO[]> => {
        const servers = await memberRepository.findServersByUser(db, userId);
        return servers.map(toServerDTO);
    },

    listChannels: async (userId: string, serverId: string): Promise<ChannelDTO[]> => {
        const server = await serverRepository.findById(db, serverId);
        if (!server) throw new NotFoundError('Server not found');

        const requester = await memberRepository.findByServerAndUser(db, serverId, userId);
        if (!requester) throw new ForbiddenError('Not a member of this server');

        const channels = await channelRepository.findByServerId(db, serverId);
        return channels.map(toChannelDTO);
    },

    listMembers: async (userId: string, serverId: string): Promise<ServerMemberDTO[]> => {
        const server = await serverRepository.findById(db, serverId);
        if (!server) throw new NotFoundError('Server not found');

        const requester = await memberRepository.findByServerAndUser(db, serverId, userId);
        if (!requester) throw new ForbiddenError('Not a member of this server');

        const [rows, roleAssignments] = await Promise.all([
            memberRepository.findMembersWithUsersByServer(db, serverId),
            memberRepository.findRoleAssignmentsByServer(db, serverId),
        ]);

        const roleMap = new Map<string, string[]>();
        for (const { memberId, roleId } of roleAssignments) {
            const ids = roleMap.get(memberId);
            if (ids) ids.push(roleId);
            else roleMap.set(memberId, [roleId]);
        }

        return rows.map(({ member, user }) => ({
            ...toMemberDTO(member, roleMap.get(member.id) ?? []),
            user,
        }));
    },

    getServerById: async (userId: string, serverId: string): Promise<ServerDetailsDTO> => {
        const server = await serverRepository.findById(db, serverId);
        if (!server) throw new NotFoundError('Server not found');

        const member = await memberRepository.findByServerAndUser(db, serverId, userId);
        if (!member) return toServerDTO(server);

        const roles = await roleRepository.findByServer(db, serverId);
        return {
            ...toServerDTO(server),
            roles: roles.map(toRoleDTO),
        };
    },

    getMyMembership: async (userId: string, serverId: string): Promise<ServerMembershipDTO> => {
        const server = await serverRepository.findById(db, serverId);
        if (!server) throw new NotFoundError('Server not found');

        const row = await memberRepository.findWithUserByServerAndUser(db, serverId, userId);
        if (!row) throw new NotFoundError('Membership not found');

        const isOwner = server.ownerId === userId;
        const [defaultRole, memberRoles] = await Promise.all([
            roleRepository.findServerDefaultRole(db, serverId),
            roleRepository.findMemberRoles(db, row.member.id),
        ]);
        if (!defaultRole) throw new NotFoundError('Server default role missing');

        const permissions = computePermissions({ isOwner, defaultRole, memberRoles });

        return {
            ...toMemberDTO(
                row.member,
                memberRoles.map((r) => r.id)
            ),
            user: row.user,
            permissions: permissions.toString(),
        };
    },

    getMember: async (userId: string, serverId: string, targetUserId: string): Promise<ServerMemberDTO> => {
        const requester = await memberRepository.findByServerAndUser(db, serverId, userId);
        if (!requester) throw new ForbiddenError('Not a member of this server');

        const row = await memberRepository.findWithUserByServerAndUser(db, serverId, targetUserId);
        if (!row) throw new NotFoundError('Member not found');

        const roleIds = await memberRepository.findRoleIdsByMember(db, row.member.id);

        return {
            ...toMemberDTO(row.member, roleIds),
            user: row.user,
        };
    },

    createServer: async (userId: string, data: { server: CreateServerRequest }): Promise<ServerDTO> => {
        const server = await db.transaction(async (tx) => {
            const memberships = await memberRepository.countByUser(tx, userId);
            if (memberships >= env.MAX_USER_SERVERS) {
                throw new ConflictError(`Server limit reached (max ${env.MAX_USER_SERVERS})`);
            }

            const created = await serverRepository.createServer(tx, {
                name: data.server.name,
                description: data.server.description,
                iconId: data.server.iconId,
                bannerId: data.server.bannerId,
                ownerId: userId,
            });

            await memberRepository.createMember(tx, {
                serverId: created.id,
                userId,
            });

            await roleRepository.createRole(tx, {
                serverId: created.id,
                name: '@everyone',
                isDefault: true,
                permissions: DEFAULT_EVERYONE_PERMISSIONS,
                position: 0,
            });

            return created;
        });

        return toServerDTO(server);
    },

    updateServer: async (userId: string, serverId: string, data: UpdateServerRequest): Promise<ServerDTO> => {
        const server = await serverRepository.findById(db, serverId);
        if (!server) throw new NotFoundError('Server not found');

        const hasPerms = await permissionService.hasPermissions(
            { userId, serverId, isOwner: server.ownerId === userId },
            Permissions.MANAGE_SERVER
        );
        if (!hasPerms) throw new ForbiddenError('Not allowed to manage this server');

        const updated = await serverRepository.updateServer(db, serverId, {
            name: data.name,
            description: data.description,
            iconId: data.iconId,
            bannerId: data.bannerId,
        });
        if (!updated) throw new NotFoundError('Server not found');

        return toServerDTO(updated);
    },

    deleteServer: async (userId: string, serverId: string) => {
        const deleted = await serverRepository.deleteUserServer(db, userId, serverId);
        if (!deleted) throw new NotFoundError('failed or server not found');
    },
});

export type ServerService = ReturnType<typeof createServerService>;
