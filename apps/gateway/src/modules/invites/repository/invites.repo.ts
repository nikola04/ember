import { and, eq, serverInvites, type Executor, type InsertServerInvite, type ServerInvite } from '@ember/db';

export const createInviteRepo = () => ({
    createInvite: async (db: Executor, data: InsertServerInvite): Promise<ServerInvite> => {
        const [invite] = await db.insert(serverInvites).values(data).returning();
        if (!invite) throw new Error('createInvite: insert returned no row');
        return invite;
    },

    findByCode: async (db: Executor, code: string): Promise<ServerInvite | null> => {
        const [invite] = await db.select().from(serverInvites).where(eq(serverInvites.code, code)).limit(1);
        return invite ?? null;
    },

    findByServerId: async (db: Executor, serverId: string): Promise<ServerInvite[]> => {
        return db.select().from(serverInvites).where(eq(serverInvites.serverId, serverId));
    },

    deleteByServerAndCode: async (db: Executor, serverId: string, code: string): Promise<boolean> => {
        const deleted = await db
            .delete(serverInvites)
            .where(and(eq(serverInvites.serverId, serverId), eq(serverInvites.code, code)))
            .returning({ code: serverInvites.code });
        return deleted.length > 0;
    },
});

export type InviteRepository = ReturnType<typeof createInviteRepo>;
