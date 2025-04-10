
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema';

console.log("Initializing database connection");

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: {
    rejectUnauthorized: false
  },
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  application_name: 'finsmart-app'
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

// Export pool and configured drizzle instance
export { pool };
export const db = drizzle(pool, { schema });
