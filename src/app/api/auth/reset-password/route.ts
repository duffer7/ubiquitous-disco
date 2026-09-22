import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/auth/password";
import { resetPasswordSchema } from "@/lib/validation/auth";
import {
  consumePasswordResetToken,
  verifyPasswordResetToken,
} from "@/lib/db/password-reset";
import { logActivity, updatePassword } from "@/lib/db/users";

/**
 * POST /api/auth/reset-password
 *
 * Completes the password reset. The raw token (from the email link) is
 * verified against its stored hash, the password is updated, and the token is
 * consumed so it cannot be replayed.
 *
 * Body: { token: string, password: string, confirmPassword: string }
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { token, ...rest } = (body ?? {}) as { token?: string };
  if (!token) {
    return NextResponse.json({ error: "Missing reset token." }, { status: 400 });
  }

  const parsed = resetPasswordSchema.safeParse(rest);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "_form");
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return NextResponse.json({ error: "Validation failed.", fieldErrors }, { status: 422 });
  }

  const verified = await verifyPasswordResetToken(token);
  if (!verified) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Please request a new one." },
      { status: 400 },
    );
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await updatePassword(verified.userId, passwordHash);
  await consumePasswordResetToken(verified.tokenId);
  await logActivity(verified.userId, "auth.password_reset");

  return NextResponse.json({ message: "Password updated. You can now sign in." });
}
