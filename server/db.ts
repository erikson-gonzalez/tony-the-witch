import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Limit connections for serverless environments (each cold start creates a new pool)
  max: process.env.VERCEL ? 1 : 10,
  // Neon closes idle connections after ~5 min; recycle ours before that
  idleTimeoutMillis: 30_000,
});

// Without this handler, an error on an idle client (e.g. Neon dropping the
// socket) is an unhandled 'error' event and crashes the whole process.
pool.on("error", (err) => {
  console.error("[db] idle client error (connection will be recycled):", err.message);
});
export const db = drizzle(pool, { schema });
