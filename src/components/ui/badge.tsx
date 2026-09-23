"use client";
import { useMessages } from "@/i18n/provider";
import { cn } from "@/lib/utils";

type BadgeVariant = "neutral" | "brand" | "success" | "warning" | "danger";

const styles: Record<BadgeVariant, string> = {
  neutral: "bg-slate-100 text-slate-700",
  brand: "bg-brand-100 text-brand-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
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

