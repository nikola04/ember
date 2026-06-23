import Elysia from 'elysia';
import type { ServerService } from './server.service';
import { authGuard } from '../../plugins/auth.plugin';
import { createChannelRequest, createServerRequest, updateServerRequest } from '@ember/protocol';
import type { ChannelService } from '../channels/channel.service';

export const createServerRoutes = (serverService: ServerService, channelService: ChannelService) =>
    new Elysia({ prefix: '/servers', detail: { tags: ['Server'] } })
        .use(authGuard)
        .guard({ auth: true })

        .get('/@me', ({ user }) => serverService.getMyServers(user.id), { detail: { summary: 'List my servers' } })

        .post('/', ({ user, body }) => serverService.createServer(user.id, { server: body }), {
            body: createServerRequest,
            detail: { summary: 'Create server' },
        })

        .patch('/:id', ({ user, params, body }) => serverService.updateServer(user.id, params.id, body), {
            body: updateServerRequest,
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
            detail: { summary: 'Create channel' },
        });
