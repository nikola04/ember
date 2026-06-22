import { sessions, type Executor } from '@ember/db';
import type { InsertSession, Session } from '@ember/db/src/schema/sessions';

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
});

export type SessionRepository = ReturnType<typeof createSessionRepo>;
