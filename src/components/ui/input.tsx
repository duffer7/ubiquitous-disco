import { forwardRef, useId } from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string[] | string;
  hint?: string;
}

/**
 * Accessible labeled text input with inline error messaging.
 * Wires up `aria-invalid` and `aria-describedby` automatically.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, className, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const messages = Array.isArray(error) ? error : error ? [error] : [];
  const describedBy = [messages.length ? errorId : null, hint ? hintId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <label htmlFor={inputId} className="label">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={cn(
          "input",
          messages.length > 0 && "border-red-500 focus:border-red-500 focus:ring-red-500",
          className,
        )}
        aria-invalid={messages.length > 0}
        aria-describedby={describedBy || undefined}
        {...props}
      />
      {hint && !messages.length && (
        <p id={hintId} className="mt-1 text-xs text-slate-500">
          {hint}
        </p>
      )}
      {messages.map((message) => (
        <p key={message} id={errorId} role="alert" className="mt-1 text-xs text-red-600">
          {message}
        </p>
      ))}
    </div>
  );
});
