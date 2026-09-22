import { NextResponse } from "next/server";

import { createPasswordResetToken } from "@/lib/db/password-reset";
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
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 422 });
  }

  const token = await createPasswordResetToken(parsed.data.email);

  const genericResponse = {
    message: "If an account exists for that email, a reset link has been sent.",
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
