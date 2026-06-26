import { channelGroupService, channelService, inviteService, roleService, serverService } from '../../core/container';
import { createServerRoutes } from './server.routes';

export const serverModule = {
    plugin: createServerRoutes(serverService, channelService, channelGroupService, inviteService, roleService),
    lifecycle: {},
};
