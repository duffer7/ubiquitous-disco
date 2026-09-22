/**
 * scripts/migrate.ts
 *
 * Applies every SQL file in db/init (in filename order) against DATABASE_URL.
 *
 * The Docker postgres image already runs these files on first initialisation,
 * so this script is mainly for applying schema changes to an existing database
 * (local or remote) without recreating the volume.
 *
 *   npm run db:migrate
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { Client } from "pg";

const INIT_DIR = join(process.cwd(), "db", "init");

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const files = (await readdir(INIT_DIR)).filter((f) => f.endsWith(".sql")).sort();
  if (files.length === 0) {
    console.error(`No .sql files found in ${INIT_DIR}`);
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    for (const file of files) {
      const sql = await readFile(join(INIT_DIR, file), "utf8");
      console.log(`→ applying ${file}`);
      await client.query(sql);
    }
    console.log("✓ migrations complete");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
