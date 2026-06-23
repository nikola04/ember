import Elysia from 'elysia';
import type { ChannelService } from './channel.service';
import { authGuard } from '../../plugins/auth.plugin';

export const createChannelRoutes = (channelService: ChannelService) =>
    new Elysia({ prefix: '/servers/channels', detail: { tags: ['Channel'] } })
        .use(authGuard)
        .guard({ auth: true })

        .delete(
            '/:id',
            async ({ user, params, status }) => {
                await channelService.deleteChannel(user.id, params.id);
                return status(204);
            },
            { detail: { summary: 'Delete channel' } }
        );
