import { channelService, inviteService, serverService } from '../../core/container';
import { createServerRoutes } from './server.routes';

export const serverModule = {
    plugin: createServerRoutes(serverService, channelService, inviteService),
    lifecycle: {},
};
