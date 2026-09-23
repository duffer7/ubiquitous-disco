import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { getMessages } from "@/i18n/server";

/**
 * Public landing page. Authenticated users are sent straight to the dashboard.
 */
export default async function HomePage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  const t = getMessages();

  return (
    <main id="main" className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <span className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
            S
          </span>
          {t.common.appName}
        </span>
        <nav className="flex items-center gap-2">
          <Link href="/login" className="btn-secondary">
            {t.landing.signIn}
          </Link>
          <Link href="/register" className="btn-primary">
            {t.landing.getStarted}
          </Link>
        </nav>
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          {t.landing.heading}
        </h1>
        <p className="mt-4 max-w-xl text-base text-slate-600">{t.landing.subheading}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/register" className="btn-primary">
            {t.landing.createAccount}
          </Link>
          <Link href="/login" className="btn-secondary">
            {t.landing.signIn}
          </Link>
        </div>
      </section>
    </main>
  );
}
