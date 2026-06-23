import { pgTable, text, integer, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { servers } from './servers';

export const channelGroups = pgTable(
    'channel_groups',
    {
        id: uuid().primaryKey().defaultRandom(),
        serverId: uuid()
            .notNull()
            .references(() => servers.id, { onDelete: 'cascade' }),
        name: text().notNull(),
        position: integer().notNull().default(0),
        createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [index('channel_groups_server_idx').on(t.serverId)]
);

export type ChannelGroup = typeof channelGroups.$inferSelect;
export type InsertChannelGroup = typeof channelGroups.$inferInsert;
