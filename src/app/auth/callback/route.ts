import { NextResponse, type NextRequest } from "next/server";

/**
 * Legacy auth callback path.
 *
 * With the self-hosted auth flow (see /api/auth/*) there is no provider code
 * to exchange. Password reset uses /reset-password?token=…, so requests that
 * land here are sent to the dashboard (middleware handles unauthenticated
 * redirects to /login).
 */
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
