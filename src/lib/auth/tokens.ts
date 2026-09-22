import "server-only";

import { randomBytes, createHash } from "node:crypto";

/**
 * Password-reset token helpers (server-only).
 *
 * Generates a URL-safe random token and its SHA-256 hash. Only the hash is
 * persisted, so a database leak does not expose usable reset tokens.
 *
 * Kept separate from ./session.ts because this uses node:crypto, which is not
 * available in the Edge runtime used by middleware.
 */

export function generateResetToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashResetToken(token) };
}

export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
