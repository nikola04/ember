import { users, type Executor } from '@ember/db';
import type { InsertUser, User } from '@ember/db/src/schema/users';
import { eq } from 'drizzle-orm';

export const createUserRepo = () => ({
    createUser: async (db: Executor, data: InsertUser): Promise<User> => {
        const [user] = await db.insert(users).values(data).returning();
        if (!user) throw new Error('createUser: insert returned no row');
        return user;
    },
    findByEmail: async (db: Executor, email: string): Promise<User | null> => {
        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        return user ?? null;
    },
});

export type UserRepository = ReturnType<typeof createUserRepo>;
