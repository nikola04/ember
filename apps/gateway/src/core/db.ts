import { createDatabaseClient } from '@ember/db';
import { env } from './env';

export const db = createDatabaseClient(env.DATABASE_URL);
