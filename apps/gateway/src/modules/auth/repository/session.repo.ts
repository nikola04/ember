import { sessions, type Executor } from '@ember/db';
import type { InsertSession, Session } from '@ember/db/src/schema/sessions';
import { eq } from 'drizzle-orm';

export const createSessionRepo = () => ({
    createSession: async (db: Executor, data: InsertSession): Promise<Session> => {
        const [session] = await db
            .insert(sessions)
            .values({
                userId: data.userId,
                token: data.token,
                expiresAt: data.expiresAt,
            })
            .returning();

        if (!session) throw new Error('createSession: insert returned no row');

        return session;
    },
    findSessionByToken: async (db: Executor, token: string) => {
        const [session] = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);

        return session ?? null;
    },
    deleteSession: async (db: Executor, sessionId: string) => {
        await db.delete(sessions).where(eq(sessions.id, sessionId));
    },
    deleteSessionByToken: async (db: Executor, token: string) => {
        await db.delete(sessions).where(eq(sessions.token, token));
    },
});

export type SessionRepository = ReturnType<typeof createSessionRepo>;
