import "server-only";

import { query, queryOne } from "@/lib/db";
import { hashResetToken } from "@/lib/auth/tokens";
import { findProfileByEmail } from "@/lib/db/users";

/**
 * Password-reset token storage.
 *
 * We never store the raw token — only its SHA-256 hash. Tokens are single-use
 * and expire after a short window.
 */

const RESET_TOKEN_TTL_MINUTES = 60;

export async function createPasswordResetToken(email: string): Promise<string | null> {
  const profile = await findProfileByEmail(email);
  if (!profile) return null;

  // Imported lazily here to keep the token generation close to persistence.
  const { generateResetToken } = await import("@/lib/auth/tokens");
  const { token, tokenHash } = generateResetToken();

  await query(
    `insert into password_reset_tokens (user_id, token_hash, expires_at)
     values ($1, $2, now() + ($3 || ' minutes')::interval)`,
    [profile.id, tokenHash, String(RESET_TOKEN_TTL_MINUTES)],
  );

  return token;
}

/**
 * Verify a raw reset token and return the associated user id, or null.
 * Does not consume the token — call `consumePasswordResetToken` after the
 * password is successfully changed.
 */
export async function verifyPasswordResetToken(
  rawToken: string,
): Promise<{ userId: string; tokenId: string } | null> {
  const tokenHash = hashResetToken(rawToken);
  const row = await queryOne<{ id: string; user_id: string }>(
    `select id, user_id
     from password_reset_tokens
     where token_hash = $1
       and used_at is null
       and expires_at > now()`,
    [tokenHash],
  );
  if (!row) return null;
  return { userId: row.user_id, tokenId: row.id };
}

export async function consumePasswordResetToken(tokenId: string): Promise<void> {
  await query(`update password_reset_tokens set used_at = now() where id = $1`, [tokenId]);
}
