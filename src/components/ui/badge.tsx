"use client";
import { useMessages } from "@/i18n/provider";
import { cn } from "@/lib/utils";

type BadgeVariant = "neutral" | "brand" | "success" | "warning" | "danger";

const styles: Record<BadgeVariant, string> = {
  neutral: "bg-surface-muted text-zinc-300",
  brand: "bg-brand-600/20 text-brand-300",
  success: "bg-green-500/15 text-green-400",
  warning: "bg-amber-500/15 text-amber-400",
  danger: "bg-red-500/15 text-red-400",
};

export function Badge({
  variant = "neutral",
  children,
  className,
}: {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Map an application role to a badge variant + label. */
export function RoleBadge({ role }: { role: "client" | "admin" }) {
  const t = useMessages();
  return (
    <Badge variant={role === "admin" ? "brand" : "neutral"}>
      {role === "admin" ? t.roles.admin : t.roles.client}
    </Badge>
  );
}
