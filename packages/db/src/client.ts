import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const createDatabaseClient = (connectionString: string) => {
    const pool = new Pool({ connectionString });
    return drizzle(pool, { schema });
};

export type Database = ReturnType<typeof createDatabaseClient>;
export type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];
export type Executor = Database | Transaction;
