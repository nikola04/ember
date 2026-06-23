import {
    and,
    count,
    eq,
    serverMemberRoles,
    serverMembers,
    servers,
    users,
    type Executor,
    type InsertServerMember,
    type Server,
    type ServerMember,
} from '@ember/db';

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

    countByUser: async (db: Executor, userId: string): Promise<number> => {
        const [row] = await db.select({ count: count() }).from(serverMembers).where(eq(serverMembers.userId, userId));
        return row?.count ?? 0;
    },

    findServersByUser: async (db: Executor, userId: string): Promise<Server[]> => {
        const rows = await db
            .select({ server: servers })
            .from(serverMembers)
            .innerJoin(servers, eq(serverMembers.serverId, servers.id))
            .where(eq(serverMembers.userId, userId));
        return rows.map((r) => r.server);
    },

    findRoleIdsByMember: async (db: Executor, memberId: string): Promise<string[]> => {
        const rows = await db
            .select({ roleId: serverMemberRoles.roleId })
            .from(serverMemberRoles)
            .where(eq(serverMemberRoles.memberId, memberId));
        return rows.map((r) => r.roleId);
    },

    findMembersWithUsersByServer: async (db: Executor, serverId: string) => {
        return db
            .select({
                member: serverMembers,
                user: {
                    id: users.id,
                    username: users.username,
                    displayName: users.displayName,
                },
            })
            .from(serverMembers)
            .innerJoin(users, eq(serverMembers.userId, users.id))
            .where(eq(serverMembers.serverId, serverId));
    },

    findRoleAssignmentsByServer: async (db: Executor, serverId: string): Promise<{ memberId: string; roleId: string }[]> => {
        return db
            .select({
                memberId: serverMemberRoles.memberId,
                roleId: serverMemberRoles.roleId,
            })
            .from(serverMemberRoles)
            .innerJoin(serverMembers, eq(serverMemberRoles.memberId, serverMembers.id))
            .where(eq(serverMembers.serverId, serverId));
    },
});

export type MemberRepository = ReturnType<typeof createMemberRepo>;
