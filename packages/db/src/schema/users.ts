import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: uuid().primaryKey().defaultRandom(),
    username: text().notNull().unique(),
    displayName: text().notNull(),
    email: text().notNull().unique(),
    emailVerified: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
