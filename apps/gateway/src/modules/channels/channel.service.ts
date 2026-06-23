import type { Database, InsertChannel } from '@ember/db';
import type { ChannelDTO, CreateChannelRequest } from '@ember/protocol';
import { ForbiddenError, NotFoundError } from '../../core/errors';
import type { ServerRepository } from '../servers/repository/servers.repo';
import type { ChannelRepository } from './repository/channels.repo';
import { toChannelDTO } from './channel.mapper';

export const createChannelService = ({
    db,
    channelRepository,
    serverRepository,
}: {
    db: Database;
    channelRepository: ChannelRepository;
    serverRepository: ServerRepository;
}) => ({
    createChannel: async (userId: string, serverId: string, data: CreateChannelRequest): Promise<ChannelDTO> => {
        const server = await serverRepository.findById(db, serverId);
        if (!server) throw new NotFoundError('Server not found');

        // todo: check permissions here
        if (server.ownerId !== userId) throw new ForbiddenError('Not allowed to manage this server');

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

        const created = await channelRepository.createChannel(db, insert);
        return toChannelDTO(created);
    },

    deleteChannel: async (userId: string, channelId: string): Promise<void> => {
        const channel = await channelRepository.findById(db, channelId);
        if (!channel) throw new NotFoundError('Channel not found');

        const server = await serverRepository.findById(db, channel.serverId);
        if (!server) throw new NotFoundError('Server not found');

        // todo: check permissions here
        if (server.ownerId !== userId) throw new ForbiddenError('Not allowed to manage this server');

        const deleted = await channelRepository.deleteById(db, channelId);
        if (!deleted) throw new NotFoundError('Channel not found');
    },
});

export type ChannelService = ReturnType<typeof createChannelService>;
