import type { Database } from '@ember/db';
import type { ServerRepository } from './repository/servers.repo';
import { ForbiddenError, NotFoundError } from '../../core/errors';
import type { CreateServerRequest, ServerDTO, UpdateServerRequest } from '@ember/protocol';
import { toServerDTO } from './server.mapper';
import type { MemberRepository } from './repository/members.repo';
import type { RoleRepository } from './repository/roles.repo';

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
    createServer: async (userId: string, data: { server: CreateServerRequest }): Promise<ServerDTO> => {
        const server = await db.transaction(async (tx) => {
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
