import { eq, serverRoles, type Executor, type InsertServerRole, type ServerRole } from '@ember/db';

export const createRoleRepo = () => ({
    createRole: async (db: Executor, data: InsertServerRole): Promise<ServerRole> => {
        const [role] = await db.insert(serverRoles).values(data).returning();
        if (!role) throw new Error('createRole: insert returned no row');
        return role;
    },

    findByServer: async (db: Executor, serverId: string): Promise<ServerRole[]> => {
        return db.select().from(serverRoles).where(eq(serverRoles.serverId, serverId));
    },
});

export type RoleRepository = ReturnType<typeof createRoleRepo>;
