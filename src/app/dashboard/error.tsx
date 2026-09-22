"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
      <h2 className="text-lg font-semibold text-slate-900">Something went wrong</h2>
      <p className="mt-1 max-w-md text-sm text-slate-500">
        We couldn&apos;t load this page. Please try again.
      </p>
      <Button className="mt-4" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
