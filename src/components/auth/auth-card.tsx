import Link from "next/link";

import { OrbitWordmark } from "@/components/ui/logo";

/** Shared layout wrapper for all auth screens. */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main id="main" className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" aria-label="Orbit" className="text-lg">
            <OrbitWordmark markClassName="h-9 w-9 text-brand-500" />
          </Link>
        </div>

        <div className="card p-6 sm:p-8">
          <h1 className="text-xl font-semibold text-zinc-50">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>

        {footer && <div className="mt-6 text-center text-sm text-zinc-400">{footer}</div>}
      </div>
    </main>
  );
}

