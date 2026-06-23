import type { Channel } from '@ember/db';
import type { ChannelDTO } from '@ember/protocol';

export const toChannelDTO = (channel: Channel): ChannelDTO => ({
    id: channel.id,
    serverId: channel.serverId,
    groupId: channel.groupId,
    name: channel.name,
    type: channel.type,
    position: channel.position,
    topic: channel.topic,
    retentionDays: channel.retentionDays,
    bitrate: channel.bitrate,
    userLimit: channel.userLimit,
    createdAt: channel.createdAt.toISOString(),
});
