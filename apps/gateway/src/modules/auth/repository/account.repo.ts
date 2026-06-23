import { and, eq, accounts, type Account, type AccountProvider, type InsertAccount, type Executor } from '@ember/db';

export const createAccountRepo = () => ({
    createAccount: async (db: Executor, data: InsertAccount): Promise<Account> => {
        const [account] = await db.insert(accounts).values(data).returning();
        if (!account) throw new Error('createAccount: insert returned no row');
        return account;
    },
    findByUserAndProvider: async (db: Executor, userId: string, provider: AccountProvider): Promise<Account | null> => {
        const [account] = await db
            .select()
            .from(accounts)
            .where(and(eq(accounts.userId, userId), eq(accounts.provider, provider)))
            .limit(1);

        return account ?? null;
    },
});

export type AccountRepository = ReturnType<typeof createAccountRepo>;
