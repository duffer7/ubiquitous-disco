import { cn } from "@/lib/utils";

type AlertVariant = "success" | "error" | "info";

const styles: Record<AlertVariant, string> = {
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-brand-200 bg-brand-50 text-brand-800",
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
