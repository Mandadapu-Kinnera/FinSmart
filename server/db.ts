
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema';

console.log("Initializing database connection");

// Create connection pool with better retry and timeout settings
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: {
    rejectUnauthorized: false
  },
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
});

// Add error handler to pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1); // Exit on critical errors
});

// Add connect handler
pool.on('connect', () => {
  console.log('Successfully connected to database');
});

// Export pool and configured drizzle instance
export { pool };
export const db = drizzle(pool, { schema });
