/**
 * scripts/seed.ts
 *
 * Applies db/init/002_seed.sql (idempotent demo data) against DATABASE_URL.
 *
 *   npm run db:seed
 *
 * Demo credentials created:
 *   admin@example.com  / Admin1234
 *   client@example.com / Client1234
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { Client } from "pg";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const sql = await readFile(join(process.cwd(), "db", "init", "002_seed.sql"), "utf8");

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await client.query(sql);
    console.log("✓ seed complete");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
