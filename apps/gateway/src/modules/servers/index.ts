import { channelService, serverService } from '../../core/container';
import { createServerRoutes } from './server.routes';

export const serverModule = {
    plugin: createServerRoutes(serverService, channelService),
    lifecycle: {},
};
