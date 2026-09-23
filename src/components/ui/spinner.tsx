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
        "inline-block h-5 w-5 animate-spin rounded-full border-2 border-surface-muted border-t-brand-500",
        className,
      )}
    />
  );
}

/**
 * Compact metric tile used across the client and admin dashboards.
 * `hint` renders a smaller caption under the value (e.g. "+3 this week").
 */
export function StatCard({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("card p-5", className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-50">{value}</p>
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

