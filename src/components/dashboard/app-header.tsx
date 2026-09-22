import Link from "next/link";

import { signOutAction } from "@/app/(auth)/actions";
import { initials } from "@/lib/utils";
import type { Profile } from "@/types/database.types";

/**
 * Top navigation bar for authenticated pages. Renders the user's identity and
 * a sign-out form (which posts to the signOutAction Server Action).
 */
export function AppHeader({ profile }: { profile: Profile }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
              S
            </span>
            <span className="hidden sm:inline">SaaS Dashboard</span>
          </Link>

          <nav className="flex items-center gap-1 text-sm">
            <Link
              href="/dashboard"
              className="rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/profile"
              className="rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Profile
            </Link>
            {profile.role === "admin" && (
              <Link
                href="/admin"
                className="rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-900">
              {profile.full_name || profile.email}
            </p>
            <p className="text-xs capitalize text-slate-500">{profile.role}</p>
          </div>
          <span
            aria-hidden
            className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700"
          >
            {initials(profile.full_name, profile.email)}
          </span>
          <form action={signOutAction}>
            <button type="submit" className="btn-secondary">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
