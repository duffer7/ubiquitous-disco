import "server-only";

import { query } from "@/lib/db";
import type { ActivityLog } from "@/types/database.types";

/** Data-access for the activity log. */

export interface ActivityQuery {
  /** Restrict to a single user (the client dashboard). Omit for all users. */
  userId?: string;
  /** Free-text filter applied to the action name. */
  action?: string;
  /** ISO date (inclusive) lower bound. */
  from?: string;
  /** ISO date (exclusive) upper bound. */
  to?: string;
  limit?: number;
  offset?: number;
}

export interface ActivityPage {
  items: ActivityLog[];
  total: number;
}

function buildWhere(params: ActivityQuery): { clause: string; values: unknown[] } {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (params.userId) {
    values.push(params.userId);
    conditions.push(`user_id = $${values.length}`);
  }
  if (params.action) {
    values.push(`%${params.action}%`);
    conditions.push(`action ilike $${values.length}`);
  }
  if (params.from) {
    values.push(params.from);
    conditions.push(`created_at >= $${values.length}`);
  }
  if (params.to) {
    values.push(params.to);
    conditions.push(`created_at < $${values.length}`);
  }

  return {
    clause: conditions.length ? `where ${conditions.join(" and ")}` : "",
    values,
  };
}

/** Recent activity for a single user (client dashboard). */
export async function getRecentActivity(userId: string, limit = 10): Promise<ActivityLog[]> {
  return query<ActivityLog>(
    `select id, user_id, action, metadata, host(ip_address) as ip_address, created_at
     from activity_logs
     where user_id = $1
     order by created_at desc
     limit $2`,
    [userId, limit],
  );
}

/** Filtered, paginated activity query with a total count (both panels). */
export async function getActivityPage(options: ActivityQuery = {}): Promise<ActivityPage> {
  const limit = Math.min(Math.max(options.limit ?? 20, 1), 100);
  const offset = Math.max(options.offset ?? 0, 0);
  const { clause, values } = buildWhere(options);

  const [items, countRow] = await Promise.all([
    query<ActivityLog>(
      `select id, user_id, action, metadata, host(ip_address) as ip_address, created_at
       from activity_logs
       ${clause}
       order by created_at desc
       limit $${values.length + 1} offset $${values.length + 2}`,
      [...values, limit, offset],
    ),
    query<{ count: string }>(
      `select count(*)::text as count from activity_logs ${clause}`,
      values,
    ),
  ]);

  return { items, total: Number(countRow[0]?.count ?? 0) };
}

/** Distinct action names, for building filter dropdowns. */
export async function getActivityActions(userId?: string): Promise<string[]> {
  const rows = await query<{ action: string }>(
    `select distinct action from activity_logs
     ${userId ? "where user_id = $1" : ""}
     order by action`,
    userId ? [userId] : [],
  );
  return rows.map((r) => r.action);
}
