import { db } from '../../core/db';
import { createChannelService } from '../channels/channel.service';
import { createChannelRepo } from '../channels/repository/channels.repo';
import { createMemberRepo } from './repository/members.repo';
import { createRoleRepo } from './repository/roles.repo';
import { createServerRepo } from './repository/servers.repo';
import { createServerRoutes } from './server.routes';
import { createServerService } from './server.service';

const serverRepository = createServerRepo();

const serverService = createServerService({
    db,
    serverRepository,
    memberRepository: createMemberRepo(),
    roleRepository: createRoleRepo(),
});

const channelService = createChannelService({
    db,
    serverRepository,
    channelRepository: createChannelRepo(),
});

export const serverModule = {
    plugin: createServerRoutes(serverService, channelService),
    lifecycle: {},
};
