import { isUniqueViolation, uniqueViolationField, type Database, type InsertChannel } from '@ember/db';
import type { ChannelDTO, CreateChannelRequest } from '@ember/protocol';
import { ConflictError, ForbiddenError, NotFoundError } from '../../core/errors';
import type { ServerRepository } from '../servers/repository/servers.repo';
import type { ChannelRepository } from './repository/channels.repo';
import { toChannelDTO } from './channel.mapper';
import type { PermissionService } from '../permissions/permission.service';
import { Permissions } from '../../core/permissions';

export const createChannelService = ({
    db,
    permissionService,
    channelRepository,
    serverRepository,
}: {
    db: Database;
    permissionService: PermissionService;
    channelRepository: ChannelRepository;
    serverRepository: ServerRepository;
}) => ({
    createChannel: async (userId: string, serverId: string, data: CreateChannelRequest): Promise<ChannelDTO> => {
        const server = await serverRepository.findById(db, serverId);
        if (!server) throw new NotFoundError('Server not found');

        const hasPerms = await permissionService.hasPermissions(
            { serverId, userId, isOwner: server.ownerId === userId },
            Permissions.MANAGE_CHANNELS
        );
        if (!hasPerms) throw new ForbiddenError('Not allowed to manage channels in this server');

        const insert: InsertChannel = {
            serverId,
            name: data.name,
            type: data.type,
            groupId: data.groupId,
            position: data.position,
            topic: data.type === 'text' ? data.topic : undefined,
            retentionDays: data.type === 'text' ? data.retentionDays : undefined,
            bitrate: data.type === 'voice' ? data.bitrate : undefined,
            userLimit: data.type === 'voice' ? data.userLimit : undefined,
        };

        const created = await channelRepository.createChannel(db, insert).catch((e) => {
            if (isUniqueViolation(e) && uniqueViolationField(e, 'name')) throw new ConflictError('channel with that name already exists');
            throw e;
        });
        return toChannelDTO(created);
    },

    deleteChannel: async (userId: string, channelId: string): Promise<void> => {
        const channel = await channelRepository.findById(db, channelId);
        if (!channel) throw new NotFoundError('Channel not found');

        const server = await serverRepository.findById(db, channel.serverId);
        if (!server) throw new NotFoundError('Server not found');

        const hasPerms = await permissionService.hasPermissions(
            { serverId: server.id, userId, isOwner: server.ownerId === userId },
            Permissions.MANAGE_CHANNELS
        );
        if (!hasPerms) throw new ForbiddenError('Not allowed to manage channels in this server');

        const deleted = await channelRepository.deleteById(db, channelId);
        if (!deleted) throw new NotFoundError('Channel not found');
    },
});

export type ChannelService = ReturnType<typeof createChannelService>;
