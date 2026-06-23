import Elysia from 'elysia';
import type { ServerService } from './server.service';
import { authGuard } from '../../plugins/auth.plugin';
import {
    channelDTO,
    createChannelRequest,
    createServerRequest,
    serverDetailsDTO,
    serverDTO,
    serverMemberDTO,
    updateServerRequest,
    z,
} from '@ember/protocol';
import type { ChannelService } from '../channels/channel.service';

export const createServerRoutes = (serverService: ServerService, channelService: ChannelService) =>
    new Elysia({ prefix: '/servers', detail: { tags: ['Server'] } })
        .use(authGuard)
        .guard({ auth: true })

        .get('/@me', ({ user }) => serverService.getMyServers(user.id), {
            response: { 200: z.array(serverDTO) },
            detail: { summary: 'List my servers' },
        })

        .get('/:id', ({ user, params }) => serverService.getServerById(user.id, params.id), {
            response: { 200: serverDetailsDTO },
            detail: { summary: 'Get server by id' },
        })

        .get('/:id/channels', ({ user, params }) => serverService.listChannels(user.id, params.id), {
            response: { 200: z.array(channelDTO) },
            detail: { summary: 'List server channels' },
        })

        .get('/:id/members', ({ user, params }) => serverService.listMembers(user.id, params.id), {
            response: { 200: z.array(serverMemberDTO) },
            detail: { summary: 'List server members' },
        })

        .post('/', ({ user, body }) => serverService.createServer(user.id, { server: body }), {
            body: createServerRequest,
            response: { 200: serverDTO },
            detail: { summary: 'Create server' },
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
        .post('/:serverId/channels', ({ user, params, body }) => channelService.createChannel(user.id, params.serverId, body), {
            body: createChannelRequest,
            response: { 200: channelDTO },
            detail: { summary: 'Create channel' },
        });
