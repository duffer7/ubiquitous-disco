import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth/session";

/**
 * POST /auth/signout — clears the session cookie and redirects to /login.
 * Kept as a route handler (in addition to the signOutAction Server Action) so
 * standard <form method="post"> markup can use it.
 */
export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
