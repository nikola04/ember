export const Permissions = {
    VIEW_CHANNEL: 1n << 0n,
    SEND_MESSAGES: 1n << 1n,
    MANAGE_MESSAGES: 1n << 2n, // manage messages from others
    JOIN_VOICE: 1n << 3n,
    SPEAK: 1n << 4n,
    VIDEO: 1n << 5n,
    MANAGE_CHANNELS: 1n << 6n,
    MANAGE_ROLES: 1n << 7n, // lower than his, non-admin roles
    KICK_MEMBERS: 1n << 8n,
    BAN_MEMBERS: 1n << 9n,
    MANAGE_SERVER: 1n << 10n,
    CREATE_INVITE: 1n << 11n,
    ADMINISTRATOR: 1n << 12n,
} as const;

export type PermissionBit = (typeof Permissions)[keyof typeof Permissions];

export const ALL_PERMISSIONS = Object.values(Permissions).reduce((acc, p) => acc | p, 0n);

export const hasPermission = (perms: bigint, permission: PermissionBit): boolean => (perms & permission) === permission;

export const parsePermissions = (perms: string): bigint => BigInt(perms);
