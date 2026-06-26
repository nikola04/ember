import type { Database } from '@ember/db';
import type { ChannelGroupDTO, CreateChannelGroupRequest } from '@ember/protocol';
import { ForbiddenError, NotFoundError } from '../../core/errors';
import { Permissions } from '../../core/permissions';
import type { PermissionService } from '../permissions/permission.service';
import type { ServerRepository } from '../servers/repository/servers.repo';
import type { ChannelGroupRepository } from './repository/channel-groups.repo';

export const createChannelGroupService = ({
    db,
    permissionService,
    channelGroupRepository,
    serverRepository,
}: {
    db: Database;
    permissionService: PermissionService;
    channelGroupRepository: ChannelGroupRepository;
    serverRepository: ServerRepository;
}) => ({
    listGroups: async (userId: string, serverId: string): Promise<ChannelGroupDTO[]> => {
        const server = await serverRepository.findById(db, serverId);
        if (!server) throw new NotFoundError('Server not found');

        const member = await permissionService.hasPermissions({ serverId, userId, isOwner: server.ownerId === userId });
        if (!member) throw new ForbiddenError('Not a member of this server');

        const groups = await channelGroupRepository.findByServerId(db, serverId);
        return groups
            .sort((a, b) => a.position - b.position)
            .map((g) => ({ id: g.id, serverId: g.serverId, name: g.name, position: g.position, createdAt: g.createdAt.toISOString() }));
    },

    createGroup: async (userId: string, serverId: string, data: CreateChannelGroupRequest): Promise<ChannelGroupDTO> => {
        const server = await serverRepository.findById(db, serverId);
        if (!server) throw new NotFoundError('Server not found');

        const hasPerms = await permissionService.hasPermissions(
            { serverId, userId, isOwner: server.ownerId === userId },
            Permissions.MANAGE_CHANNELS
        );
        if (!hasPerms) throw new ForbiddenError('Not allowed to manage channels in this server');

        const group = await channelGroupRepository.create(db, {
            serverId,
            name: data.name,
            position: data.position ?? 0,
        });

        return {
            id: group.id,
            serverId: group.serverId,
            name: group.name,
            position: group.position,
            createdAt: group.createdAt.toISOString(),
        };
    },
});

export type ChannelGroupService = ReturnType<typeof createChannelGroupService>;
