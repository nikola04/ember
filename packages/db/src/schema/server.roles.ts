import { pgTable, text, integer, bigint, timestamp, uuid, boolean, primaryKey, index, unique, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { servers } from './servers';
import { serverMembers } from './server.members';

export const serverRoles = pgTable(
    'server_roles',
    {
        id: uuid().primaryKey().defaultRandom(),
        serverId: uuid()
            .notNull()
            .references(() => servers.id, { onDelete: 'cascade' }),
        name: text().notNull(),
        permissions: bigint({ mode: 'bigint' })
            .notNull()
            .default(0 as unknown as bigint), // bitfield
        color: integer(),
        position: integer().notNull().default(0),
        isDefault: boolean().notNull().default(false),
        createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [
        index('server_roles_server_idx').on(t.serverId),
        uniqueIndex('server_roles_default_uq')
            .on(t.serverId)
            .where(sql`"isDefault"`),
        unique('server_roles_position').on(t.serverId, t.position),
    ]
);

export type ServerRole = typeof serverRoles.$inferSelect;
export type InsertServerRole = typeof serverRoles.$inferInsert;

export const serverMemberRoles = pgTable(
    'server_member_roles',
    {
        memberId: uuid()
            .notNull()
            .references(() => serverMembers.id, { onDelete: 'cascade' }),
        roleId: uuid()
            .notNull()
            .references(() => serverRoles.id, { onDelete: 'cascade' }),
    },
    (t) => [primaryKey({ columns: [t.memberId, t.roleId] })]
);

export type ServerMemberRole = typeof serverMemberRoles.$inferSelect;
export type InsertServerMemberRole = typeof serverMemberRoles.$inferInsert;
