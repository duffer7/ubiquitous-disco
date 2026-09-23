import Link from "next/link";

import { signOutAction } from "@/app/(auth)/actions";
import { OrbitWordmark } from "@/components/ui/logo";
import { initials } from "@/lib/utils";
import { getMessages } from "@/i18n/server";
import type { Profile } from "@/types/database.types";

/**
 * Top navigation bar for authenticated pages. Renders the user's identity and
 * a sign-out form (which posts to the signOutAction Server Action).
 */
export function AppHeader({ profile }: { profile: Profile }) {
  const t = getMessages();

  return (
    <header className="sticky top-0 z-30 border-b border-surface-muted bg-surface-card/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" aria-label="Orbit">
            <OrbitWordmark />
          </Link>

          <nav className="flex items-center gap-1 text-sm">
            <Link
              href="/dashboard"
              className="rounded-md px-3 py-2 text-zinc-400 hover:bg-surface-muted hover:text-zinc-100"
            >
              {t.nav.dashboard}
            </Link>
            <Link
              href="/dashboard/activity"
              className="rounded-md px-3 py-2 text-zinc-400 hover:bg-surface-muted hover:text-zinc-100"
            >
              {t.nav.activity}
            </Link>
            <Link
              href="/dashboard/profile"
              className="rounded-md px-3 py-2 text-zinc-400 hover:bg-surface-muted hover:text-zinc-100"
            >
              {t.nav.profile}
            </Link>
            {profile.role === "admin" && (
              <Link
                href="/admin"
                className="rounded-md px-3 py-2 text-zinc-400 hover:bg-surface-muted hover:text-zinc-100"
              >
                {t.nav.admin}
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-zinc-100">
              {profile.full_name || profile.email}
            </p>
            <p className="text-xs capitalize text-zinc-500">
              {profile.role === "admin" ? t.roles.admin : t.roles.client}
            </p>
          </div>
          <span
            aria-hidden
            className="grid h-9 w-9 place-items-center rounded-full bg-brand-600/20 text-sm font-semibold text-brand-300"
          >
            {initials(profile.full_name, profile.email)}
          </span>
          <form action={signOutAction}>
            <button type="submit" className="btn-secondary">
              {t.nav.signOut}
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
