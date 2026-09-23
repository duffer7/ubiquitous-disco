import "server-only";

import { query, queryOne } from "@/lib/db";
import type { Profile, UserRole } from "@/types/database.types";

/**
 * User data-access layer.
 *
 * All SQL for users lives here so that callers work with typed objects and
 * never build queries by hand. Column names are explicit (no `select *`) to
 * keep the mapping stable.
 */

export interface UserCredentials {
  profile: Profile;
  passwordHash: string;
}

/** Profile fields that a client may edit on their own account. */
export type ProfileSelfEditable = Pick<Profile, "full_name" | "company" | "phone" | "avatar_url">;

/** Extra profile fields an administrator may additionally edit. */
export type ProfileAdminEditable = ProfileSelfEditable & Pick<Profile, "email" | "role">;

const PROFILE_COLUMNS = `
  id, email, full_name, company, avatar_url, role, phone, created_at, updated_at
`;

export async function findProfileById(id: string): Promise<Profile | null> {
  return queryOne<Profile>(`select ${PROFILE_COLUMNS} from profiles where id = $1`, [id]);
}

export async function findProfileByEmail(email: string): Promise<Profile | null> {
  return queryOne<Profile>(
    `select ${PROFILE_COLUMNS} from profiles where lower(email) = lower($1)`,
    [email],
  );
}

/** Whether an email is already used by a *different* profile. */
export async function isEmailTaken(email: string, excludingId?: string): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `select id from profiles
     where lower(email) = lower($1)
       and ($2::uuid is null or id <> $2::uuid)`,
    [email, excludingId ?? null],
  );
  return row !== null;
}

/** Fetch a profile together with its password hash (for sign-in). */
export async function findCredentialsByEmail(email: string): Promise<UserCredentials | null> {
  const row = await queryOne<Profile & { password_hash: string }>(
    `select ${PROFILE_COLUMNS}, password_hash
     from profiles
     where lower(email) = lower($1)`,
    [email],
  );
  if (!row) return null;

  const { password_hash, ...profile } = row;
  return { profile: profile as Profile, passwordHash: password_hash };
}

export async function createProfile(input: {
  email: string;
  passwordHash: string;
  fullName: string;
  role?: UserRole;
}): Promise<Profile> {
  const row = await queryOne<Profile>(
    `insert into profiles (email, password_hash, full_name, role)
     values ($1, $2, $3, $4)
     returning ${PROFILE_COLUMNS}`,
    [input.email, input.passwordHash, input.fullName, input.role ?? "client"],
  );
  // `returning` guarantees a row on a successful insert.
  return row as Profile;
}

export async function updateProfile(
  id: string,
  patch: Partial<ProfileAdminEditable>,
): Promise<Profile | null> {
  const fields = Object.entries(patch).filter(([, v]) => v !== undefined);
  if (fields.length === 0) {
    return findProfileById(id);
  }

  const setClauses = fields.map(([key], i) => `${key} = $${i + 1}`).join(", ");
  const values = fields.map(([, value]) => value);

  return queryOne<Profile>(
    `update profiles
     set ${setClauses}, updated_at = now()
     where id = $${fields.length + 1}
     returning ${PROFILE_COLUMNS}`,
    [...values, id],
  );
}

export async function updatePassword(id: string, passwordHash: string): Promise<void> {
  await query(
    `update profiles set password_hash = $1, updated_at = now() where id = $2`,
    [passwordHash, id],
  );
}

// ---------------------------------------------------------------------------
// Activity log
// ---------------------------------------------------------------------------

export async function logActivity(
  userId: string,
  action: string,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  await query(`insert into activity_logs (user_id, action, metadata) values ($1, $2, $3)`, [
    userId,
    action,
    JSON.stringify(metadata),
  ]);
}

