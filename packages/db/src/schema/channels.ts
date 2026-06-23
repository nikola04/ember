import { pgTable, text, integer, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { servers } from './servers';
import { channelGroups } from './channel.groups';

export const channelTypes = ['text', 'voice'] as const;
export type ChannelType = (typeof channelTypes)[number];

export const channels = pgTable(
    'channels',
    {
        id: uuid().primaryKey().defaultRandom(),
        serverId: uuid()
            .notNull()
            .references(() => servers.id, { onDelete: 'cascade' }),
        groupId: uuid().references(() => channelGroups.id, { onDelete: 'set null' }),
        name: text().notNull(),
        type: text({ enum: channelTypes }).notNull(),
        position: integer().notNull().default(0),

        // text-specific
        topic: text(),
        retentionDays: integer(),

        // voice-specific
        bitrate: integer(),
        userLimit: integer(),

        createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [index('channels_server_idx').on(t.serverId), index('channels_group_idx').on(t.groupId)]
);

export type Channel = typeof channels.$inferSelect;
export type InsertChannel = typeof channels.$inferInsert;
