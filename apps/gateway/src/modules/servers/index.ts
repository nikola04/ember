import { db } from '../../core/db';
import { createMemberRepo } from './repository/members.repo';
import { createRoleRepo } from './repository/roles.repo';
import { createServerRepo } from './repository/servers.repo';
import { createServerRoutes } from './server.routes';
import { createServerService } from './server.service';

const serverService = createServerService({
    db,
    serverRepository: createServerRepo(),
    memberRepository: createMemberRepo(),
    roleRepository: createRoleRepo(),
});

export const serverModule = {
    plugin: createServerRoutes(serverService),
    lifecycle: {},
};
