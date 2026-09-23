import { NextResponse } from "next/server";

import {
  badRequest,
  readJson,
  tooManyRequests,
  unprocessable,
  zodFieldErrors,
} from "@/lib/api";
import { hashPassword } from "@/lib/auth/password";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, createSessionToken } from "@/lib/auth/session";
import { createProfile, findProfileByEmail, logActivity } from "@/lib/db/users";
import { getMessages } from "@/i18n/server";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { signUpSchema } from "@/lib/validation/auth";

/**
 * POST /api/auth/register
 *
 * Creates a new user account. Validates the payload with the shared Zod
 * schema, hashes the password, and issues a session cookie so the user is
 * signed in immediately.
 *
 * Body: { fullName: string, email: string, password: string }
 */
export async function POST(request: Request) {
  const t = getMessages();

  // Throttle by IP: 5 sign-ups per 10 minutes.
  const limit = rateLimit(`register:${getClientIp(request)}`, { limit: 5, windowMs: 600_000 });
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  const body = await readJson(request);
  if (body === null) return badRequest(t.api.invalidJson);
  const parsed = signUpSchema.safeParse(body);
  if (!parsed.success) {
    return unprocessable(t.api.validationFailed, zodFieldErrors(parsed.error));
  }
  const { fullName, email, password } = parsed.data;

  const existing = await findProfileByEmail(email);
  if (existing) {
    // 409 Conflict. We keep the message generic to avoid confirming accounts,
    // but registration already implies the email is taken, so this is fine.
    return NextResponse.json({ error: t.api.accountExists }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const profile = await createProfile({ email, passwordHash, fullName });

  await logActivity(profile.id, "account.created", { email });

  const token = await createSessionToken({ userId: profile.id, role: profile.role });

  const response = NextResponse.json({ user: publicUser(profile) }, { status: 201 });
  setSessionCookie(response, token);
  return response;
}

function publicUser(profile: { id: string; email: string; full_name: string | null; role: string }) {
  return { id: profile.id, email: profile.email, fullName: profile.full_name, role: profile.role };
}

function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

