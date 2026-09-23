import Link from "next/link";

import { OrbitWordmark } from "@/components/ui/logo";
import { getMessages } from "@/i18n/server";

export default function NotFound() {
  const t = getMessages();

  return (
    <main
      id="main"
      className="flex min-h-screen flex-col items-center justify-center px-4 text-center"
    >
      <Link href="/" aria-label="Orbit">
        <OrbitWordmark markClassName="h-10 w-10 text-brand-500" />
      </Link>
      <p className="mt-6 text-orbit-gradient text-sm font-semibold">{t.errors.notFoundCode}</p>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-50">{t.errors.notFoundTitle}</h1>
      <p className="mt-1 max-w-md text-sm text-zinc-400">{t.errors.notFoundDescription}</p>
      <Link href="/" className="btn-primary mt-6">
        {t.errors.goHome}
      </Link>
    </main>
  );
}
