import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '@/db/schema';

// Handle missing environment variables during build time
const url = process.env.TURSO_CONNECTION_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.warn('Database environment variables not found. Using placeholder client for build.');
}

const client = createClient({
  url: url || 'file:local.db',
  authToken: authToken || '',
});

export const db = drizzle(client, { schema });

export type Database = typeof db;