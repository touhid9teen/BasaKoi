import { neon, neonConfig } from "@neondatabase/serverless";

// Configure Neon for serverless environments (applies globally)
neonConfig.fetchConnectionCache = true;

let sqlClient: ReturnType<typeof neon> | null = null;

/**
 * Get or create the Neon SQL client.
 * Uses lazy initialization so the app doesn't crash at import time
 * if DATABASE_URL is not set.
 *
 * Returns a tagged-template SQL executor. Usage:
 *   const sql = getSql();
 *   const rows = await sql`SELECT * FROM properties`;
 */
export function getSql() {
  if (!sqlClient) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error(
        "DATABASE_URL environment variable is not set. " +
          "Please set it in your .env.local file. " +
          "Example: DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
      );
    }
    sqlClient = neon(databaseUrl);
  }
  return sqlClient;
}

export default getSql;
