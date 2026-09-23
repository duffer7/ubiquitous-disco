import Link from "next/link";

import { getMessages } from "@/i18n/server";

export default function NotFound() {
  const t = getMessages();

  return (
    <main
      id="main"
      className="flex min-h-screen flex-col items-center justify-center px-4 text-center"
    >
      <p className="text-sm font-medium text-brand-600">{t.errors.notFoundCode}</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">{t.errors.notFoundTitle}</h1>
      <p className="mt-1 text-sm text-slate-500">{t.errors.notFoundDescription}</p>
      <Link href="/" className="btn-primary mt-6">
        {t.errors.goHome}
      </Link>
    </main>
  );
}
