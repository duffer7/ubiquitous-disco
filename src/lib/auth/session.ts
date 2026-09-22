import { SignJWT, jwtVerify } from "jose";

import { getServerEnv } from "@/lib/env";
import type { UserRole } from "@/types/database.types";

/**
 * Session primitives (Edge- and Node-safe).
 *
 * A session is a signed JWT (HS256) stored in an HTTP-only cookie. It carries
 * the user id and role, so authorization checks need no extra DB round-trip.
 *
 * This module deliberately avoids Node-only APIs (e.g. node:crypto) so it can
 * be imported by the Edge middleware. Reset-token helpers live in ./tokens.ts.
 */

const JWT_ALG = "HS256";
export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(getServerEnv().JWT_SECRET);
}

export interface SessionPayload {
  userId: string;
  role: UserRole;
}

/** Sign a session JWT for the given user. */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: JWT_ALG })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

/** Verify and decode a session JWT. Returns null if invalid/expired. */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: [JWT_ALG] });
    if (!payload.sub || (payload.role !== "client" && payload.role !== "admin")) {
      return null;
    }
    return { userId: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}
