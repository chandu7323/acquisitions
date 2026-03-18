import 'dotenv/config';

import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

if (process.env.NODE_ENV === 'development') {
  neonConfig.fetchEndpoint = 'http://neon-local:5432/sql';
}

// Fallback to neon-local connection string if environment variable is missing
const connectionString =
  process.env.DATABASE_URL ||
  'postgres://neon:npg@neon-local:5432/acquisitions?sslmode=disable';
const sql = neon(connectionString);
const db = drizzle(sql);

export { db, sql };
