import { NextResponse } from "next/server";

import { badRequest, readJson, tooManyRequests, unprocessable } from "@/lib/api";
import { createPasswordResetToken } from "@/lib/db/password-reset";
import { getMessages } from "@/i18n/server";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/validation/auth";

/**
 * POST /api/auth/forgot-password
 *
 * Requests a password-reset link.
 *
 * Body: { email: string }
 *
 * Security: always returns 200 with the same message, whether or not the
 * account exists, to avoid disclosing which emails are registered.
 *
 * In development the reset URL is returned in the response so the flow can be
 * tested without a mail provider. In production it must be emailed instead —
 * see the TODO below.
 */
export async function POST(request: Request) {
  const t = getMessages();

  // Throttle by IP: 3 reset requests per 15 minutes.
  const limit = rateLimit(`forgot:${getClientIp(request)}`, { limit: 3, windowMs: 900_000 });
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  const body = await readJson(request);
  if (body === null) return badRequest(t.api.invalidJson);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return unprocessable(t.api.invalidEmail);
  }

  const token = await createPasswordResetToken(parsed.data.email);

  const genericResponse = {
    message: t.api.resetSent,
  };

  if (process.env.NODE_ENV !== "production" && token) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    return NextResponse.json({
      ...genericResponse,
      // DEV ONLY — remove/ignore this in production.
      devResetUrl: `${siteUrl}/reset-password?token=${token}`,
    });
  }

  // TODO (Stage 3): send the reset email via an SMTP/provider integration.
  return NextResponse.json(genericResponse);
}

