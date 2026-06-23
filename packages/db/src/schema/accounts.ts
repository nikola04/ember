import { pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const ACCOUNT_PROVIDERS = ['password', 'google'] as const;
export type AccountProvider = (typeof ACCOUNT_PROVIDERS)[number];

export const accounts = pgTable(
    'accounts',
    {
        id: uuid().primaryKey().defaultRandom(),
        userId: uuid()
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        provider: text({ enum: ACCOUNT_PROVIDERS }).notNull(),

        // provider: password
        passwordHash: text(),
        // provider: oAuth
        providerAccountId: text(),
        accessToken: text(),
        refreshToken: text(),
        scope: text(),
        tokenType: text(),
        expiresAt: timestamp({ withTimezone: true }),

        createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [
        unique('accounts_user_provider_unique').on(t.userId, t.provider),
        unique('accounts_provider_account_unique').on(t.provider, t.providerAccountId),
    ]
);

export type Account = typeof accounts.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;
