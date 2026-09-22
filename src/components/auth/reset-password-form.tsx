"use client";

import { useFormState } from "react-dom";

import { resetPasswordAction } from "@/app/(auth)/actions";
import { initialActionState } from "@/lib/form-state";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useFormState(resetPasswordAction, initialActionState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.status === "error" && state.message && <Alert variant="error">{state.message}</Alert>}

      <input type="hidden" name="token" value={token} />

      <Input
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        required
        hint="At least 8 characters, including a letter and a number."
        error={state.fieldErrors?.password}
      />

      <Input
        label="Confirm new password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        required
        error={state.fieldErrors?.confirmPassword}
      />

      <SubmitButton>Update password</SubmitButton>
    </form>
  );
}
