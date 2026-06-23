import { and, eq, serverMemberRoles, serverRoles, type Executor, type InsertServerRole, type ServerRole } from '@ember/db';

export const createRoleRepo = () => ({
    createRole: async (db: Executor, data: InsertServerRole): Promise<ServerRole> => {
        const [role] = await db.insert(serverRoles).values(data).returning();
        if (!role) throw new Error('createRole: insert returned no row');
        return role;
    },

    findServerDefaultRole: async (db: Executor, serverId: string): Promise<ServerRole | null> => {
        const [role] = await db
            .select()
            .from(serverRoles)
            .where(and(eq(serverRoles.isDefault, true), eq(serverRoles.serverId, serverId)))
            .limit(1);

        return role ?? null;
    },

    findMemberRoles: async (db: Executor, memberId: string): Promise<ServerRole[]> => {
        return await db
            .select({ role: serverRoles })
            .from(serverMemberRoles)
            .innerJoin(serverRoles, eq(serverRoles.id, serverMemberRoles.roleId))
            .where(eq(serverMemberRoles.memberId, memberId))
            .then((roles) => roles.map((r) => r.role));
    },

    findByServer: async (db: Executor, serverId: string): Promise<ServerRole[]> => {
        return db.select().from(serverRoles).where(eq(serverRoles.serverId, serverId));
    },
});

export type RoleRepository = ReturnType<typeof createRoleRepo>;
