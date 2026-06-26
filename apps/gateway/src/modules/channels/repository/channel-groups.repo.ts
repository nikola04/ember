import { channelGroups, eq, type Executor, type InsertChannelGroup } from '@ember/db';
import type { ChannelGroup } from '@ember/db';

export const createChannelGroupRepo = () => ({
    create: async (db: Executor, data: InsertChannelGroup): Promise<ChannelGroup> => {
        const [group] = await db.insert(channelGroups).values(data).returning();
        if (!group) throw new Error('createChannelGroup: insert returned no row');
        return group;
    },

    findByServerId: async (db: Executor, serverId: string): Promise<ChannelGroup[]> => {
        return db.select().from(channelGroups).where(eq(channelGroups.serverId, serverId));
    },
});

export type ChannelGroupRepository = ReturnType<typeof createChannelGroupRepo>;
