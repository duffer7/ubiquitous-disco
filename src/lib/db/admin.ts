import "server-only";

import { query, queryOne } from "@/lib/db";
import type {
  Profile,
  UserListQuery,
  UserListItem,
  UserListResult,
  UserRole,
  UserStats,
} from "@/types/database.types";

/**
 * Admin data-access layer.
 *
 * Responsibilities specific to the admin panel: listing/searching users with
 * pagination, aggregate statistics, and the per-user detail view. All queries
 * are parameterised — sort keys are whitelisted rather than interpolated.
 */

const LIST_COLUMNS = `
  p.id, p.email, p.full_name, p.company, p.avatar_url, p.role, p.phone,
  p.created_at, p.updated_at
`;

/** Whitelist of columns that may be used in `order by` (never interpolate raw). */
const SORT_COLUMNS: Record<UserListQuery["sort"] & string, string> = {
  created_at: "p.created_at",
  email: "p.email",
  full_name: "p.full_name",
  role: "p.role",
};

export async function listUsers(options: UserListQuery = {}): Promise<UserListResult> {
  const limit = Math.min(Math.max(options.limit ?? 20, 1), 100);
  const offset = Math.max(options.offset ?? 0, 0);
  const sortKey = SORT_COLUMNS[options.sort ?? "created_at"] ?? SORT_COLUMNS.created_at;
  const direction = options.direction === "asc" ? "asc" : "desc";

  const conditions: string[] = [];
  const values: unknown[] = [];

  if (options.search) {
    values.push(`%${options.search}%`);
    const i = values.length;
    conditions.push(
      `(p.email ilike $${i} or p.full_name ilike $${i} or p.company ilike $${i})`,
    );
  }
  if (options.role) {
    values.push(options.role);
    conditions.push(`p.role = $${values.length}::user_role`);
  }

  const where = conditions.length ? `where ${conditions.join(" and ")}` : "";

  const [items, countRow] = await Promise.all([
    query<UserListItem>(
      `select ${LIST_COLUMNS},
              count(al.id)::int as activity_count,
              max(al.created_at) as last_active_at
       from profiles p
       left join activity_logs al on al.user_id = p.id
       ${where}
       group by p.id
       order by ${sortKey} ${direction}
       limit $${values.length + 1} offset $${values.length + 2}`,
      [...values, limit, offset],
    ),
    query<{ count: string }>(
      `select count(*)::text as count from profiles p ${where}`,
      values,
    ),
  ]);

  return { items, total: Number(countRow[0]?.count ?? 0) };
}

/** Aggregate counters for the admin dashboard, computed in a single round-trip. */
export async function getUserStats(): Promise<UserStats> {
  const row = await queryOne<{
    total: number;
    admins: number;
    clients: number;
    new_last_7_days: number;
    new_last_30_days: number;
    active_last_7_days: number;
  }>(
    `select
       count(*)::int                                                          as total,
       count(*) filter (where role = 'admin')::int                            as admins,
       count(*) filter (where role = 'client')::int                           as clients,
       count(*) filter (where created_at >= now() - interval '7 days')::int   as new_last_7_days,
       count(*) filter (where created_at >= now() - interval '30 days')::int  as new_last_30_days,
       (
         select count(distinct user_id)::int
         from activity_logs
         where created_at >= now() - interval '7 days'
       )                                                                      as active_last_7_days
     from profiles`,
  );

  return {
    total: row?.total ?? 0,
    admins: row?.admins ?? 0,
    clients: row?.clients ?? 0,
    newLast7Days: row?.new_last_7_days ?? 0,
    newLast30Days: row?.new_last_30_days ?? 0,
    activeLast7Days: row?.active_last_7_days ?? 0,
  };
}

/** Number of users per role over the last N days (simple signup trend). */
export async function getSignupTrend(days = 14): Promise<{ day: string; count: number }[]> {
  const rows = await query<{ day: string; count: number }>(
    `select to_char(d.day, 'YYYY-MM-DD') as day,
            count(p.id)::int as count
     from generate_series(
            (now() - ($1 || ' days')::interval)::date,
            now()::date,
            interval '1 day'
          ) as d(day)
     left join profiles p on p.created_at::date = d.day
     group by d.day
     order by d.day`,
    [String(days)],
  );
  return rows;
}

/** Detail view: a single profile regardless of role. */
export async function findUserById(id: string): Promise<Profile | null> {
  return queryOne<Profile>(
    `select id, email, full_name, company, avatar_url, role, phone, created_at, updated_at
     from profiles where id = $1`,
    [id],
  );
}

/** Total number of administrators (used to prevent removing the last admin). */
export async function countAdmins(): Promise<number> {
  const row = await queryOne<{ count: string }>(
    `select count(*)::text as count from profiles where role = 'admin'`,
  );
  return Number(row?.count ?? 0);
}

/** Delete a profile. Cascades to activity logs and reset tokens. */
export async function deleteUser(id: string): Promise<void> {
  await query(`delete from profiles where id = $1`, [id]);
}

/** Change only the role of a user. */
export async function setUserRole(id: string, role: UserRole): Promise<Profile | null> {
  return queryOne<Profile>(
    `update profiles set role = $1, updated_at = now()
     where id = $2
     returning id, email, full_name, company, avatar_url, role, phone, created_at, updated_at`,
    [role, id],
  );
}
