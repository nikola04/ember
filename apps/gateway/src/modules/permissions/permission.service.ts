import type { Database } from '@ember/db';
import { ALL_PERMISSIONS, computePermissions, hasPermission, type PermissionBit } from '../../core/permissions';
import type { MemberRepository } from '../servers/repository/members.repo';
import type { RoleRepository } from '../servers/repository/roles.repo';
import { ForbiddenError } from '../../core/errors';

type Context = { userId: string; serverId: string; isOwner: boolean };

export interface MemberContext {
    permissions: bigint;
    highestRolePosition: number;
}

const OWNER_CONTEXT: MemberContext = {
    permissions: ALL_PERMISSIONS,
    highestRolePosition: Number.POSITIVE_INFINITY,
};

export const createPermissionService = ({
    db,
    memberRepository,
    roleRepository,
}: {
    db: Database;
    memberRepository: MemberRepository;
    roleRepository: RoleRepository;
}) => {
    const getMemberContext = async ({ userId, serverId, isOwner }: Context): Promise<MemberContext> => {
        if (isOwner) return OWNER_CONTEXT;

        const member = await memberRepository.findByServerAndUser(db, serverId, userId);
        if (!member) throw new ForbiddenError('Not a server member');

        const [defaultRole, memberRoles] = await Promise.all([
            roleRepository.findServerDefaultRole(db, serverId),
            roleRepository.findMemberRoles(db, member.id),
        ]);

        if (!defaultRole) throw new ForbiddenError('Not allowed to manage this server');

        const permissions = computePermissions({ isOwner, memberRoles, defaultRole });
        const highestRolePosition = memberRoles.reduce((max, r) => Math.max(max, r.position), defaultRole.position);

        return { permissions, highestRolePosition };
    };

    const getPermissions = async (ctx: Context): Promise<bigint> => (await getMemberContext(ctx)).permissions;

    return {
        getMemberContext,
        getPermissions,
        hasPermissions: async (ctx: Context, ...permissions: PermissionBit[]): Promise<boolean> => {
            const perms = await getPermissions(ctx);
            return permissions.every((p) => hasPermission(perms, p));
        },
    };
};

export type PermissionService = ReturnType<typeof createPermissionService>;
