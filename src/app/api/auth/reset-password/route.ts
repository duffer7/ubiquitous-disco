import { NextResponse } from "next/server";

import { badRequest, readJson, tooManyRequests, unprocessable, zodFieldErrors } from "@/lib/api";
import { hashPassword } from "@/lib/auth/password";
import { getMessages } from "@/i18n/server";
import { resetPasswordSchema } from "@/lib/validation/auth";
import {
  consumePasswordResetToken,
  verifyPasswordResetToken,
} from "@/lib/db/password-reset";
import { logActivity, updatePassword } from "@/lib/db/users";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

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
  const t = getMessages();

  // Throttle by IP: 10 attempts per 15 minutes.
  const limit = rateLimit(`reset:${getClientIp(request)}`, { limit: 10, windowMs: 900_000 });
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  const body = await readJson(request);
  if (body === null) return badRequest(t.api.invalidJson);
  const { token, ...rest } = (body ?? {}) as { token?: string };
  if (!token) {
    return badRequest(t.api.resetMissingToken);
  }

  const parsed = resetPasswordSchema.safeParse(rest);
  if (!parsed.success) {
    return unprocessable(t.api.validationFailed, zodFieldErrors(parsed.error));
  }
  const verified = await verifyPasswordResetToken(token);
  if (!verified) {
    return NextResponse.json({ error: t.api.resetInvalid }, { status: 400 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await updatePassword(verified.userId, passwordHash);
  await consumePasswordResetToken(verified.tokenId);
  await logActivity(verified.userId, "auth.password_reset");

  return NextResponse.json({ message: t.api.passwordUpdated });
}
