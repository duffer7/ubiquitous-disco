import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/auth/password";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, createSessionToken } from "@/lib/auth/session";
import { createProfile, findProfileByEmail, logActivity } from "@/lib/db/users";
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
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = signUpSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "_form");
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return NextResponse.json(
      { error: "Validation failed.", fieldErrors },
      { status: 422 },
    );
  }

  const { fullName, email, password } = parsed.data;

  const existing = await findProfileByEmail(email);
  if (existing) {
    // 409 Conflict. We keep the message generic to avoid confirming accounts,
    // but registration already implies the email is taken, so this is fine.
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
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
