import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Connection will be created when DATABASE_URL is provided
export function createDbClient(connectionString: string) {
  const client = postgres(connectionString);
  return drizzle(client, { schema });
}

export type DbClient = ReturnType<typeof createDbClient>;
