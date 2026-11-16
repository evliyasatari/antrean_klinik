import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as relations from './relations';
import 'dotenv/config';

// disable prefetch jika memakai connection pooler Supabase (port 6543)
const client = postgres(process.env.DATABASE_URL!, { prepare: false });
export const db = drizzle(client, { schema: { ...schema, ...relations } });