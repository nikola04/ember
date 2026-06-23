import type { Database } from '@ember/db';
import type { CreateRoleRequest, RoleDTO, UpdateRoleRequest } from '@ember/protocol';
import { ConflictError, ForbiddenError, NotFoundError } from '../../core/errors';
import { hasPermission, Permissions } from '../../core/permissions';
import type { PermissionService } from '../permissions/permission.service';
import type { MemberRepository } from './repository/members.repo';
import type { ServerRepository } from './repository/servers.repo';
import type { RoleRepository } from './repository/roles.repo';
import { toRoleDTO } from './server.mapper';

export const createRoleService = ({
    db,
    permissionService,
    serverRepository,
    memberRepository,
    roleRepository,
}: {
    db: Database;
    permissionService: PermissionService;
    serverRepository: ServerRepository;
    memberRepository: MemberRepository;
    roleRepository: RoleRepository;
}) => ({
    listRoles: async (userId: string, serverId: string): Promise<RoleDTO[]> => {
        const requester = await memberRepository.findByServerAndUser(db, serverId, userId);
        if (!requester) throw new ForbiddenError('Not a member of this server');

        const roles = await roleRepository.findByServer(db, serverId);
        return roles.map(toRoleDTO);
    },

    createRole: async (userId: string, serverId: string, data: CreateRoleRequest): Promise<RoleDTO> => {
        const server = await serverRepository.findById(db, serverId);
        if (!server) throw new NotFoundError('Server not found');

        const isOwner = server.ownerId === userId;
        const requesterPerms = await permissionService.getPermissions({ userId, serverId, isOwner });

        if (!hasPermission(requesterPerms, Permissions.MANAGE_ROLES)) {
            throw new ForbiddenError('Not allowed to manage roles in this server');
        }

        const permissions = BigInt(data.permissions) & requesterPerms;

        const role = await db.transaction(async (tx) => {
            await roleRepository.elevateRolePositions(tx, serverId, { from: 0 });
            return roleRepository.createRole(tx, {
                serverId,
                name: data.name,
                color: data.color,
                permissions,
                position: 1,
                isDefault: false,
            });
        });
        return toRoleDTO(role);
    },

    updateRole: async (userId: string, serverId: string, roleId: string, data: UpdateRoleRequest): Promise<RoleDTO> => {
        const server = await serverRepository.findById(db, serverId);
        if (!server) throw new NotFoundError('Server not found');

        const role = await roleRepository.findById(db, roleId);
        if (!role || role.serverId !== serverId) throw new NotFoundError('Role not found');

        const isOwner = server.ownerId === userId;
        const ctx = await permissionService.getMemberContext({ userId, serverId, isOwner });

        if (!hasPermission(ctx.permissions, Permissions.MANAGE_ROLES)) {
            throw new ForbiddenError('Not allowed to manage roles in this server');
        }

        if (role.position >= ctx.highestRolePosition) {
            throw new ForbiddenError('Cannot update a role at or above your highest role');
        }

        const patch: Partial<Pick<typeof role, 'name' | 'color' | 'permissions'>> = {};
        if (data.name !== undefined) patch.name = data.name;
        if (data.color !== undefined) patch.color = data.color;
        if (data.permissions !== undefined) {
            const editable = ctx.permissions; // bits requestor is allowed to edit
            const locked = role.permissions & ~editable; // filter bits that requestor doesnt have
            const requestedEditable = BigInt(data.permissions) & editable; // only editable bits will be toggled rest will be 0
            patch.permissions = locked | requestedEditable; // leave locked as is and add newly edited
        }

        const updated = Object.keys(patch).length > 0 ? await roleRepository.updateRole(db, roleId, patch) : role;
        if (!updated) throw new NotFoundError('Role not found');

        return toRoleDTO(updated);
    },

    deleteRole: async (userId: string, serverId: string, roleId: string): Promise<void> => {
        const server = await serverRepository.findById(db, serverId);
        if (!server) throw new NotFoundError('Server not found');

        const role = await roleRepository.findById(db, roleId);
        if (!role || role.serverId !== serverId) throw new NotFoundError('Role not found');
        if (role.isDefault) throw new ConflictError('Cannot delete the default role');

        const isOwner = server.ownerId === userId;
        const ctx = await permissionService.getMemberContext({ userId, serverId, isOwner });

        if (!hasPermission(ctx.permissions, Permissions.MANAGE_ROLES)) {
            throw new ForbiddenError('Not allowed to manage roles in this server');
        }

        if (role.position >= ctx.highestRolePosition) {
            throw new ForbiddenError('Cannot delete a role at or above your highest role');
        }

        if (hasPermission(role.permissions, Permissions.ADMINISTRATOR) && !hasPermission(ctx.permissions, Permissions.ADMINISTRATOR)) {
            throw new ForbiddenError('Not allowed to delete an admin role');
        }

        await db.transaction(async (tx) => {
            const deleted = await roleRepository.deleteById(tx, roleId);
            if (!deleted) throw new NotFoundError('Role not found');
            await roleRepository.elevateRolePositions(tx, serverId, { from: role.position, offset: -1 });
        });
    },
});

export type RoleService = ReturnType<typeof createRoleService>;
