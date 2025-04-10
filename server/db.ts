
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

export const pool = new pg.Pool({
  connectionString: process.env.REPLIT_DB_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export const db = drizzle(pool, { schema });
