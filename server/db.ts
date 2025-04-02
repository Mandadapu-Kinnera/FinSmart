import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema";

// Connect to PostgreSQL database
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Drizzle ORM instance with our schema
export const db = drizzle(pool, { schema });