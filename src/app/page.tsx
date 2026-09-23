import Link from "next/link";
import { redirect } from "next/navigation";

import { OrbitWordmark } from "@/components/ui/logo";
import { getSession } from "@/lib/auth";
import { getMessages } from "@/i18n/server";

/**
 * Public landing page — Orbit's marketing surface. Authenticated users are
 * sent straight to the Command Center.
 */
export default async function HomePage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  const t = getMessages();

  const features = [
    { title: t.landing.featureUsersTitle, body: t.landing.featureUsersBody },
    { title: t.landing.featureActivityTitle, body: t.landing.featureActivityBody },
    { title: t.landing.featureSecureTitle, body: t.landing.featureSecureBody },
    { title: t.landing.featureAdminTitle, body: t.landing.featureAdminBody },
  ];

  return (
    <main id="main" className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <OrbitWordmark />
        <nav className="flex items-center gap-2">
          <Link href="/login" className="btn-secondary">
            {t.landing.signIn}
          </Link>
          <Link href="/register" className="btn-primary">
            {t.landing.getStarted}
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-orbit-glow" />
        <span className="inline-flex items-center gap-2 rounded-full border border-surface-muted bg-surface-card px-3 py-1 text-xs font-medium text-zinc-400">
          <span className="h-1.5 w-1.5 rounded-full bg-orbit-gradient" />
          {t.landing.eyebrow}
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-50 sm:text-6xl">
          {t.landing.heading}
        </h1>
        <p className="mt-5 max-w-2xl text-base text-zinc-400 sm:text-lg">{t.landing.subheading}</p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href="/register" className="btn-primary">
            {t.landing.ctaGetStarted}
          </Link>
          <Link href="/login" className="btn-secondary">
            {t.landing.ctaExplore}
          </Link>
        </div>
        <p className="mt-6 text-xs uppercase tracking-widest text-zinc-500">
          {t.landing.trustedBy}
        </p>
      </section>

      {/* Feature grid */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <div key={feature.title} className="card p-6">
              <h2 className="text-sm font-semibold text-zinc-100">{feature.title}</h2>
              <p className="mt-2 text-sm text-zinc-400">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SEO copy */}
      <section className="mx-auto w-full max-w-3xl px-4 pb-20 text-sm text-zinc-400 sm:px-6 lg:px-8">
        <p>{t.landing.seoParagraph1}</p>
        <p className="mt-4">{t.landing.seoParagraph2}</p>
        <p className="mt-4">{t.landing.seoParagraph3}</p>
      </section>

      <footer className="border-t border-surface-muted px-4 py-8 text-center text-xs text-zinc-500">
        {t.footer.rights(new Date().getFullYear())}
      </footer>
    </main>
  );
}
