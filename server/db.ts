
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

const pool = new pg.Pool({
  connectionString: process.env.REPLIT_DB_URL || 'postgres://postgres:postgres@localhost:5432/postgres',
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Test database connection
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

console.log('Attempting to use PostgreSQL database');

export const db = drizzle(pool, { schema });
export { pool };
