import { forwardRef } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger: "btn-danger",
  ghost: "btn text-slate-600 hover:bg-slate-100",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  isLoading?: boolean;
}

/**
 * Reusable button. Renders a native <button> so it can be used directly with
 * `<form action={serverAction}>` and `useFormStatus`.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", isLoading, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(variantClasses[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span
          aria-hidden
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
});
