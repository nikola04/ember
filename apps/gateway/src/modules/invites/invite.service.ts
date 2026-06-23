import { isUniqueViolation, type Database } from '@ember/db';
import type { InviteCodeDTO, InviteDTO } from '@ember/protocol';
import { ConflictError, ForbiddenError, NotFoundError } from '../../core/errors';
import { Permissions } from '../../core/permissions';
import type { PermissionService } from '../permissions/permission.service';
import type { ServerRepository } from '../servers/repository/servers.repo';
import type { MemberRepository } from '../servers/repository/members.repo';
import type { InviteRepository } from './repository/invites.repo';

const CODE_ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CODE_LENGTH = 8;
const CODE_MAX_ATTEMPTS = 3;

const generateCode = (): string => {
    const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));
    let out = '';
    for (let i = 0; i < CODE_LENGTH; i++) out += CODE_ALPHABET[bytes[i]! % CODE_ALPHABET.length];
    return out;
};

export const createInviteService = ({
    db,
    permissionService,
    serverRepository,
    memberRepository,
    inviteRepository,
}: {
    db: Database;
    permissionService: PermissionService;
    serverRepository: ServerRepository;
    memberRepository: MemberRepository;
    inviteRepository: InviteRepository;
}) => ({
    createInvite: async (userId: string, serverId: string): Promise<InviteCodeDTO> => {
        const server = await serverRepository.findById(db, serverId);
        if (!server) throw new NotFoundError('Server not found');

        const member = await memberRepository.findByServerAndUser(db, serverId, userId);
        if (!member) throw new ForbiddenError('Not a member of this server');

        const hasPerms = await permissionService.hasPermissions(
            { userId, serverId, isOwner: server.ownerId === userId },
            Permissions.CREATE_INVITE
        );
        if (!hasPerms) throw new ForbiddenError('Not allowed to create invites in this server');

        for (let attempt = 0; attempt < CODE_MAX_ATTEMPTS; attempt++) {
            try {
                const invite = await inviteRepository.createInvite(db, {
                    code: generateCode(),
                    serverId,
                    memberId: member.id,
                });
                return { code: invite.code };
            } catch (e) {
                if (attempt < CODE_MAX_ATTEMPTS - 1 && isUniqueViolation(e)) continue;
                throw e;
            }
        }
        throw new ConflictError('Failed to generate unique invite code');
    },

    listInvites: async (userId: string, serverId: string): Promise<InviteDTO[]> => {
        const server = await serverRepository.findById(db, serverId);
        if (!server) throw new NotFoundError('Server not found');

        const hasPerms = await permissionService.hasPermissions(
            { userId, serverId, isOwner: server.ownerId === userId },
            Permissions.MANAGE_SERVER
        );
        if (!hasPerms) throw new ForbiddenError('Not allowed to view invites in this server');

        const invites = await inviteRepository.findByServerId(db, serverId);
        return invites.map((i) => ({ code: i.code, memberId: i.memberId }));
    },

    deleteInvite: async (userId: string, serverId: string, code: string): Promise<void> => {
        const server = await serverRepository.findById(db, serverId);
        if (!server) throw new NotFoundError('Server not found');

        const invite = await inviteRepository.findByCode(db, code);
        if (!invite || invite.serverId !== serverId) throw new NotFoundError('Invite not found');

        const member = await memberRepository.findByServerAndUser(db, serverId, userId);
        const isCreator = !!member && member.id === invite.memberId;

        if (!isCreator) {
            const hasPerms = await permissionService.hasPermissions(
                { userId, serverId, isOwner: server.ownerId === userId },
                Permissions.MANAGE_SERVER
            );
            if (!hasPerms) throw new ForbiddenError('Not allowed to delete this invite');
        }

        const deleted = await inviteRepository.deleteByServerAndCode(db, serverId, code);
        if (!deleted) throw new NotFoundError('Invite not found');
    },
});

export type InviteService = ReturnType<typeof createInviteService>;
