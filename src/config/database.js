import 'dotenv/config';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { DrizzleD1Database } from 'drizzle-orm/d1';

const sql = neon(process.env.DTABASE_URL);
const db = drizzle(sql);

export {db, sql};