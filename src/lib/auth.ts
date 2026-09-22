import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { findProfileById } from "@/lib/db/users";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";
import type { Profile } from "@/types/database.types";

/**
 * Server-side auth helpers.
 *
 * The session is a signed JWT in an HTTP-only cookie (see lib/auth/session).
 * `getCurrentProfile` is wrapped in React `cache` so multiple components in
 * the same request share a single DB query.
 */

export const getSession = cache(async () => {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
});

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const session = await getSession();
  if (!session) return null;
  return findProfileById(session.userId);
});

/**
 * Server-side guard: redirect to /login if unauthenticated.
 * Returns the profile so callers do not need a second query.
 */
export async function requireUser(redirectTo = "/dashboard"): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(`/login?redirectedFrom=${encodeURIComponent(redirectTo)}`);
  }
  return profile;
}

/**
 * Server-side guard: require the admin role.
 * Non-admins are redirected to the client dashboard.
 */
export async function requireAdmin(redirectTo = "/admin"): Promise<Profile> {
  const profile = await requireUser(redirectTo);
  if (profile.role !== "admin") {
    redirect("/dashboard?error=forbidden");
  }
  return profile;
}

export function isAdmin(profile: Profile | null): boolean {
  return profile?.role === "admin";
}
