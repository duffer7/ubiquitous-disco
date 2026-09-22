import { NextResponse } from "next/server";

import { verifyPassword } from "@/lib/auth/password";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, createSessionToken } from "@/lib/auth/session";
import { findCredentialsByEmail, logActivity } from "@/lib/db/users";
import { signInSchema } from "@/lib/validation/auth";

/**
 * POST /api/auth/login
 *
 * Verifies credentials and issues a session cookie.
 *
 * Body: { email: string, password: string }
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = signInSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
  }

  const credentials = await findCredentialsByEmail(parsed.data.email);
  if (!credentials) {
    // Same generic response whether the email exists or not.
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const valid = await verifyPassword(parsed.data.password, credentials.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
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
