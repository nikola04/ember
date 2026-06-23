import type { ServerRole } from '@ember/db';
import { ALL_PERMISSIONS, Permissions } from '@ember/protocol';

export { ALL_PERMISSIONS, Permissions, hasPermission, parsePermissions, type PermissionBit } from '@ember/protocol';

export const DEFAULT_EVERYONE_PERMISSIONS =
    Permissions.VIEW_CHANNEL |
    Permissions.SEND_MESSAGES |
    Permissions.JOIN_VOICE |
    Permissions.SPEAK |
    Permissions.VIDEO |
    Permissions.CREATE_INVITE;

interface ComputeInput {
    isOwner: boolean;
    defaultRole: ServerRole;
    memberRoles: ServerRole[];
}

export const computePermissions = (input: ComputeInput): bigint => {
    if (input.isOwner) return ALL_PERMISSIONS;

    const perms = input.memberRoles.reduce((acc, role) => acc | role.permissions, input.defaultRole.permissions);

    if (perms & Permissions.ADMINISTRATOR) return ALL_PERMISSIONS;

    // todo: should check overwrites also

    return perms;
};
