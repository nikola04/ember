import { db } from './db';
import { createChannelRepo } from '../modules/channels/repository/channels.repo';
import { createChannelService } from '../modules/channels/channel.service';
import { createMemberRepo } from '../modules/servers/repository/members.repo';
import { createRoleRepo } from '../modules/servers/repository/roles.repo';
import { createServerRepo } from '../modules/servers/repository/servers.repo';
import { createPermissionService } from '../modules/permissions/permission.service';
import { createServerService } from '../modules/servers/server.service';
import { createRoleService } from '../modules/servers/role.service';
import { createInviteRepo } from '../modules/invites/repository/invites.repo';
import { createInviteService } from '../modules/invites/invite.service';

export const repositories = {
    server: createServerRepo(),
    member: createMemberRepo(),
    role: createRoleRepo(),
    channel: createChannelRepo(),
    invite: createInviteRepo(),
};

export const permissionService = createPermissionService({
    db,
    memberRepository: repositories.member,
    roleRepository: repositories.role,
});

export const serverService = createServerService({
    db,
    permissionService,
    serverRepository: repositories.server,
    channelRepository: repositories.channel,
    memberRepository: repositories.member,
    roleRepository: repositories.role,
});

export const channelService = createChannelService({
    db,
    permissionService,
    channelRepository: repositories.channel,
    serverRepository: repositories.server,
});

export const inviteService = createInviteService({
    db,
    permissionService,
    serverRepository: repositories.server,
    memberRepository: repositories.member,
    inviteRepository: repositories.invite,
});

export const roleService = createRoleService({
    db,
    permissionService,
    serverRepository: repositories.server,
    memberRepository: repositories.member,
    roleRepository: repositories.role,
});
