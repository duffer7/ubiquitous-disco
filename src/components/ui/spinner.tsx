"use client";

import { useMessages } from "@/i18n/provider";
import { cn } from "@/lib/utils";

/** Accessible loading spinner used for loading states. */
export function Spinner({ className, label }: { className?: string; label?: string }) {
  const t = useMessages();

  return (
    <span
      role="status"
      aria-label={label ?? t.common.loading}
      className={cn(
        "inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600",
        className,
      )}
    />
  );
}
