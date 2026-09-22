import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";

/**
 * Public landing page. Authenticated users are sent straight to the dashboard.
 */
export default async function HomePage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <main id="main" className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <span className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
            S
          </span>
          SaaS Dashboard
        </span>
        <nav className="flex items-center gap-2">
          <Link href="/login" className="btn-secondary">
            Sign in
          </Link>
          <Link href="/register" className="btn-primary">
            Get started
          </Link>
        </nav>
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Your product dashboard, ready to ship.
        </h1>
        <p className="mt-4 max-w-xl text-base text-slate-600">
          Authentication, protected routes and a PostgreSQL-backed data layer — built on Next.js,
          TypeScript and Supabase.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/register" className="btn-primary">
            Create an account
          </Link>
          <Link href="/login" className="btn-secondary">
            Sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
