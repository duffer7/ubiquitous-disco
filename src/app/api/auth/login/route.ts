import { NextResponse } from "next/server";

import { badRequest, readJson, tooManyRequests, unauthorized, zodFieldErrors } from "@/lib/api";
import { verifyPassword } from "@/lib/auth/password";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, createSessionToken } from "@/lib/auth/session";
import { findCredentialsByEmail, logActivity } from "@/lib/db/users";
import { getMessages } from "@/i18n/server";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { signInSchema } from "@/lib/validation/auth";

/**
 * POST /api/auth/login
 *
 * Verifies credentials and issues a session cookie.
 *
 * Body: { email: string, password: string }
 */
export async function POST(request: Request) {
  const t = getMessages();

  // Throttle by IP: 10 attempts per minute.
  const limit = rateLimit(`login:${getClientIp(request)}`, { limit: 10, windowMs: 60_000 });
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  const body = await readJson(request);
  if (body === null) return badRequest(t.api.invalidJson);
  const parsed = signInSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: t.api.invalidCredentials, fieldErrors: zodFieldErrors(parsed.error) },
      { status: 400 },
    );
  }

  const credentials = await findCredentialsByEmail(parsed.data.email);
  if (!credentials) {
    // Same generic response whether the email exists or not.
    return unauthorized(t.api.invalidCredentials);
  }

  const valid = await verifyPassword(parsed.data.password, credentials.passwordHash);
  if (!valid) {
    return unauthorized(t.api.invalidCredentials);
  }

  const { profile } = credentials;
  await logActivity(profile.id, "auth.signed_in");

  const token = await createSessionToken({ userId: profile.id, role: profile.role });

  const response = NextResponse.json({
    user: {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role,
    },
  });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}

