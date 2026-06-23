import Elysia from 'elysia';
import type { ServerService } from './server.service';
import { authGuard } from '../../plugins/auth.plugin';
import {
    channelDTO,
    createChannelRequest,
    createServerRequest,
    inviteCodeDTO,
    inviteDTO,
    serverDetailsDTO,
    serverDTO,
    serverMemberDTO,
    serverMembershipDTO,
    updateServerRequest,
    z,
} from '@ember/protocol';
import type { ChannelService } from '../channels/channel.service';
import type { InviteService } from '../invites/invite.service';

export const createServerRoutes = (serverService: ServerService, channelService: ChannelService, inviteService: InviteService) =>
    new Elysia({ prefix: '/servers', detail: { tags: ['Server'] } })
        .use(authGuard)
        .guard({ auth: true })

        .post('/', ({ user, body }) => serverService.createServer(user.id, { server: body }), {
            body: createServerRequest,
            response: { 200: serverDTO },
            detail: { summary: 'Create server' },
        })

        .get('/@me', ({ user }) => serverService.getMyServers(user.id), {
            response: { 200: z.array(serverDTO) },
            detail: { summary: 'List my servers' },
        })

        .get('/:id', ({ user, params }) => serverService.getServerById(user.id, params.id), {
            response: { 200: serverDetailsDTO },
            detail: { summary: 'Get server by id' },
        })

        .get('/:id/@me', ({ user, params }) => serverService.getMyMembership(user.id, params.id), {
            response: { 200: serverMembershipDTO },
            detail: { summary: 'Get my membership in this server' },
        })

        .patch('/:id', ({ user, params, body }) => serverService.updateServer(user.id, params.id, body), {
            body: updateServerRequest,
            response: { 200: serverDTO },
            detail: { summary: 'Update server' },
        })

        .delete(
            '/:id',
            async ({ user, params, status }) => {
                await serverService.deleteServer(user.id, params.id);
                return status(204);
            },
            { detail: { summary: 'Delete server' } }
        )

        // channels
        .post('/:id/channels', ({ user, params, body }) => channelService.createChannel(user.id, params.id, body), {
            body: createChannelRequest,
            response: { 200: channelDTO },
            detail: { summary: 'Create channel' },
        })

        .get('/:id/channels', ({ user, params }) => serverService.listChannels(user.id, params.id), {
            response: { 200: z.array(channelDTO) },
            detail: { summary: 'List server channels' },
        })

        // members
        .get('/:id/members', ({ user, params }) => serverService.listMembers(user.id, params.id), {
            response: { 200: z.array(serverMemberDTO) },
            detail: { summary: 'List server members' },
        })

        .get('/:id/members/:userId', ({ user, params }) => serverService.getMember(user.id, params.id, params.userId), {
            response: { 200: serverMemberDTO },
            detail: { summary: 'Get a member of this server' },
        })

        // invites
        .get('/:id/invites', ({ user, params }) => inviteService.listInvites(user.id, params.id), {
            response: { 200: z.array(inviteDTO) },
            detail: { summary: 'List server invites' },
        })

        .post('/:id/invites', ({ user, params }) => inviteService.createInvite(user.id, params.id), {
            response: { 200: inviteCodeDTO },
            detail: { summary: 'Create server invite' },
        })

        .delete(
            '/:id/invites/:code',
            async ({ user, params, status }) => {
                await inviteService.deleteInvite(user.id, params.id, params.code);
                return status(204);
            },
            { detail: { summary: 'Delete server invite' } }
        );
