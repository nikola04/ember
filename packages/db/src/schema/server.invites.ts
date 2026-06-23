import { pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { servers } from './servers';
import { serverMembers } from './server.members';

export const serverInvites = pgTable(
    'server_invites',
    {
        code: text().primaryKey(),
        serverId: uuid()
            .notNull()
            .references(() => servers.id, { onDelete: 'cascade' }),
        memberId: uuid()
            .notNull()
            .references(() => serverMembers.id, { onDelete: 'cascade' }),
        createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [index('server_invites_server_idx').on(t.serverId), index('server_invites_member_idx').on(t.memberId)]
);

export type ServerInvite = typeof serverInvites.$inferSelect;
export type InsertServerInvite = typeof serverInvites.$inferInsert;
