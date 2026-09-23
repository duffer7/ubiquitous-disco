import Link from "next/link";

import { getMessages } from "@/i18n/server";

/**
 * Layout for the (auth) route group. Redirects for already-authenticated
 * users are handled in middleware.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = getMessages();

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 items-center justify-center px-4 py-12">{children}</main>
      <footer className="px-4 py-6 text-center text-xs text-zinc-600">
        <Link href="/" className="hover:text-zinc-400">
          {t.common.appName} — {t.common.tagline}
        </Link>
      </footer>
    </div>
  );
}
