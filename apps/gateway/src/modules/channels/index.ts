import { channelService } from '../../core/container';
import { createChannelRoutes } from './channel.routes';

export const channelModule = {
    plugin: createChannelRoutes(channelService),
    lifecycle: {},
};
