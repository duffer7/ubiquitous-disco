"use client";

import { Button } from "@/components/ui/button";
import { useMessages } from "@/i18n/provider";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useMessages();

  // Log to the console so it surfaces in server/edge logs during development.
  console.error(error);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
      <h2 className="text-lg font-semibold text-zinc-50">{t.errors.genericTitle}</h2>
      <p className="mt-1 max-w-md text-sm text-zinc-400">{t.errors.adminMessage}</p>
      <Button className="mt-4" onClick={reset}>
        {t.common.retry}
      </Button>
    </div>
  );
}
