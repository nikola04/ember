import { pgTable, text, timestamp, uuid, index, unique } from 'drizzle-orm/pg-core';
import { users } from './users';
import { servers } from './servers';

export const serverMembers = pgTable(
    'server_members',
    {
        id: uuid().primaryKey().defaultRandom(),
        serverId: uuid()
            .notNull()
            .references(() => servers.id, { onDelete: 'cascade' }),
        userId: uuid()
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        nickname: text(), // on null use displayName
        joinedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [
        unique('server_members_server_user_uq').on(t.serverId, t.userId),
        index('server_members_user_idx').on(t.userId),
        index('server_members_server_idx').on(t.serverId),
    ]
);

export type ServerMember = typeof serverMembers.$inferSelect;
export type InsertServerMember = typeof serverMembers.$inferInsert;
