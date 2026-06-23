import type { Database } from '@ember/db';
import type { ServerRepository } from './repository/servers.repo';
import { ConflictError, ForbiddenError, NotFoundError } from '../../core/errors';
import type { CreateServerRequest, ServerDetailsDTO, ServerDTO, ServerMemberDTO, UpdateServerRequest } from '@ember/protocol';
import { toMemberDTO, toRoleDTO, toServerDTO } from './server.mapper';
import type { MemberRepository } from './repository/members.repo';
import type { RoleRepository } from './repository/roles.repo';
import { env } from '../../core/env';

export const createServerService = ({
    db,
    serverRepository,
    memberRepository,
    roleRepository,
}: {
    db: Database;
    serverRepository: ServerRepository;
    memberRepository: MemberRepository;
    roleRepository: RoleRepository;
}) => ({
    getMyServers: async (userId: string): Promise<ServerDTO[]> => {
        const servers = await memberRepository.findServersByUser(db, userId);
        return servers.map(toServerDTO);
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

        const [roles, roleIds] = await Promise.all([
            roleRepository.findByServer(db, serverId),
            memberRepository.findRoleIdsByMember(db, member.id),
        ]);

        return {
            ...toServerDTO(server),
            member: toMemberDTO(member, roleIds),
            roles: roles.map(toRoleDTO),
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
                permissions: 0n,
                position: 0,
            });

            return created;
        });

        return toServerDTO(server);
    },
    updateServer: async (userId: string, serverId: string, data: UpdateServerRequest): Promise<ServerDTO> => {
        const server = await serverRepository.findById(db, serverId);
        if (!server) throw new NotFoundError('Server not found');

        // todo: check permissions here
        if (server.ownerId !== userId) throw new ForbiddenError('Not allowed to manage this server');

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
