import { channels, eq, type Channel, type Executor, type InsertChannel } from '@ember/db';

export const createChannelRepo = () => ({
    createChannel: async (db: Executor, data: InsertChannel): Promise<Channel> => {
        const [channel] = await db.insert(channels).values(data).returning();
        if (!channel) throw new Error('createChannel: insert returned no row');
        return channel;
    },

    findById: async (db: Executor, id: string): Promise<Channel | null> => {
        const [channel] = await db.select().from(channels).where(eq(channels.id, id)).limit(1);
        return channel ?? null;
    },

    deleteById: async (db: Executor, id: string): Promise<boolean> => {
        const deleted = await db.delete(channels).where(eq(channels.id, id)).returning({ id: channels.id });
        return deleted.length > 0;
    },
});

export type ChannelRepository = ReturnType<typeof createChannelRepo>;
