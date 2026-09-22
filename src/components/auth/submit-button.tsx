"use client";

import { useFormStatus } from "react-dom";

import { Button, type ButtonProps } from "@/components/ui/button";

/**
 * Submit button that automatically shows a loading state while its parent
 * form is being submitted (works with Server Actions).
 */
export function SubmitButton({ children, ...props }: ButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} className="w-full" {...props}>
      {children}
    </Button>
  );
}
