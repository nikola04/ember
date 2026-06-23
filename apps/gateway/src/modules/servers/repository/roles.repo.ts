import { and, eq, gt, serverMemberRoles, serverRoles, sql, type Executor, type InsertServerRole, type ServerRole } from '@ember/db';

export const createRoleRepo = () => ({
    createRole: async (db: Executor, data: InsertServerRole): Promise<ServerRole> => {
        const [role] = await db.insert(serverRoles).values(data).returning();
        if (!role) throw new Error('createRole: insert returned no row');
        return role;
    },

    elevateRolePositions: async (db: Executor, serverId: string, { from, offset = 1 }: { from: number; offset?: number }) => {
        await db
            .update(serverRoles)
            .set({ position: sql`${serverRoles.position} + ${offset}` })
            .where(and(eq(serverRoles.serverId, serverId), gt(serverRoles.position, from)));
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

    findById: async (db: Executor, id: string): Promise<ServerRole | null> => {
        const [role] = await db.select().from(serverRoles).where(eq(serverRoles.id, id)).limit(1);
        return role ?? null;
    },

    updateRole: async (
        db: Executor,
        id: string,
        patch: Partial<Pick<InsertServerRole, 'name' | 'color' | 'permissions'>>
    ): Promise<ServerRole | null> => {
        const [updated] = await db.update(serverRoles).set(patch).where(eq(serverRoles.id, id)).returning();
        return updated ?? null;
    },

    deleteById: async (db: Executor, id: string): Promise<boolean> => {
        const deleted = await db.delete(serverRoles).where(eq(serverRoles.id, id)).returning({ id: serverRoles.id });
        return deleted.length > 0;
    },
});

export type RoleRepository = ReturnType<typeof createRoleRepo>;
