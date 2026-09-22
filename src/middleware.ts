import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

/**
 * Route protection (Edge middleware).
 *
 * Runs on the Edge runtime, so it must NOT touch the database. It only
 * verifies the signed session JWT, which carries the user id and role.
 * The authoritative check is repeated server-side (see src/lib/auth.ts).
 *
 * - `/dashboard/*`  → requires an authenticated user (any role)
 * - `/admin/*`      → requires an authenticated user with the `admin` role
 * - auth pages      → redirect logged-in users away to their dashboard
 */

const AUTH_PAGES = ["/login", "/register", "/forgot-password"];
const CLIENT_PROTECTED_PREFIXES = ["/dashboard"];
const ADMIN_PROTECTED_PREFIXES = ["/admin"];

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const isAuthPage = AUTH_PAGES.some((p) => pathname === p);
  const isAdminRoute = startsWithAny(pathname, ADMIN_PROTECTED_PREFIXES);
  const isClientRoute = startsWithAny(pathname, CLIENT_PROTECTED_PREFIXES);

  // 1. Redirect unauthenticated users away from protected routes.
  if (!session && (isAdminRoute || isClientRoute)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Redirect authenticated users away from auth pages.
  if (session && isAuthPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  // 3. Admin routes require the admin role (from the verified JWT).
  if (session && isAdminRoute && session.role !== "admin") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("error", "forbidden");
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except static assets and image optimisation.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
