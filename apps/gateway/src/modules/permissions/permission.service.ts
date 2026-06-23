import type { Database } from '@ember/db';
import { computePermissions, hasPermission, type PermissionBit } from '../../core/permissions';
import type { MemberRepository } from '../servers/repository/members.repo';
import type { RoleRepository } from '../servers/repository/roles.repo';
import { ForbiddenError } from '../../core/errors';

export const createPermissionService = ({
    db,
    memberRepository,
    roleRepository,
}: {
    db: Database;
    memberRepository: MemberRepository;
    roleRepository: RoleRepository;
}) => ({
    hasPermissions: async (
        { userId, serverId, isOwner }: { userId: string; serverId: string; isOwner: boolean },
        ...permissions: PermissionBit[]
    ): Promise<boolean> => {
        if (isOwner) return true;

        const member = await memberRepository.findByServerAndUser(db, serverId, userId);
        if (!member) throw new ForbiddenError('Not a server member');

        const [defaultRole, memberRoles] = await Promise.all([
            roleRepository.findServerDefaultRole(db, serverId),
            roleRepository.findMemberRoles(db, member.id),
        ]);

        if (!defaultRole) throw new ForbiddenError('Not allowed to manage this server');

        const perms = computePermissions({ isOwner, memberRoles, defaultRole });
        return permissions.every((p) => hasPermission(perms, p));
    },
});

export type PermissionService = ReturnType<typeof createPermissionService>;
