
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema';

console.log("Initializing database connection");

// Only initialize real database connection if we're not using in-memory storage
let pool: pg.Pool;

if (process.env.USE_DATABASE === 'true' && process.env.DATABASE_URL) {
  pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    application_name: 'finsmart-app',
    statement_timeout: 10000,
    query_timeout: 10000,
    connectionTimeoutMillis: 10000,
    idle_in_transaction_session_timeout: 10000
  });

  // Add error handler to pool
  pool.on('error', (err) => {
    console.error('Database connection error:', err);
  });

  // Add connect handler
  pool.on('connect', () => {
    console.log('Successfully connected to database');
  });

  // Test connection
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Database connection test failed:', err);
    } else {
      console.log('Database connection test successful');
    }
  });
} else {
  console.log('Database connection skipped - using in-memory storage for optimal performance');
  // Create a minimal pool for compatibility
  pool = new pg.Pool({
    connectionString: 'postgresql://dummy:dummy@localhost:5432/dummy',
    max: 1,
    idleTimeoutMillis: 1000,
    connectionTimeoutMillis: 1000
  });
}

// Export pool and configured drizzle instance
export { pool };
export const db = drizzle(pool, { schema });
