/**
 * Database row types.
 *
 * These mirror the SQL schema in `db/init/*.sql`. They are maintained by hand
 * because the schema is small and stable; if it grows, generate them instead.
 */

export type UserRole = "client" | "admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  avatar_url: string | null;
  role: UserRole;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

/** Internal credential row — never expose `password_hash` to a client. */
export interface ProfileWithPassword extends Profile {
  password_hash: string;
}

export interface ActivityLog {
  id: number;
  user_id: string;
  action: string;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

export interface PasswordResetToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Aggregate / derived types (admin panel)
// ---------------------------------------------------------------------------

/** A profile row joined with its activity count (used in the admin list). */
export interface UserListItem extends Profile {
  activity_count: number;
  last_active_at: string | null;
}

export type UserSort = "created_at" | "email" | "full_name" | "role";

export interface UserListQuery {
  search?: string;
  role?: UserRole;
  sort?: UserSort;
  direction?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface UserListResult {
  items: UserListItem[];
  total: number;
}

/** Aggregate statistics shown at the top of the admin dashboard. */
export interface UserStats {
  total: number;
  admins: number;
  clients: number;
  newLast7Days: number;
  newLast30Days: number;
  activeLast7Days: number;
}

