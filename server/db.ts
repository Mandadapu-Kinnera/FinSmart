
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema';

console.log("Initializing database connection");

// Create connection pool with better timeout and retry settings
const pool = new pg.Pool({
  connectionString: process.env.REPLIT_DB_URL || 'postgres://postgres:postgres@localhost:5432/postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Add error handler to pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

// Test database connection
pool.connect((err, client, done) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Successfully connected to database');
    done();
  }
});

// Export pool and configured drizzle instance
export { pool };
export const db = drizzle(pool, { schema });
