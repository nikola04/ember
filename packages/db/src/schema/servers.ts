import { pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { assets } from './assets';

export const servers = pgTable(
    'servers',
    {
        id: uuid().primaryKey().defaultRandom(),
        name: text().notNull(),
        description: text(),
        ownerId: uuid()
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        iconId: uuid().references(() => assets.id, { onDelete: 'set null' }),
        bannerId: uuid().references(() => assets.id, { onDelete: 'set null' }),
        createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [index('servers_owner_idx').on(t.ownerId)]
);

export type Server = typeof servers.$inferSelect;
export type InsertServer = typeof servers.$inferInsert;
