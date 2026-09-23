import { cn } from "@/lib/utils";

type AlertVariant = "success" | "error" | "info";

const styles: Record<AlertVariant, string> = {
  success: "border-green-500/30 bg-green-500/10 text-green-300",
  error: "border-red-500/30 bg-red-500/10 text-red-300",
  info: "border-brand-500/30 bg-brand-500/10 text-brand-200",
};

export function Alert({
  variant = "info",
  children,
  className,
}: {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn("rounded-lg border px-4 py-3 text-sm", styles[variant], className)}
    >
      {children}
    </div>
  );
}
