import { pgTable, text, integer, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const assets = pgTable('assets', {
    id: uuid().primaryKey().defaultRandom(),
    path: text().notNull(),
    mimeType: text().notNull(),
    size: integer().notNull(), // bytes
    uploadedBy: uuid().references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = typeof assets.$inferInsert;
