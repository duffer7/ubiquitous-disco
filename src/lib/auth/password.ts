import "server-only";

import bcrypt from "bcryptjs";

/**
 * Password hashing.
 *
 * bcrypt with a per-password random salt, work factor 12. For a production
 * system at scale, consider Argon2id instead; bcrypt is used here because it
 * is dependency-light and well understood.
 */

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}
