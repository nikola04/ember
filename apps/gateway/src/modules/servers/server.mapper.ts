import type { Server } from '@ember/db';
import type { ServerDTO } from '@ember/protocol';

export const toServerDTO = (server: Server): ServerDTO => ({
    id: server.id,
    name: server.name,
    description: server.description,
    ownerId: server.ownerId,
    iconId: server.iconId,
    bannerId: server.bannerId,
    createdAt: server.createdAt.toISOString(),
});
