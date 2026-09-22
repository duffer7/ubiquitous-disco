import "server-only";

import { Pool, type PoolClient, type QueryResultRow } from "pg";

import { getServerEnv } from "@/lib/env";

/**
 * PostgreSQL connection pool.
 *
 * A single pool is shared across the server process. In development Next.js
 * hot-reloads modules, which would otherwise create a new pool on every
 * reload and exhaust connections — so we cache the pool on `globalThis`.
 *
 * All queries go through `query()` / `withTransaction()` which centralise
 * parameterisation (protecting against SQL injection) and error logging.
 */

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

function createPool(): Pool {
  const pool = new Pool({
    connectionString: getServerEnv().DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

  pool.on("error", (err) => {
    // Unexpected errors on idle clients should not crash the app.
    console.error("[db] unexpected idle client error", err);
  });

  return pool;
}

function getPool(): Pool {
  if (!global.__pgPool) {
    global.__pgPool = createPool();
  }
  return global.__pgPool;
}

/**
 * Run a parameterised query and return the rows.
 *
 *   const users = await query<Profile>("select * from profiles where role = $1", ["admin"]);
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const start = Date.now();
  try {
    const result = await getPool().query<T>(text, params);
    if (process.env.NODE_ENV === "development") {
      console.debug(`[db] ${Date.now() - start}ms · ${text.slice(0, 80)}`);
    }
    return result.rows;
  } catch (error) {
    console.error("[db] query error", { text, error });
    throw error;
  }
}

/** Run a query expected to return at most one row. */
export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/**
 * Run a set of statements inside a single transaction.
 * The client is always released, and the transaction is rolled back on error.
 *
 *   await withTransaction(async (client) => {
 *     await client.query("insert into ...", [...]);
 *     await client.query("update ...", [...]);
 *   });
 */
export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("begin");
    const result = await fn(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
