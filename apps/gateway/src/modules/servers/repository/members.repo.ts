import { and, eq, serverMembers, servers, type Executor, type InsertServerMember, type ServerMember, type Server } from '@ember/db';

export const createMemberRepo = () => ({
    createMember: async (db: Executor, data: InsertServerMember): Promise<ServerMember> => {
        const [member] = await db.insert(serverMembers).values(data).returning();
        if (!member) throw new Error('createMember: insert returned no row');
        return member;
    },

    findByServerAndUser: async (db: Executor, serverId: string, userId: string): Promise<ServerMember | null> => {
        const [member] = await db
            .select()
            .from(serverMembers)
            .where(and(eq(serverMembers.serverId, serverId), eq(serverMembers.userId, userId)))
            .limit(1);
        return member ?? null;
    },

    findServersByUser: async (db: Executor, userId: string): Promise<Server[]> => {
        const rows = await db
            .select({ server: servers })
            .from(serverMembers)
            .innerJoin(servers, eq(serverMembers.serverId, servers.id))
            .where(eq(serverMembers.userId, userId));
        return rows.map((r) => r.server);
    },
});

export type MemberRepository = ReturnType<typeof createMemberRepo>;
