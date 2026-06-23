import { db } from '../../core/db';
import { createServerRepo } from '../servers/repository/servers.repo';
import { createChannelRepo } from './repository/channels.repo';
import { createChannelRoutes } from './channel.routes';
import { createChannelService } from './channel.service';

const channelService = createChannelService({
    db,
    channelRepository: createChannelRepo(),
    serverRepository: createServerRepo(),
});

export const channelModule = {
    plugin: createChannelRoutes(channelService),
    lifecycle: {},
};
