import { and, eq, servers, type Executor, type InsertServer, type Server } from '@ember/db';
import type { UpdateServerRequest } from '@ember/protocol';

export const createServerRepo = () => ({
    createServer: async (db: Executor, data: InsertServer) => {
        const [server] = await db.insert(servers).values(data).returning();
        if (!server) throw new Error('createServer: insert returned no row');
        return server;
    },

    findById: async (db: Executor, id: string): Promise<Server | null> => {
        const [server] = await db.select().from(servers).where(eq(servers.id, id)).limit(1);
        return server ?? null;
    },

    updateServer: async (db: Executor, id: string, data: UpdateServerRequest): Promise<Server | null> => {
        const patch: Record<string, unknown> = {};
        if (data.name !== undefined) patch.name = data.name;
        if (data.description !== undefined) patch.description = data.description;
        if (data.iconId !== undefined) patch.iconId = data.iconId;
        if (data.bannerId !== undefined) patch.bannerId = data.bannerId;

        if (Object.keys(patch).length === 0) {
            const [current] = await db.select().from(servers).where(eq(servers.id, id)).limit(1);
            return current ?? null;
        }

        const [updated] = await db.update(servers).set(patch).where(eq(servers.id, id)).returning();
        return updated ?? null;
    },

    deleteUserServer: async (db: Executor, ownerId: string, id: string): Promise<boolean> => {
        const deleted = await db
            .delete(servers)
            .where(and(eq(servers.ownerId, ownerId), eq(servers.id, id)))
            .returning({ id: servers.id });

        return deleted.length > 0;
    },
});

export type ServerRepository = ReturnType<typeof createServerRepo>;
